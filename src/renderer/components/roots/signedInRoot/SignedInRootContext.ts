import { useOutletContext } from "react-router-dom";
import { IAppRootContext } from "@renderer/components/roots/appRoot/AppRootContext";
import { IPublicSignedInUser } from "@shared/user/account/PublicSignedInUser";
import { IUserDataStorageInfo } from "@shared/user/data/storage/info/UserDataStorageInfo";
import { IUserDataStorageVisibilityGroupInfo } from "@shared/user/data/storage/visibilityGroup/info/UserDataStorageVisibilityGroupInfo";

export interface ISignedInRootContext extends IAppRootContext {
  signedInUser: IPublicSignedInUser;
  userDataStoragesInfo: IUserDataStorageInfo[];
  openUserDataStorageVisibilityGroupsInfo: IUserDataStorageVisibilityGroupInfo[];
  setForbiddenLocationName: (newForbiddenLocationName: string) => void;
}

export const useSignedInRootContext = (): ISignedInRootContext => {
  return useOutletContext<ISignedInRootContext>();
};
