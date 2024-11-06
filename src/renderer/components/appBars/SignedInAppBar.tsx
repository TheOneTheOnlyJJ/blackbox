import AppBar from "@mui/material/AppBar/AppBar";
import IconButton from "@mui/material/IconButton/IconButton";
import Toolbar from "@mui/material/Toolbar/Toolbar";
import Typography from "@mui/material/Typography/Typography";
import { ForwardedRef, forwardRef, useMemo, useState, MouseEvent, useCallback, useEffect } from "react";
import MenuIcon from "@mui/icons-material/Menu";
import useTheme from "@mui/material/styles/useTheme";
import { Theme } from "@mui/material/styles/createTheme";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import Tooltip from "@mui/material/Tooltip/Tooltip";
import { NavigateFunction, useLocation, useNavigate, Location } from "react-router-dom";
import { appLogger } from "@renderer/utils/loggers";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";
import { ISignedInRootContext, useSignedInRootContext } from "@renderer/components/roots/signedInRoot/SignedInRootContext";
import UserAccountMenu from "../navigation/UserAccountMenu";

export interface ISignedInAppBarProps {
  title: string;
}

const SignedInAppBar = forwardRef<HTMLDivElement, ISignedInAppBarProps>(function SignedInAppBar(
  props: ISignedInAppBarProps,
  ref: ForwardedRef<HTMLDivElement>
) {
  const signedInRootContext: ISignedInRootContext = useSignedInRootContext();
  const theme: Theme = useTheme();
  const navigate: NavigateFunction = useNavigate();
  const location: Location = useLocation();
  const [userAccountMenuAnchorElement, setUserAccountMenuAnchorElement] = useState<null | HTMLElement>(null);
  const isUserAccountMenuOpen: boolean = useMemo<boolean>((): boolean => {
    return Boolean(userAccountMenuAnchorElement);
  }, [userAccountMenuAnchorElement]);
  const handleUserAccountButtonClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>): void => {
      setUserAccountMenuAnchorElement(event.currentTarget);
    },
    [setUserAccountMenuAnchorElement]
  );
  const handleUserAccountMenuClose = useCallback((): void => {
    setUserAccountMenuAnchorElement(null);
  }, [setUserAccountMenuAnchorElement]);
  const handleNavigationArrowButtonClick = useCallback(
    (direction: "back" | "forward"): void => {
      appLogger.debug(`Clicked ${direction} arrow from the App Bar.`);
      navigate(direction === "back" ? -1 : 1);
    },
    [navigate]
  );
  const [isBackDisabled, setIsBackDisabled] = useState<boolean>(false);
  const [isForwardDisabled, setIsForwardDisabled] = useState<boolean>(false);
  const updateButtonStates = useCallback((): void => {
    const STATE = window.history.state as { idx?: number } | null;
    setIsBackDisabled(location.key === "default" || STATE?.idx === 0);
    // TODO: Remove @types/dom-navigation once it becomes Baseline widely available
    setIsForwardDisabled(!window.navigation.canGoForward);
  }, [setIsBackDisabled, setIsForwardDisabled, location]);

  useEffect(() => {
    updateButtonStates();
    // Listen for popstate events
    window.addEventListener("popstate", updateButtonStates);
    return () => {
      window.removeEventListener("popstate", updateButtonStates);
    };
  }, [updateButtonStates, location]);

  return (
    <>
      <AppBar ref={ref} position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Tooltip title="Toggle menu">
            <IconButton size="large" edge="start" color="inherit" aria-label="menu" sx={{ mr: 1 }}>
              <MenuIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Go back">
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              sx={{ mr: 1 }}
              onClick={() => {
                handleNavigationArrowButtonClick("back");
              }}
              disabled={isBackDisabled}
            >
              <ArrowBackOutlinedIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Go forward">
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              sx={{ mr: 2 }}
              onClick={() => {
                handleNavigationArrowButtonClick("forward");
              }}
              disabled={isForwardDisabled}
            >
              <ArrowForwardOutlinedIcon />
            </IconButton>
          </Tooltip>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {props.title}
          </Typography>
          <Tooltip title={signedInRootContext.currentlySignedInUser.username}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              color="inherit"
              onClick={handleUserAccountButtonClick}
            >
              <AccountCircleOutlinedIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>
      {/* User account menu */}
      <UserAccountMenu
        anchorEl={userAccountMenuAnchorElement}
        open={isUserAccountMenuOpen}
        onClick={handleUserAccountMenuClose}
        onClose={handleUserAccountMenuClose}
      />
    </>
  );
});

export default SignedInAppBar;
