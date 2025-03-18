import { LogFunctions } from "electron-log";
import { ISecuredUserDataStorageVisibilityGroupConfig } from "../SecuredUserDataStorageVisibilityGroupConfig";
import { IStorageSecuredUserDataStorageVisibilityGroupConfig } from "../StorageSecuredUserDataStorageVisibilityGroupConfig";
import { IPrivateStorageSecuredUserDataStorageVisibilityGroupConfig } from "../PrivateStorageSecuredUserDataStorageVisibilityGroupConfig";
import { encryptWithAES } from "@main/utils/encryption/encryptWithAES";
import { securedUserDataStorageVisibilityGroupConfigToPrivateStorageSecuredUserDataStorageVisibilityGroupConfig } from "./securedUserDataStorageVisibilityGroupConfigToPrivateStorageSecuredUserDataStorageVisibilityGroupConfig";

export const securedUserDataStorageVisibilityGroupConfigToStorageSecuredUserDataStorageVisibilityGroupConfig = (
  securedUserDataStorageVisibilityGroupConfig: ISecuredUserDataStorageVisibilityGroupConfig,
  encryptionAESKey: Buffer,
  logger: LogFunctions | null
): IStorageSecuredUserDataStorageVisibilityGroupConfig => {
  logger?.debug("Converting Secured User Data Storage Visibility Group Config to Storage Secured User Data Storage Visibility Group Config.");
  return {
    visibilityGroupId: securedUserDataStorageVisibilityGroupConfig.visibilityGroupId,
    userId: securedUserDataStorageVisibilityGroupConfig.userId,
    encryptedPrivateStorageSecuredUserDataStorageVisibilityGroupConfig: encryptWithAES<IPrivateStorageSecuredUserDataStorageVisibilityGroupConfig>(
      securedUserDataStorageVisibilityGroupConfigToPrivateStorageSecuredUserDataStorageVisibilityGroupConfig(
        securedUserDataStorageVisibilityGroupConfig,
        logger
      ),
      encryptionAESKey,
      logger,
      "Private Storage Secured User Data Storage Visibility Group Config"
    )
  } satisfies IStorageSecuredUserDataStorageVisibilityGroupConfig;
};
