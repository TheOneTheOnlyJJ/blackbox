import { useOutletContext } from "react-router-dom";
import { IAppRootContext } from "@renderer/components/roots/appRoot/AppRootContext";
import { ISignedInUserInfo } from "@shared/user/account/SignedInUserInfo";
import { IUserDataStorageVisibilityGroupInfo } from "@shared/user/data/storage/visibilityGroup/info/UserDataStorageVisibilityGroupInfo";
import { IUserDataStorageConfigInfo } from "@shared/user/data/storage/config/info/UserDataStorageConfigInfo";
import { IUserDataStorageInfo } from "@shared/user/data/storage/info/UserDataStorageInfo";
import { IUserDataBoxInfo } from "@shared/user/data/box/info/UserDataBoxInfo";
import { IUserDataTemplateInfo } from "@shared/user/data/template/info/UserDataTemplateInfo";
import { IUserDataBoxIdentifier } from "@shared/user/data/box/identifier/UserDataBoxIdentifier";
import { IUserDataTemplateIdentifier } from "@shared/user/data/template/identifier/UserDataTemplateIdentifier";
import { IUserDataEntryIdentifier } from "@shared/user/data/entry/identifier/UserDataEntryIdentifier";
import { IUserDataEntryInfo } from "@shared/user/data/entry/info/UserDataEntryInfo";

export interface ISignedInRootContext extends IAppRootContext {
  signedInUserInfo: ISignedInUserInfo;
  availableUserDataStorageConfigsInfo: IUserDataStorageConfigInfo[];
  initialisedUserDataStoragesInfo: IUserDataStorageInfo[];
  openUserDataStorageVisibilityGroupsInfo: IUserDataStorageVisibilityGroupInfo[];
  availableUserDataDataBoxesInfo: IUserDataBoxInfo[];
  availableUserDataDataTemplatesInfo: IUserDataTemplateInfo[];
  availableUserDataDataEntriesInfo: IUserDataEntryInfo[];
  getInitialisedUserDataStorageInfoById: (userDataStorageId: string) => IUserDataStorageInfo | null;
  getOpenUserDataStorageVisibilityGroupInfoById: (userDataStorageVisibilityGroupId: string) => IUserDataStorageVisibilityGroupInfo | null;
  getAvailableUserDataBoxInfoByIdentifier: (userDataBoxIdentifier: IUserDataBoxIdentifier) => IUserDataBoxInfo | null;
  getAvailableUserDataTemplateInfoByIdentifier: (userDataTemplateIdentifier: IUserDataTemplateIdentifier) => IUserDataTemplateInfo | null;
  getAvailableUserDataEntryInfoByIdentifier: (userDataEntryIdentifier: IUserDataEntryIdentifier) => IUserDataEntryInfo | null;
  setForbiddenLocationName: (newForbiddenLocationName: string) => void;
}

export const useSignedInRootContext = (): ISignedInRootContext => {
  return useOutletContext<ISignedInRootContext>();
};
