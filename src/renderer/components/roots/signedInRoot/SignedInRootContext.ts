import { useOutletContext } from "react-router-dom";
import { ICurrentlySignedInUser } from "../../../../shared/user/ICurrentlySignedInUser";
import { AppRootContext } from "../appRoot/AppRootContext";
import { Dispatch, SetStateAction } from "react";

export interface SignedInRootContext extends AppRootContext {
  currentlySignedInUser: ICurrentlySignedInUser;
  appBarTitle: string;
  setAppBarTitle: Dispatch<SetStateAction<string>>;
}

export const useSignedInRootContext = (): SignedInRootContext => {
  return useOutletContext<SignedInRootContext>();
};
