import Box from "@mui/material/Box/Box";
import { FC, MutableRefObject, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { SignedInRootContext, useSignedInRootContext } from "../signedInRoot/SignedInRootContext";
import SignedInAppBar from "../../appBars/SignedInAppBar";
import NavigationBar from "../../navigation/NavigationBar";
import { Outlet } from "react-router-dom";
import { appLogger } from "../../../utils/loggers";
import { SignedInDashboardLayoutRootContext } from "./SignedInDashboardLayoutRootContext";

const DEFAULT_DRAWER_WIDTH = 240;

const SignedInDashboardLayoutRoot: FC = () => {
  const signedInRootContext: SignedInRootContext = useSignedInRootContext();
  const appBarRef: MutableRefObject<HTMLDivElement | null> = useRef(null);
  const drawerRef: MutableRefObject<HTMLDivElement | null> = useRef(null);
  const [appBarHeight, setAppBarHeight] = useState<number>(0);
  const [appBarTitle, setAppBarTitle] = useState<string>("");
  const [drawerWidth, setDrawerWidth] = useState<number>(DEFAULT_DRAWER_WIDTH);

  const updateAppBarHeight = useCallback(() => {
    if (appBarRef.current) {
      setAppBarHeight(appBarRef.current.clientHeight);
    }
  }, [appBarRef, setAppBarHeight]);

  const updateDrawerWidth = useCallback(() => {
    if (drawerRef.current) {
      setDrawerWidth(drawerRef.current.clientWidth);
    }
  }, [drawerRef, setDrawerWidth]);

  const updateComponentDimensions = useCallback(() => {
    updateAppBarHeight();
    updateDrawerWidth();
  }, [updateAppBarHeight, updateDrawerWidth]);

  useEffect(() => {
    appLogger.silly(`Updated App Bar height: ${appBarHeight.toString()}.`);
  }, [appBarHeight]);

  useEffect(() => {
    appLogger.silly(`Updated Drawer width: ${drawerWidth.toString()}.`);
  }, [drawerWidth]);

  // Measure the necessary component dimensions
  useLayoutEffect(() => {
    // Set initial dimensions
    updateComponentDimensions();
    // Add event listener for window resize
    window.addEventListener("resize", updateComponentDimensions);
    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener("resize", updateComponentDimensions);
    };
  }, [updateComponentDimensions]);

  useEffect(() => {
    appLogger.debug("Rendering Signed In Dashboard Layout Root component.");
  }, []);

  return (
    <>
      <SignedInAppBar ref={appBarRef} title={appBarTitle} />
      <NavigationBar ref={drawerRef} width={drawerWidth} heightOffset={appBarHeight} />
      <Box
        component="main"
        position="fixed"
        sx={{
          top: appBarHeight, // Start right below the AppBar
          left: drawerWidth, // Adjust for the navigation bar
          right: 0, // Stretch to the right edge of the viewport
          bottom: 0, // Stretch to the bottom of the viewport
          overflow: "auto"
        }}
      >
        <Outlet context={{ ...signedInRootContext, appBarTitle, setAppBarTitle } satisfies SignedInDashboardLayoutRootContext} />
      </Box>
    </>
  );
};

export default SignedInDashboardLayoutRoot;
