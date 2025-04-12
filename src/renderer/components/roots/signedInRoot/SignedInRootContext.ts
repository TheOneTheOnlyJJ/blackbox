import { useOutletContext } from "react-router-dom";
import { IAppRootContext } from "@renderer/components/roots/appRoot/AppRootContext";
import { ISignedInUserInfo } from "@shared/user/account/SignedInUserInfo";
import { IUserDataStorageVisibilityGroupInfo } from "@shared/user/data/storage/visibilityGroup/info/UserDataStorageVisibilityGroupInfo";
import { IUserDataStorageConfigInfo } from "@shared/user/data/storage/config/info/UserDataStorageConfigInfo";
import { IUserDataStorageInfo } from "@shared/user/data/storage/info/UserDataStorageInfo";
import { IUserDataBoxInfo } from "@shared/user/data/box/info/UserDataBoxInfo";

export interface ISignedInRootContext extends IAppRootContext {
  signedInUserInfo: ISignedInUserInfo;
  availableUserDataStorageConfigsInfo: IUserDataStorageConfigInfo[];
  initialisedUserDataStoragesInfo: IUserDataStorageInfo[];
  openUserDataStorageVisibilityGroupsInfo: IUserDataStorageVisibilityGroupInfo[];
  availableUserDataDataBoxesInfo: IUserDataBoxInfo[];
  getOpenUserDataStorageVisibilityGroupInfoById: (visibilityGroupId: string) => IUserDataStorageVisibilityGroupInfo | null;
  setForbiddenLocationName: (newForbiddenLocationName: string) => void;
}

export const useSignedInRootContext = (): ISignedInRootContext => {
  return useOutletContext<ISignedInRootContext>();
};
