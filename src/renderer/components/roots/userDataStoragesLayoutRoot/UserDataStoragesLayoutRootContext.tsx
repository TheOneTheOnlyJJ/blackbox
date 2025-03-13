import { useOutletContext } from "react-router-dom";
import { IDashboardLayoutRootContext } from "../dashboardLayoutRoot/DashboardLayoutRootContext";
import { UserDataStoragesNavigationArea } from "@renderer/navigationAreas/UserDataStoragesNavigationAreas";
import { Dispatch, SetStateAction } from "react";

export interface IUserDataStoragesLayoutRootContext extends IDashboardLayoutRootContext {
  layout: IDashboardLayoutRootContext["layout"] & {
    userDataStoragesNavigationbarWidth: number;
  };
  userStoragesNavigationArea: UserDataStoragesNavigationArea | null;
  setUserStoragesNavigationArea: Dispatch<SetStateAction<UserDataStoragesNavigationArea | null>>;
}

export const useUserDataStoragesLayoutRootContext = (): IUserDataStoragesLayoutRootContext => {
  return useOutletContext<IUserDataStoragesLayoutRootContext>();
};
