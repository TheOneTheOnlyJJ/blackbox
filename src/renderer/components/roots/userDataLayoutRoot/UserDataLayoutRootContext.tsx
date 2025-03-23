import { useOutletContext } from "react-router-dom";
import { IDashboardLayoutRootContext } from "../dashboardLayoutRoot/DashboardLayoutRootContext";
import { UserDataNavigationArea } from "@renderer/navigationAreas/UserDataStoragesNavigationAreas";
import { Dispatch, SetStateAction } from "react";

export interface IUserDataLayoutRootContext extends IDashboardLayoutRootContext {
  layout: IDashboardLayoutRootContext["layout"] & {
    userDataNavigationbarWidth: number;
  };
  userDataNavigationArea: UserDataNavigationArea | null;
  setUserDataNavigationArea: Dispatch<SetStateAction<UserDataNavigationArea | null>>;
}

export const useUserDataLayoutRootContext = (): IUserDataLayoutRootContext => {
  return useOutletContext<IUserDataLayoutRootContext>();
};
