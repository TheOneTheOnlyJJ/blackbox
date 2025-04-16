import { useOutletContext } from "react-router-dom";
import { IDashboardLayoutRootContext } from "../dashboardLayoutRoot/DashboardLayoutRootContext";
import { Dispatch, SetStateAction } from "react";
import { UserDataBoxesNavigationArea } from "@renderer/navigationAreas/UserDataBoxesNavigationAreas";

export interface IUserDataBoxesNavigationAreaLayoutRootContext extends IDashboardLayoutRootContext {
  layout: IDashboardLayoutRootContext["layout"] & {
    userDataBoxesNavigationAreaBarWidth: number;
  };
  userDataBoxesNavigationArea: UserDataBoxesNavigationArea | null;
  setUserDataBoxesNavigationArea: Dispatch<SetStateAction<UserDataBoxesNavigationArea | null>>;
}

export const useUserDataBoxesNavigationAreaLayoutRootContext = (): IUserDataBoxesNavigationAreaLayoutRootContext => {
  return useOutletContext<IUserDataBoxesNavigationAreaLayoutRootContext>();
};
