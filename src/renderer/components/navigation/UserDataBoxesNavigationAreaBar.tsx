import { SvgIconComponent } from "@mui/icons-material";
import { ForwardedRef, forwardRef, useMemo } from "react";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import SchemaOutlinedIcon from "@mui/icons-material/SchemaOutlined";
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import DebouncedLink from "./DebouncedLink";
import { USER_DATA_BOXES_NAVIGATION_AREAS, UserDataBoxesNavigationArea } from "@renderer/navigationAreas/UserDataBoxesNavigationAreas";

interface IUserDataBoxesNavigationAreaBarDrawerItem {
  name: string;
  icon: SvgIconComponent;
  userDataBoxesNavigationArea: UserDataBoxesNavigationArea;
  path: string;
  divider: boolean;
}

export interface IUserDataBoxesNavigationAreaBarProps {
  width: number;
  leftOffset: number;
  heightOffset: number;
  signedInUserId: string;
  userDataBoxesNavigationArea: UserDataBoxesNavigationArea | null;
}

const UserDataBoxesNavigationAreaBar = forwardRef<HTMLDivElement, IUserDataBoxesNavigationAreaBarProps>(function UserDataBoxesNavigationAreaBar(
  props: IUserDataBoxesNavigationAreaBarProps,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _: ForwardedRef<HTMLDivElement> // This is needed
) {
  const DRAWER_ITEMS: IUserDataBoxesNavigationAreaBarDrawerItem[] = useMemo<
    IUserDataBoxesNavigationAreaBarDrawerItem[]
  >((): IUserDataBoxesNavigationAreaBarDrawerItem[] => {
    return [
      {
        name: "Boxes",
        icon: Inventory2OutlinedIcon,
        userDataBoxesNavigationArea: USER_DATA_BOXES_NAVIGATION_AREAS.availableBoxes,
        path: `/users/${props.signedInUserId}/data/boxes/available`,
        divider: false
      },
      {
        name: "Templates",
        icon: SchemaOutlinedIcon,
        userDataBoxesNavigationArea: USER_DATA_BOXES_NAVIGATION_AREAS.availableTemplates,
        path: `/users/${props.signedInUserId}/data/boxes/templates`,
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
            (item: IUserDataBoxesNavigationAreaBarDrawerItem, index: number): React.JSX.Element => (
              <ListItem key={index} disablePadding divider={item.divider}>
                <ListItemButton
                  component={DebouncedLink}
                  to={item.path}
                  selected={props.userDataBoxesNavigationArea === item.userDataBoxesNavigationArea}
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

export default UserDataBoxesNavigationAreaBar;
