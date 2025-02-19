import { FC, useMemo } from "react";
import Menu, { MenuProps } from "@mui/material/Menu/Menu";
import MenuItem from "@mui/material/MenuItem/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon/ListItemIcon";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import DebouncedLink from "./DebouncedLink";
import { ISignedInRootContext, useSignedInRootContext } from "../roots/signedInRoot/SignedInRootContext";
import { SvgIconComponent } from "@mui/icons-material";
import { useLocation, Location } from "react-router-dom";

interface IUserAccountMenuItem {
  name: string;
  icon: SvgIconComponent;
  path: string;
  divider: boolean;
}

type UserAccountMenuProps = Pick<MenuProps, "anchorEl" | "open" | "onClose" | "onClick">;

const UserAccountMenu: FC<UserAccountMenuProps> = (props: UserAccountMenuProps) => {
  const signedInRootContext: ISignedInRootContext = useSignedInRootContext();
  const location: Location = useLocation();
  const USER_ACCOUNT_MENU_ITEMS: IUserAccountMenuItem[] = useMemo<IUserAccountMenuItem[]>((): IUserAccountMenuItem[] => {
    return [
      {
        name: "Profile",
        icon: PersonOutlineOutlinedIcon,
        path: `/users/${signedInRootContext.currentlySignedInUser.username}/profile`,
        divider: false
      },
      {
        name: "Settings",
        icon: SettingsOutlinedIcon,
        path: `/users/${signedInRootContext.currentlySignedInUser.username}/settings`,
        divider: true
      },
      {
        name: "Sign Out",
        icon: LogoutOutlinedIcon,
        path: "/signing-out",
        divider: false
      }
    ];
  }, [signedInRootContext]);
  return (
    <Menu id="account-menu" {...props}>
      {USER_ACCOUNT_MENU_ITEMS.map(
        (item: IUserAccountMenuItem, index: number): React.JSX.Element => (
          <MenuItem key={index} component={DebouncedLink} to={item.path} selected={location.pathname === item.path} divider={item.divider}>
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
