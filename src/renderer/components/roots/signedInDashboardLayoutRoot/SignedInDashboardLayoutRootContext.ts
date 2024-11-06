import { useOutletContext } from "react-router-dom";
import { ISignedInRootContext } from "@renderer/components/roots/signedInRoot/SignedInRootContext";
import { Dispatch, SetStateAction } from "react";

export interface ISignedInDashboardLayoutRootContext extends ISignedInRootContext {
  appBarTitle: string;
  setAppBarTitle: Dispatch<SetStateAction<string>>;
}

export const useSignedInDashboardLayoutRootContext = (): ISignedInDashboardLayoutRootContext => {
  return useOutletContext<ISignedInDashboardLayoutRootContext>();
};
