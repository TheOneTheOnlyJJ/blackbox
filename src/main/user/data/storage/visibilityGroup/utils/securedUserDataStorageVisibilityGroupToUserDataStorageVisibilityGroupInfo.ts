import { IUserDataStorageVisibilityGroupInfo } from "@shared/user/data/storage/visibilityGroup/info/UserDataStorageVisibilityGroupInfo";
import { ISecuredUserDataStorageVisibilityGroup } from "../SecuredUserDataStorageVisibilityGroup";
import { LogFunctions } from "electron-log";

export const securedUserDataStorageVisibilityGroupToUserDataStorageVisibilityGroupInfo = (
  securedUserDataStorageVisibilityGroup: ISecuredUserDataStorageVisibilityGroup,
  logger: LogFunctions | null
): IUserDataStorageVisibilityGroupInfo => {
  logger?.debug("Converting Secured User Data Storage Visibility Group to User Data Storage Visibility Group Info.");
  return {
    visibilityGroupId: securedUserDataStorageVisibilityGroup.visibilityGroupId,
    name: securedUserDataStorageVisibilityGroup.name,
    description: securedUserDataStorageVisibilityGroup.description
  } satisfies IUserDataStorageVisibilityGroupInfo;
};
