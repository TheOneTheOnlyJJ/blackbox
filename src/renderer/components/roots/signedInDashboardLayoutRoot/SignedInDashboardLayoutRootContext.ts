import { useOutletContext } from "react-router-dom";
import { SignedInRootContext } from "@renderer/components/roots/signedInRoot/SignedInRootContext";
import { Dispatch, SetStateAction } from "react";

export interface SignedInDashboardLayoutRootContext extends SignedInRootContext {
  appBarTitle: string;
  setAppBarTitle: Dispatch<SetStateAction<string>>;
}

export const useSignedInDashboardLayoutRootContext = (): SignedInDashboardLayoutRootContext => {
  return useOutletContext<SignedInDashboardLayoutRootContext>();
};
