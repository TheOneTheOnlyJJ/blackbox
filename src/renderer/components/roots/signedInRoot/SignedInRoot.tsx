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
import Drawer from "@mui/material/Drawer/Drawer";
import List from "@mui/material/List/List";
import ListItem from "@mui/material/ListItem/ListItem";
import ListItemButton from "@mui/material/ListItemButton/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon/ListItemIcon";
import ListItemText from "@mui/material/ListItemText/ListItemText";
import { SvgIconComponent } from "@mui/icons-material";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";

const DRAWER_WIDTH = 240;

interface IDrawerItem {
  name: string;
  icon: SvgIconComponent;
}

const DRAWER_ITEMS: IDrawerItem[] = [
  {
    name: "Dashboard",
    icon: DashboardOutlinedIcon
  },
  {
    name: "Warehouse",
    icon: Inventory2OutlinedIcon
  }
];

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
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          [`& .MuiDrawer-paper`]: {
            width: DRAWER_WIDTH,
            top: appBarHeight // Ensure Drawer starts below AppBar
          }
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: "auto" }}>
          <List>
            {DRAWER_ITEMS.map((item: IDrawerItem) => (
              <ListItem key={item.name} disablePadding>
                <ListItemButton>
                  <ListItemIcon>
                    <item.icon />
                  </ListItemIcon>
                  <ListItemText primary={item.name} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
      <Box
        sx={{
          height: `calc(100vh - ${appBarHeight.toString()}px)`, // Dynamic AppBar height
          marginLeft: `${DRAWER_WIDTH.toString()}px`
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
