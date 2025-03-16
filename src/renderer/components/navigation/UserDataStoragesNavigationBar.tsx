import { SvgIconComponent } from "@mui/icons-material";
import { ForwardedRef, forwardRef, useMemo } from "react";
import ViewListOutlinedIcon from "@mui/icons-material/ViewListOutlined";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import DebouncedLink from "./DebouncedLink";
import { USER_DATA_STORAGES_NAVIGATION_AREAS, UserDataStoragesNavigationArea } from "@renderer/navigationAreas/UserDataStoragesNavigationAreas";

interface IUserDataStoragesNavigationBarDrawerItem {
  name: string;
  icon: SvgIconComponent;
  userDataStoragesNavigationArea: UserDataStoragesNavigationArea;
  path: string;
  divider: boolean;
}

export interface IUserDataStoragesNavigationBarProps {
  width: number;
  leftOffset: number;
  heightOffset: number;
  signedInUserId: string;
  userStoragesNavigationArea: UserDataStoragesNavigationArea | null;
}

const UserDataStoragesNavigationBar = forwardRef<HTMLDivElement, IUserDataStoragesNavigationBarProps>(function UserDataStoragesNavigationBar(
  props: IUserDataStoragesNavigationBarProps,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _: ForwardedRef<HTMLDivElement> // This is needed
) {
  const DRAWER_ITEMS: IUserDataStoragesNavigationBarDrawerItem[] = useMemo<
    IUserDataStoragesNavigationBarDrawerItem[]
  >((): IUserDataStoragesNavigationBarDrawerItem[] => {
    return [
      {
        name: "Available Storages",
        icon: ViewListOutlinedIcon,
        userDataStoragesNavigationArea: USER_DATA_STORAGES_NAVIGATION_AREAS.storages,
        path: `/users/${props.signedInUserId}/dataStorages`,
        divider: false
      },
      {
        name: "Visibility Groups",
        icon: VisibilityIcon,
        userDataStoragesNavigationArea: USER_DATA_STORAGES_NAVIGATION_AREAS.visibilityGroups,
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
            (item: IUserDataStoragesNavigationBarDrawerItem, index: number): React.JSX.Element => (
              <ListItem key={index} disablePadding divider={item.divider}>
                <ListItemButton
                  component={DebouncedLink}
                  to={item.path}
                  selected={props.userStoragesNavigationArea === item.userDataStoragesNavigationArea}
                >
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

export default UserDataStoragesNavigationBar;
