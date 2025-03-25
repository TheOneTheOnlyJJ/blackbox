import Box from "@mui/material/Box/Box";
import Drawer from "@mui/material/Drawer/Drawer";
import List from "@mui/material/List/List";
import ListItem from "@mui/material/ListItem/ListItem";
import ListItemButton from "@mui/material/ListItemButton/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon/ListItemIcon";
import ListItemText from "@mui/material/ListItemText/ListItemText";
import { ForwardedRef, forwardRef, useMemo } from "react";
import { SvgIconComponent } from "@mui/icons-material";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import DebouncedLink from "./DebouncedLink";
import { DASHBOARD_NAVIGATION_AREAS, DashboardNavigationArea } from "../../navigationAreas/DashboardNavigationAreas";

interface IDashboardNavigationBarDrawerItem {
  name: string;
  icon: SvgIconComponent;
  dashboardNavigationArea: DashboardNavigationArea;
  path: string;
  divider: boolean;
}

export interface IDashboardNavigationBarProps {
  width: number;
  heightOffset: number;
  signedInUserId: string;
  dashboardNavigationArea: DashboardNavigationArea | null;
}

const DashboardNavigationBar = forwardRef<HTMLDivElement, IDashboardNavigationBarProps>(function NavigationBar(
  props: IDashboardNavigationBarProps,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _: ForwardedRef<HTMLDivElement> // This is needed
) {
  const DRAWER_ITEMS: IDashboardNavigationBarDrawerItem[] = useMemo<IDashboardNavigationBarDrawerItem[]>((): IDashboardNavigationBarDrawerItem[] => {
    return [
      {
        name: "Dashboard",
        icon: DashboardOutlinedIcon,
        dashboardNavigationArea: DASHBOARD_NAVIGATION_AREAS.dashboard,
        path: `/users/${props.signedInUserId}/dashboard`,
        divider: false
      },
      {
        name: "Data Storage",
        icon: Inventory2OutlinedIcon,
        dashboardNavigationArea: DASHBOARD_NAVIGATION_AREAS.userData,
        path: `/users/${props.signedInUserId}/data/storageConfigs`,
        divider: false
      }
    ];
  }, [props.signedInUserId]);

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
          {DRAWER_ITEMS.map(
            (item: IDashboardNavigationBarDrawerItem, index: number): React.JSX.Element => (
              <ListItem key={index} disablePadding divider={item.divider}>
                <ListItemButton component={DebouncedLink} to={item.path} selected={props.dashboardNavigationArea === item.dashboardNavigationArea}>
                  <ListItemIcon>
                    <item.icon />
                  </ListItemIcon>
                  <ListItemText primary={item.name} />
                </ListItemButton>
              </ListItem>
            )
          )}
        </List>
      </Box>
    </Drawer>
  );
});

export default DashboardNavigationBar;
