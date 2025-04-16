import { SvgIconComponent } from "@mui/icons-material";
import { ForwardedRef, forwardRef, useMemo } from "react";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DataObjectIcon from "@mui/icons-material/DataObject";
import StorageOutlinedIcon from "@mui/icons-material/StorageOutlined";
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import DebouncedLink from "./DebouncedLink";
import { USER_DATA_STORAGES_NAVIGATION_AREAS, UserDataStoragesNavigationArea } from "@renderer/navigationAreas/UserDataStoragesNavigationAreas";

interface IUserDataStoragesNavigationAreaBarDrawerItem {
  name: string;
  icon: SvgIconComponent;
  userDataStoragesNavigationArea: UserDataStoragesNavigationArea;
  path: string;
  divider: boolean;
}

export interface IUserDataStoragesNavigationAreaBarProps {
  width: number;
  leftOffset: number;
  heightOffset: number;
  signedInUserId: string;
  userDataStoragesNavigationArea: UserDataStoragesNavigationArea | null;
}

const UserDataStoragesNavigationAreaBar = forwardRef<HTMLDivElement, IUserDataStoragesNavigationAreaBarProps>(
  function UserDataStoragesNavigationAreaBar(
    props: IUserDataStoragesNavigationAreaBarProps,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _: ForwardedRef<HTMLDivElement> // This is needed
  ) {
    const DRAWER_ITEMS: IUserDataStoragesNavigationAreaBarDrawerItem[] = useMemo<
      IUserDataStoragesNavigationAreaBarDrawerItem[]
    >((): IUserDataStoragesNavigationAreaBarDrawerItem[] => {
      return [
        {
          name: "Configurations",
          icon: DataObjectIcon,
          userDataStoragesNavigationArea: USER_DATA_STORAGES_NAVIGATION_AREAS.storageConfigs,
          path: `/users/${props.signedInUserId}/data/storages/configs`,
          divider: false
        },
        {
          name: "Active",
          icon: StorageOutlinedIcon,
          userDataStoragesNavigationArea: USER_DATA_STORAGES_NAVIGATION_AREAS.initialisedStorages,
          path: `/users/${props.signedInUserId}/data/storages/initialised`,
          divider: false
        },
        {
          name: "Visibility Groups",
          icon: VisibilityIcon,
          userDataStoragesNavigationArea: USER_DATA_STORAGES_NAVIGATION_AREAS.visibilityGroups,
          path: `/users/${props.signedInUserId}/data/storages/visibilityGroups`,
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
              (item: IUserDataStoragesNavigationAreaBarDrawerItem, index: number): React.JSX.Element => (
                <ListItem key={index} disablePadding divider={item.divider}>
                  <ListItemButton
                    component={DebouncedLink}
                    to={item.path}
                    selected={props.userDataStoragesNavigationArea === item.userDataStoragesNavigationArea}
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
  }
);

export default UserDataStoragesNavigationAreaBar;
