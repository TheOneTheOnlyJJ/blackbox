import { useOutletContext } from "react-router-dom";
import { ISignedInRootContext } from "@renderer/components/roots/signedInRoot/SignedInRootContext";
import { Dispatch, SetStateAction } from "react";
import { DashboardNavigationArea } from "@renderer/navigationAreas/DashboardNavigationAreas";

export interface IDashboardLayoutRootContext extends ISignedInRootContext {
  // appBarTitle: string;
  // setAppBarTitle: Dispatch<SetStateAction<string>>;
  layout: {
    // dashboardNavigationBarWidth: number;
    dashboardAppBarHeight: number;
  };
  dashboardNavigationArea: DashboardNavigationArea | null;
  setDashboardNavigationArea: Dispatch<SetStateAction<DashboardNavigationArea | null>>;
}

export const useDashboardLayoutRootContext = (): IDashboardLayoutRootContext => {
  return useOutletContext<IDashboardLayoutRootContext>();
};
