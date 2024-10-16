import { useOutletContext } from "react-router-dom";
import { ICurrentlySignedInUser } from "@shared/user/ICurrentlySignedInUser";
import { AppRootContext } from "@renderer/components/roots/appRoot/AppRootContext";
import { Dispatch, SetStateAction } from "react";

export interface SignedInRootContext extends AppRootContext {
  currentlySignedInUser: ICurrentlySignedInUser;
  setForbiddenLocationName: Dispatch<SetStateAction<string>>;
}

export const useSignedInRootContext = (): SignedInRootContext => {
  return useOutletContext<SignedInRootContext>();
};
