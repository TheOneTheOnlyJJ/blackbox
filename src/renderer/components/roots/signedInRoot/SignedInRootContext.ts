import { useOutletContext } from "react-router-dom";
import { IAppRootContext } from "@renderer/components/roots/appRoot/AppRootContext";
import { Dispatch, SetStateAction } from "react";
import { IPublicSignedInUser } from "@shared/user/account/PublicSignedInUser";

export interface ISignedInRootContext extends IAppRootContext {
  signedInUser: IPublicSignedInUser;
  setForbiddenLocationName: Dispatch<SetStateAction<string>>;
}

export const useSignedInRootContext = (): ISignedInRootContext => {
  return useOutletContext<ISignedInRootContext>();
};
