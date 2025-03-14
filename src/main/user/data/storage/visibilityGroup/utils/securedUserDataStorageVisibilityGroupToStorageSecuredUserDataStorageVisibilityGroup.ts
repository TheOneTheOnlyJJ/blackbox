import { LogFunctions } from "electron-log";
import { ISecuredUserDataStorageVisibilityGroup } from "../SecuredUserDataStorageVisibilityGroup";
import { IStorageSecuredUserDataStorageVisibilityGroup } from "../StorageSecuredUserDataStorageVisibilityGroup";
import { IPrivateStorageSecuredUserDataStorageVisibilityGroup } from "../PrivateStorageSecuredUserDataStorageVisibilityGroup";
import { encryptWithAES } from "@main/utils/encryption/encryptWithAES";
import { securedUserDataStorageVisibilityGroupToPrivateStorageSecuredUserDataStorageVisibilityGroup } from "./securedUserDataStorageVisibilityGroupToPrivateStorageSecuredUserDataStorageVisibilityGroup";

export const securedUserDataStorageVisibilityGroupToStorageSecuredUserDataStorageVisibilityGroup = (
  securedUserDataStorageVisibilityGroup: ISecuredUserDataStorageVisibilityGroup,
  encryptionAESKey: Buffer,
  logger: LogFunctions | null
): IStorageSecuredUserDataStorageVisibilityGroup => {
  logger?.debug("Converting Secured User Data Storage Visibility Group to Storage Secured User Data Storage Visibility Group.");
  return {
    visibilityGroupId: securedUserDataStorageVisibilityGroup.visibilityGroupId,
    userId: securedUserDataStorageVisibilityGroup.userId,
    encryptedPrivateStorageSecuredUserDataStorageVisibilityGroup: encryptWithAES<IPrivateStorageSecuredUserDataStorageVisibilityGroup>(
      securedUserDataStorageVisibilityGroupToPrivateStorageSecuredUserDataStorageVisibilityGroup(securedUserDataStorageVisibilityGroup, logger),
      encryptionAESKey,
      logger,
      "Private Storage Secured User Data Storage Visibility Group"
    )
  } satisfies IStorageSecuredUserDataStorageVisibilityGroup;
};
