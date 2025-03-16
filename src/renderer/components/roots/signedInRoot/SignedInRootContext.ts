import { useOutletContext } from "react-router-dom";
import { IAppRootContext } from "@renderer/components/roots/appRoot/AppRootContext";
import { ISignedInUserInfo } from "@shared/user/account/SignedInUserInfo";
import { IUserDataStorageInfo } from "@shared/user/data/storage/info/UserDataStorageInfo";
import { IUserDataStorageVisibilityGroupInfo } from "@shared/user/data/storage/visibilityGroup/info/UserDataStorageVisibilityGroupInfo";

export interface ISignedInRootContext extends IAppRootContext {
  signedInUserInfo: ISignedInUserInfo;
  userDataStoragesInfo: IUserDataStorageInfo[];
  openUserDataStorageVisibilityGroupsInfo: IUserDataStorageVisibilityGroupInfo[];
  setForbiddenLocationName: (newForbiddenLocationName: string) => void;
}

export const useSignedInRootContext = (): ISignedInRootContext => {
  return useOutletContext<ISignedInRootContext>();
};
