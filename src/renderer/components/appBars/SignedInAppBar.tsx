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
import Menu from "@mui/material/Menu/Menu";
import MenuItem from "@mui/material/MenuItem/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon/ListItemIcon";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import Divider from "@mui/material/Divider/Divider";
import { NavigateFunction, useLocation, useNavigate, Location, Link } from "react-router-dom";
import { appLogger } from "../../../renderer/utils/loggers";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";
import { SignedInRootContext, useSignedInRootContext } from "../roots/signedInRoot/SignedInRootContext";

export interface ISignedInAppBarProps {
  title: string;
}

const SignedInAppBar = forwardRef<HTMLDivElement, ISignedInAppBarProps>(function SignedInAppBar(
  props: ISignedInAppBarProps,
  ref: ForwardedRef<HTMLDivElement>
) {
  const signedInRootContext: SignedInRootContext = useSignedInRootContext();
  const theme: Theme = useTheme();
  const navigate: NavigateFunction = useNavigate();
  const location: Location = useLocation();
  const [accountMenuAnchorElement, setAccountMenuAnchorElement] = useState<null | HTMLElement>(null);
  const isAccountMenuOpen: boolean = useMemo<boolean>(() => {
    return Boolean(accountMenuAnchorElement);
  }, [accountMenuAnchorElement]);
  const handleAccountButtonClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      setAccountMenuAnchorElement(event.currentTarget);
    },
    [setAccountMenuAnchorElement]
  );
  const handleAccountMenuClose = useCallback(() => {
    setAccountMenuAnchorElement(null);
  }, [setAccountMenuAnchorElement]);
  const handleNavigationArrowButtonClick = useCallback(
    (direction: "back" | "forward") => {
      appLogger.debug(`Clicked ${direction} arrow from the App Bar.`);
      navigate(direction === "back" ? -1 : 1);
    },
    [navigate]
  );
  const [isBackDisabled, setIsBackDisabled] = useState<boolean>(false);
  const [isForwardDisabled, setIsForwardDisabled] = useState<boolean>(false);
  const updateButtonStates = useCallback(() => {
    const state = window.history.state as { idx?: number } | null;
    setIsBackDisabled(location.key === "default" || state?.idx === 0);
    setIsForwardDisabled(state?.idx === window.history.length - 1);
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
              onClick={handleAccountButtonClick}
            >
              <AccountCircleOutlinedIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>
      {/* Account menu */}
      <Menu
        anchorEl={accountMenuAnchorElement}
        id="account-menu"
        open={isAccountMenuOpen}
        onClose={handleAccountMenuClose}
        onClick={handleAccountMenuClose}
      >
        <MenuItem component={Link} to={`/users/${signedInRootContext.currentlySignedInUser.id}/profile`}>
          <ListItemIcon>
            <PersonOutlineOutlinedIcon fontSize="small" />
          </ListItemIcon>
          Profile
        </MenuItem>
        <MenuItem component={Link} to={`/users/${signedInRootContext.currentlySignedInUser.id}/settings`}>
          <ListItemIcon>
            <SettingsOutlinedIcon fontSize="small" />
          </ListItemIcon>
          Settings
        </MenuItem>
        <Divider />
        <MenuItem component={Link} to={`/signing-out`}>
          <ListItemIcon>
            <LogoutOutlinedIcon fontSize="small" />
          </ListItemIcon>
          Sign Out
        </MenuItem>
      </Menu>
    </>
  );
});

export default SignedInAppBar;
