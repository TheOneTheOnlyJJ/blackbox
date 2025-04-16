import { DASHBOARD_NAVIGATION_AREAS, DashboardNavigationArea } from "@renderer/navigationAreas/DashboardNavigationAreas";
import { FC, useMemo } from "react";
import { ISignedInRootContext, useSignedInRootContext } from "../roots/signedInRoot/SignedInRootContext";
import { Stack, styled, Tab, TabProps, Tabs, TabsProps } from "@mui/material";
import DebouncedLink from "./DebouncedLink";
import { LinkProps } from "react-router-dom";
// import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
// import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
// import WarehouseOutlinedIcon from "@mui/icons-material/WarehouseOutlined";
// import { SvgIconComponent } from "@mui/icons-material";

export interface IDashboardAppBarNavigationItem {
  name: string;
  // icon: SvgIconComponent;
  dashboardNavigationArea: DashboardNavigationArea;
  path: string;
}

const NavigationBarTabs = styled((props: TabsProps) => {
  return (
    <Tabs
      {...props}
      slotProps={{
        indicator: { children: <span className="MuiTabs-indicatorSpan" /> }
      }}
    />
  );
})({
  "& .MuiTabs-indicator": {
    display: "flex",
    justifyContent: "center",
    backgroundColor: "transparent"
  },
  "& .MuiTabs-indicatorSpan": {
    maxWidth: "50px",
    width: "100%",
    backgroundColor: "white"
  }
});

interface NavigationBarTabProps {
  label: TabProps["label"];
  value: DashboardNavigationArea;
  to: LinkProps["to"];
}

const NavigationBarTab = styled((props: NavigationBarTabProps) => {
  return <Tab {...props} component={DebouncedLink} to={props.to} />;
})(({ theme }) => {
  return {
    textTransform: "none",
    fontWeight: theme.typography.fontWeightMedium,
    fontSize: theme.typography.pxToRem(17),
    color: "rgba(255, 255, 255, 0.7)",
    "&.Mui-selected": {
      color: "white"
    }
  };
});

export interface IDashboardAppBarNavigationTabsProps {
  dashboardNavigationArea: DashboardNavigationArea | null;
}

export const DashboardAppBarNavigationTabs: FC<IDashboardAppBarNavigationTabsProps> = (props: IDashboardAppBarNavigationTabsProps) => {
  const signedInRootContext: ISignedInRootContext = useSignedInRootContext();

  const NAVIGATION_ITEMS: IDashboardAppBarNavigationItem[] = useMemo<IDashboardAppBarNavigationItem[]>((): IDashboardAppBarNavigationItem[] => {
    return [
      {
        name: "Dashboard",
        // icon: DashboardOutlinedIcon,
        dashboardNavigationArea: DASHBOARD_NAVIGATION_AREAS.dashboard,
        path: `/users/${signedInRootContext.signedInUserInfo.userId}/dashboard`
      },
      {
        name: "Data Storages",
        // icon: WarehouseOutlinedIcon,
        dashboardNavigationArea: DASHBOARD_NAVIGATION_AREAS.dataStorages,
        path: `/users/${signedInRootContext.signedInUserInfo.userId}/data/storages/configs`
      },
      {
        name: "Boxes",
        // icon: Inventory2OutlinedIcon,
        dashboardNavigationArea: DASHBOARD_NAVIGATION_AREAS.boxes,
        path: `/users/${signedInRootContext.signedInUserInfo.userId}/data/boxes/available`
      }
    ];
  }, [signedInRootContext.signedInUserInfo]);

  return (
    <Stack direction="row" sx={{ flexGrow: 1 }}>
      <NavigationBarTabs value={props.dashboardNavigationArea}>
        {NAVIGATION_ITEMS.map((navigationItem: IDashboardAppBarNavigationItem): React.JSX.Element => {
          return (
            <NavigationBarTab
              key={navigationItem.name}
              label={navigationItem.name}
              value={navigationItem.dashboardNavigationArea}
              // icon={<navigationItem.icon />}
              to={navigationItem.path}
            />
          );
        })}
      </NavigationBarTabs>
    </Stack>
  );
};

export default DashboardAppBarNavigationTabs;
