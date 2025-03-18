import { IUserDataStorageVisibilityGroupInfo } from "@shared/user/data/storage/visibilityGroup/info/UserDataStorageVisibilityGroupInfo";
import { ISecuredUserDataStorageVisibilityGroupConfig } from "../SecuredUserDataStorageVisibilityGroupConfig";
import { LogFunctions } from "electron-log";

export const securedUserDataStorageVisibilityGroupConfigToUserDataStorageVisibilityGroupInfo = (
  securedUserDataStorageVisibilityGroupConfig: ISecuredUserDataStorageVisibilityGroupConfig,
  logger: LogFunctions | null
): IUserDataStorageVisibilityGroupInfo => {
  logger?.debug("Converting Secured User Data Storage Visibility Group Config to User Data Storage Visibility Group Info.");
  return {
    visibilityGroupId: securedUserDataStorageVisibilityGroupConfig.visibilityGroupId,
    name: securedUserDataStorageVisibilityGroupConfig.name,
    description: securedUserDataStorageVisibilityGroupConfig.description
  } satisfies IUserDataStorageVisibilityGroupInfo;
};
