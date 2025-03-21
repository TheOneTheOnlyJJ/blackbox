import { useOutletContext } from "react-router-dom";
import { IDashboardLayoutRootContext } from "../dashboardLayoutRoot/DashboardLayoutRootContext";
import { UserDataNavigationArea } from "@renderer/navigationAreas/UserDataStoragesNavigationAreas";
import { Dispatch, SetStateAction } from "react";

export interface IUserDataStoragesLayoutRootContext extends IDashboardLayoutRootContext {
  layout: IDashboardLayoutRootContext["layout"] & {
    userDataStoragesNavigationbarWidth: number;
  };
  userStoragesNavigationArea: UserDataNavigationArea | null;
  setUserStoragesNavigationArea: Dispatch<SetStateAction<UserDataNavigationArea | null>>;
}

export const useUserDataStoragesLayoutRootContext = (): IUserDataStoragesLayoutRootContext => {
  return useOutletContext<IUserDataStoragesLayoutRootContext>();
};
