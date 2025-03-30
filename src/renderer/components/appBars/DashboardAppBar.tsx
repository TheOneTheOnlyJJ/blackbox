import AppBar from "@mui/material/AppBar/AppBar";
import IconButton from "@mui/material/IconButton/IconButton";
import Toolbar from "@mui/material/Toolbar/Toolbar";
import { ForwardedRef, forwardRef, useMemo, useState, MouseEvent, useCallback } from "react";
import useTheme from "@mui/material/styles/useTheme";
import { Theme } from "@mui/material/styles/createTheme";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import Tooltip from "@mui/material/Tooltip/Tooltip";
import { ISignedInRootContext, useSignedInRootContext } from "@renderer/components/roots/signedInRoot/SignedInRootContext";
import UserAccountMenu from "../navigation/UserAccountMenu";
import { DashboardNavigationArea } from "@renderer/navigationAreas/DashboardNavigationAreas";
import HistoryNavigationArrows from "../navigation/HistoryNavigationArrows";
import DashboardAppBarNavigationTabs from "../navigation/DashboardAppBarNavigationTabs";

export interface IDashboardAppBarProps {
  dashboardNavigationArea: DashboardNavigationArea | null;
}

const DashboardAppBar = forwardRef<HTMLDivElement, IDashboardAppBarProps>(function SignedInAppBar(
  props: IDashboardAppBarProps,
  ref: ForwardedRef<HTMLDivElement>
) {
  const signedInRootContext: ISignedInRootContext = useSignedInRootContext();

  const theme: Theme = useTheme();

  const [userAccountMenuAnchorElement, setUserAccountMenuAnchorElement] = useState<null | HTMLElement>(null);

  const isUserAccountMenuOpen: boolean = useMemo<boolean>((): boolean => {
    return Boolean(userAccountMenuAnchorElement);
  }, [userAccountMenuAnchorElement]);

  const handleUserAccountButtonClick = useCallback((event: MouseEvent<HTMLButtonElement>): void => {
    setUserAccountMenuAnchorElement(event.currentTarget);
  }, []);

  const handleUserAccountMenuClose = useCallback((): void => {
    setUserAccountMenuAnchorElement(null);
  }, []);

  return (
    <>
      <AppBar ref={ref} position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <HistoryNavigationArrows />
          {/* <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {props.title}
          </Typography> */}
          <DashboardAppBarNavigationTabs dashboardNavigationArea={props.dashboardNavigationArea} />
          <Tooltip title={signedInRootContext.signedInUserInfo.username}>
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
      <UserAccountMenu
        anchorEl={userAccountMenuAnchorElement}
        open={isUserAccountMenuOpen}
        onClick={handleUserAccountMenuClose}
        onClose={handleUserAccountMenuClose}
        dashboardNavigationArea={props.dashboardNavigationArea}
      />
    </>
  );
});

export default DashboardAppBar;
