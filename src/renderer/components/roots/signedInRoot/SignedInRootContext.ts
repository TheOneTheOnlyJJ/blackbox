import { useOutletContext } from "react-router-dom";
import { ISignedInUser } from "@shared/user/account/SignedInUser";
import { IAppRootContext } from "@renderer/components/roots/appRoot/AppRootContext";
import { Dispatch, SetStateAction } from "react";

export interface ISignedInRootContext extends IAppRootContext {
  signedInUser: ISignedInUser;
  setForbiddenLocationName: Dispatch<SetStateAction<string>>;
}

export const useSignedInRootContext = (): ISignedInRootContext => {
  return useOutletContext<ISignedInRootContext>();
};
