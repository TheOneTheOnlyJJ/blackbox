import { FC, useMemo } from "react";
import Menu, { MenuProps } from "@mui/material/Menu/Menu";
import MenuItem from "@mui/material/MenuItem/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon/ListItemIcon";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import DebouncedLink from "./DebouncedLink";
import { SvgIconComponent } from "@mui/icons-material";
import { DASHBOARD_NAVIGATION_AREAS, DashboardNavigationArea } from "@renderer/navigationAreas/DashboardNavigationAreas";

interface IUserAccountMenuItem {
  name: string;
  icon: SvgIconComponent;
  dashboardNavigationArea?: DashboardNavigationArea;
  path: string;
  divider: boolean;
}

export interface IUserAccountMenuProps {
  anchorEl: MenuProps["anchorEl"];
  open: MenuProps["open"];
  onClose: MenuProps["onClose"];
  onClick: MenuProps["onClick"];
  signedInUserId: string;
  dashboardNavigationArea: DashboardNavigationArea | null;
}

const UserAccountMenu: FC<IUserAccountMenuProps> = (props: IUserAccountMenuProps) => {
  const { signedInUserId, dashboardNavigationArea, ...menuProps } = props;
  const USER_ACCOUNT_MENU_ITEMS: IUserAccountMenuItem[] = useMemo<IUserAccountMenuItem[]>((): IUserAccountMenuItem[] => {
    return [
      {
        name: "Profile",
        icon: PersonOutlineOutlinedIcon,
        dashboardNavigationArea: DASHBOARD_NAVIGATION_AREAS.profile,
        path: `/users/${signedInUserId}/profile`,
        divider: false
      },
      {
        name: "Settings",
        icon: SettingsOutlinedIcon,
        dashboardNavigationArea: DASHBOARD_NAVIGATION_AREAS.settings,
        path: `/users/${signedInUserId}/settings`,
        divider: true
      },
      {
        name: "Sign Out",
        icon: LogoutOutlinedIcon,
        path: "/signout",
        divider: false
      }
    ];
  }, [signedInUserId]);

  return (
    <Menu id="account-menu" {...menuProps}>
      {USER_ACCOUNT_MENU_ITEMS.map(
        (item: IUserAccountMenuItem, index: number): React.JSX.Element => (
          <MenuItem
            key={index}
            component={DebouncedLink}
            to={item.path}
            selected={dashboardNavigationArea === item.dashboardNavigationArea}
            divider={item.divider}
          >
            <ListItemIcon>
              <item.icon fontSize="small" />
            </ListItemIcon>
            {item.name}
          </MenuItem>
        )
      )}
    </Menu>
  );
};

export default UserAccountMenu;
