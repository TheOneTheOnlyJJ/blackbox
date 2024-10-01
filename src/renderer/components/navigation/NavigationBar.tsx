import Box from "@mui/material/Box/Box";
import Drawer from "@mui/material/Drawer/Drawer";
import List from "@mui/material/List/List";
import ListItem from "@mui/material/ListItem/ListItem";
import ListItemButton from "@mui/material/ListItemButton/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon/ListItemIcon";
import ListItemText from "@mui/material/ListItemText/ListItemText";
import Toolbar from "@mui/material/Toolbar/Toolbar";
import { FC } from "react";
import { SvgIconComponent } from "@mui/icons-material";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import { Link, useLocation } from "react-router-dom";

interface IDrawerItem {
  name: string;
  icon: SvgIconComponent;
  path: string;
}

const DRAWER_ITEMS: IDrawerItem[] = [
  {
    name: "Dashboard",
    icon: DashboardOutlinedIcon,
    path: "dashboard"
  },
  {
    name: "Stash",
    icon: Inventory2OutlinedIcon,
    path: "stash"
  }
];

export interface INavigationBarProps {
  userId: string;
  width: number;
  heightOffset: number;
}

const NavigationBar: FC<INavigationBarProps> = (props: INavigationBarProps) => {
  const location = useLocation();
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
      <Toolbar />
      <Box sx={{ overflow: "auto" }}>
        <List>
          {DRAWER_ITEMS.map((item: IDrawerItem) => (
            <ListItem key={item.name} disablePadding>
              <ListItemButton
                component={Link}
                to={`/users/${props.userId}/${item.path}`}
                selected={location.pathname === `/users/${props.userId}/${item.path}`}
              >
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
};

export default NavigationBar;
