import Typography from "@mui/material/Typography/Typography";
import { FC, MutableRefObject, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AppRootContext, useAppRootContext } from "../appRoot/AppRootContext";
import AppBar from "@mui/material/AppBar/AppBar";
import { SignedInRootContext } from "./SignedInRootContext";
import Toolbar from "@mui/material/Toolbar/Toolbar";
import IconButton from "@mui/material/IconButton/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import Box from "@mui/material/Box/Box";
import { appLogger } from "../../../../renderer/utils/loggers";

const SignedInRoot: FC = () => {
  const appRootContext: AppRootContext = useAppRootContext();
  const appBarRef: MutableRefObject<HTMLDivElement | null> = useRef(null);
  const [appBarHeight, setAppBarHeight] = useState<number>(0);
  const [appBarTitle, setAppBarTitle] = useState<string>("");
  const [forbiddenMessage, setForbiddenMessage] = useState<string>("");

  useEffect(() => {
    appLogger.silly(`Updated App Bar height: ${appBarHeight.toString()}.`);
  }, [appBarHeight]);

  useEffect(() => {
    try {
      setForbiddenMessage(`must-be-signed-in-to-access-${encodeURIComponent(appBarTitle)}`);
    } catch (err: unknown) {
      const ERROR_MESSAGE = err instanceof Error ? err.message : String(err);
      appLogger.error(`Could not set forbidden message: ${ERROR_MESSAGE}!`);
      setForbiddenMessage("must-be-signed-in-to-access-this-page");
    }
  }, [appBarTitle, setForbiddenMessage]);

  // Measure the AppBar's height after it renders
  useLayoutEffect(() => {
    if (appBarRef.current) {
      setAppBarHeight(appBarRef.current.clientHeight);
    }
  }, []);

  return appRootContext.currentlySignedInUser !== null ? (
    <>
      <AppBar ref={appBarRef} position="static">
        <Toolbar>
          <IconButton size="large" edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div">
            {appBarTitle}
          </Typography>
        </Toolbar>
      </AppBar>
      <Box
        sx={{
          height: `calc(100vh - ${appBarHeight.toString()}px)` // Dynamic AppBar height
        }}
      >
        <Outlet
          context={
            {
              ...appRootContext,
              currentlySignedInUser: appRootContext.currentlySignedInUser,
              appBarTitle: appBarTitle,
              setAppBarTitle: setAppBarTitle
            } satisfies SignedInRootContext
          }
        />
      </Box>
    </>
  ) : (
    <Navigate to={`/forbidden/${forbiddenMessage}`} />
  );
};

export default SignedInRoot;
