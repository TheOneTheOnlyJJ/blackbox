import { SvgIconComponent } from "@mui/icons-material";
import { ForwardedRef, forwardRef, useMemo } from "react";
import ViewListOutlinedIcon from "@mui/icons-material/ViewListOutlined";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import DebouncedLink from "./DebouncedLink";
import { USER_DATA_NAVIGATION_AREAS, UserDataNavigationArea } from "@renderer/navigationAreas/UserDataStoragesNavigationAreas";

interface IUserDataNavigationBarDrawerItem {
  name: string;
  icon: SvgIconComponent;
  userDataNavigationArea: UserDataNavigationArea;
  path: string;
  divider: boolean;
}

export interface IUserDataNavigationBarProps {
  width: number;
  leftOffset: number;
  heightOffset: number;
  signedInUserId: string;
  userStoragesNavigationArea: UserDataNavigationArea | null;
}

const UserDataNavigationBar = forwardRef<HTMLDivElement, IUserDataNavigationBarProps>(function UserDataNavigationBar(
  props: IUserDataNavigationBarProps,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _: ForwardedRef<HTMLDivElement> // This is needed
) {
  const DRAWER_ITEMS: IUserDataNavigationBarDrawerItem[] = useMemo<IUserDataNavigationBarDrawerItem[]>((): IUserDataNavigationBarDrawerItem[] => {
    return [
      {
        name: "Available Storages",
        icon: ViewListOutlinedIcon,
        userDataNavigationArea: USER_DATA_NAVIGATION_AREAS.availableStorages,
        path: `/users/${props.signedInUserId}/dataStorages`,
        divider: false
      },
      {
        name: "Visibility Groups",
        icon: VisibilityIcon,
        userDataNavigationArea: USER_DATA_NAVIGATION_AREAS.visibilityGroups,
        path: `/users/${props.signedInUserId}/dataStorages/visibilityGroups`,
        divider: false
      }
    ];
  }, [props.signedInUserId]);

  return (
    <Drawer
      variant="permanent"
      sx={{
        left: props.leftOffset,
        width: props.width,
        [`& .MuiDrawer-paper`]: {
          left: props.leftOffset,
          width: props.width,
          boxSizing: "border-box",
          top: props.heightOffset
        }
      }}
    >
      <Box sx={{ overflow: "auto" }}>
        <List>
          {DRAWER_ITEMS.map(
            (item: IUserDataNavigationBarDrawerItem, index: number): React.JSX.Element => (
              <ListItem key={index} disablePadding divider={item.divider}>
                <ListItemButton component={DebouncedLink} to={item.path} selected={props.userStoragesNavigationArea === item.userDataNavigationArea}>
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

export default UserDataNavigationBar;
