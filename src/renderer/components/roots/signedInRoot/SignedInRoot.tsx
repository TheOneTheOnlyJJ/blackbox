import { FC, MutableRefObject, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AppRootContext, useAppRootContext } from "../appRoot/AppRootContext";
import { SignedInRootContext } from "./SignedInRootContext";
import Box from "@mui/material/Box/Box";
import { appLogger } from "../../../../renderer/utils/loggers";
import SignedInAppBar from "../../appBars/SignedInAppBar";
import NavigationBar from "../../navigation/NavigationBar";

const NAVIGATION_WIDTH = 240;

const SignedInRoot: FC = () => {
  const appRootContext: AppRootContext = useAppRootContext();
  const appBarRef: MutableRefObject<HTMLDivElement | null> = useRef(null);
  const [appBarHeight, setAppBarHeight] = useState<number>(0);
  const [appBarTitle, setAppBarTitle] = useState<string>("");
  const [forbiddenMessage, setForbiddenMessage] = useState<string>("");
  const updateAppBarHeight = useCallback(() => {
    if (appBarRef.current) {
      setAppBarHeight(appBarRef.current.clientHeight);
    }
  }, [appBarRef, setAppBarHeight]);

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
    // Set initial height
    updateAppBarHeight();
    // Add event listener for window resize
    window.addEventListener("resize", updateAppBarHeight);
    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener("resize", updateAppBarHeight);
    };
  }, [updateAppBarHeight]);

  return appRootContext.currentlySignedInUser !== null ? (
    <>
      <SignedInAppBar
        ref={appBarRef}
        title={appBarTitle}
        userId={appRootContext.currentlySignedInUser.id}
        username={appRootContext.currentlySignedInUser.username}
      />
      <NavigationBar userId={appRootContext.currentlySignedInUser.id} width={NAVIGATION_WIDTH} heightOffset={appBarHeight} />
      <Box
        component="main"
        position="fixed"
        sx={{
          top: `${appBarHeight.toString()}px`, // Start right below the AppBar
          left: `${NAVIGATION_WIDTH.toString()}px`, // Adjust for the navigation bar
          right: 0, // Stretch to the right edge of the viewport
          bottom: 0, // Stretch to the bottom of the viewport
          overflow: "auto"
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
