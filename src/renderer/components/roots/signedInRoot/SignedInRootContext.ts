import { useOutletContext } from "react-router-dom";
import { ICurrentlySignedInUser } from "@shared/user/CurrentlySignedInUser";
import { IAppRootContext } from "@renderer/components/roots/appRoot/AppRootContext";
import { Dispatch, SetStateAction } from "react";

export interface ISignedInRootContext extends IAppRootContext {
  currentlySignedInUser: ICurrentlySignedInUser;
  setForbiddenLocationName: Dispatch<SetStateAction<string>>;
}

export const useSignedInRootContext = (): ISignedInRootContext => {
  return useOutletContext<ISignedInRootContext>();
};
