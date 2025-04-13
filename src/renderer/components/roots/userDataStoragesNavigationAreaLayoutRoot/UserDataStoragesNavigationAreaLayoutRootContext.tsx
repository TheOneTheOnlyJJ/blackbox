import { useOutletContext } from "react-router-dom";
import { IDashboardLayoutRootContext } from "../dashboardLayoutRoot/DashboardLayoutRootContext";
import { UserDataStoragesNavigationArea } from "@renderer/navigationAreas/UserDataStoragesNavigationAreas";
import { Dispatch, SetStateAction } from "react";

export interface IUserDataStoragesNavigationAreaLayoutRootContext extends IDashboardLayoutRootContext {
  layout: IDashboardLayoutRootContext["layout"] & {
    userDataStoragesNavigationAreaBarWidth: number;
  };
  userDataStoragesNavigationArea: UserDataStoragesNavigationArea | null;
  setUserDataStoragesNavigationArea: Dispatch<SetStateAction<UserDataStoragesNavigationArea | null>>;
}

export const useUserDataStoragesNavigationAreaLayoutRootContext = (): IUserDataStoragesNavigationAreaLayoutRootContext => {
  return useOutletContext<IUserDataStoragesNavigationAreaLayoutRootContext>();
};
