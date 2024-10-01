import AppBar from "@mui/material/AppBar/AppBar";
import IconButton from "@mui/material/IconButton/IconButton";
import Toolbar from "@mui/material/Toolbar/Toolbar";
import Typography from "@mui/material/Typography/Typography";
import { ForwardedRef, forwardRef, useMemo, useState, MouseEvent } from "react";
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
import { NavigateFunction, useNavigate } from "react-router-dom";
import { appLogger } from "../../../renderer/utils/loggers";

export interface ISignedInAppBarProps {
  title: string;
  userId: string;
  username: string;
}

const SignedInAppBar = forwardRef<HTMLDivElement, ISignedInAppBarProps>(function SignedInAppBar(
  props: ISignedInAppBarProps,
  ref: ForwardedRef<HTMLDivElement>
) {
  const theme: Theme = useTheme();
  const navigate: NavigateFunction = useNavigate();
  const [accountMenuAnchorElement, setAccountMenuAnchorElement] = useState<null | HTMLElement>(null);
  const isAccountMenuOpen: boolean = useMemo<boolean>(() => {
    return Boolean(accountMenuAnchorElement);
  }, [accountMenuAnchorElement]);
  const handleAccountButtonClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAccountMenuAnchorElement(event.currentTarget);
  };
  const handleAccountMenuClose = () => {
    setAccountMenuAnchorElement(null);
  };
  return (
    <>
      <AppBar ref={ref} position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton size="large" edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {props.title}
          </Typography>
          <Tooltip title={props.username}>
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
        <MenuItem
          onClick={() => {
            appLogger.debug("Clicked Profile button from account menu.");
            navigate(`/users/${props.userId}/profile`);
          }}
        >
          <ListItemIcon>
            <PersonOutlineOutlinedIcon fontSize="small" />
          </ListItemIcon>
          Profile
        </MenuItem>
        <MenuItem
          onClick={() => {
            appLogger.debug("Clicked Settings button from account menu.");
            navigate(`/users/${props.userId}/settings`);
          }}
        >
          <ListItemIcon>
            <SettingsOutlinedIcon fontSize="small" />
          </ListItemIcon>
          Settings
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            appLogger.debug("Clicked Sign Out button from account menu.");
            navigate("/signing-out");
          }}
        >
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
