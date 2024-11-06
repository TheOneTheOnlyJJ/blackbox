import Box from "@mui/material/Box/Box";
import Drawer from "@mui/material/Drawer/Drawer";
import List from "@mui/material/List/List";
import ListItem from "@mui/material/ListItem/ListItem";
import ListItemButton from "@mui/material/ListItemButton/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon/ListItemIcon";
import ListItemText from "@mui/material/ListItemText/ListItemText";
import { forwardRef, useMemo } from "react";
import { SvgIconComponent } from "@mui/icons-material";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import { Location, useLocation } from "react-router-dom";
import { ISignedInRootContext, useSignedInRootContext } from "@renderer/components/roots/signedInRoot/SignedInRootContext";
import DebouncedLink from "./DebouncedLink";

interface IDrawerItem {
  name: string;
  icon: SvgIconComponent;
  path: string;
  divider: boolean;
}

export interface INavigationBarProps {
  width: number;
  heightOffset: number;
}

const NavigationBar = forwardRef<HTMLDivElement, INavigationBarProps>(function NavigationBar(props: INavigationBarProps) {
  const signedInRootContext: ISignedInRootContext = useSignedInRootContext();
  const location: Location = useLocation();
  const DRAWER_ITEMS: IDrawerItem[] = useMemo<IDrawerItem[]>((): IDrawerItem[] => {
    return [
      {
        name: "Dashboard",
        icon: DashboardOutlinedIcon,
        path: `/users/${signedInRootContext.currentlySignedInUser.username}/dashboard`,
        divider: false
      },
      {
        name: "Data Storages",
        icon: Inventory2OutlinedIcon,
        path: `/users/${signedInRootContext.currentlySignedInUser.username}/userDataStorages`,
        divider: false
      }
    ];
  }, [signedInRootContext]);

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: props.width,
        [`& .MuiDrawer-paper`]: {
          width: props.width,
          boxSizing: "border-box",
          top: props.heightOffset
        }
      }}
    >
      <Box sx={{ overflow: "auto" }}>
        <List>
          {DRAWER_ITEMS.map((item: IDrawerItem, index: number) => (
            <ListItem key={index} disablePadding divider={item.divider}>
              <ListItemButton component={DebouncedLink} to={item.path} selected={location.pathname === item.path}>
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
  );
});

export default NavigationBar;
