import { useOutletContext } from "react-router-dom";
import { IAppRootContext } from "@renderer/components/roots/appRoot/AppRootContext";
import { IPublicSignedInUser } from "@shared/user/account/PublicSignedInUser";
import { IUserDataStorageInfo } from "@shared/user/data/storage/info/UserDataStorageInfo";

export interface ISignedInRootContext extends IAppRootContext {
  signedInUser: IPublicSignedInUser;
  userDataStoragesInfo: IUserDataStorageInfo[];
  setForbiddenLocationName: (newForbiddenLocationName: string) => void;
}

export const useSignedInRootContext = (): ISignedInRootContext => {
  return useOutletContext<ISignedInRootContext>();
};
