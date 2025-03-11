import { IStorageSecuredUserDataStorageConfig } from "../StorageSecuredUserDataStorageConfig";
import { LogFunctions } from "electron-log";
import { encryptWithAES } from "@main/utils/encryption/encryptWithAES";
import { ISecuredUserDataStorageConfig } from "../SecuredUserDataStorageConfig";
import { securedUserDataStorageConfigToPrivateStorageSecuredUserDataStorageConfig } from "./securedUserDataStorageConfigToPrivateStorageSecuredUserDataStorageConfig";

export const securedUserDataStorageConfigToStorageSecuredUserDataStorageConfig = (
  securedUserDataStorageConfig: ISecuredUserDataStorageConfig,
  encryptionAESKey: Buffer,
  logger: LogFunctions | null
): IStorageSecuredUserDataStorageConfig => {
  logger?.debug(`Converting Secured User Data Storage Config to Storage Secured User Data Storage Config.`);
  return {
    storageId: securedUserDataStorageConfig.storageId,
    userId: securedUserDataStorageConfig.userId,
    encryptedPrivateStorageSecuredUserDataStorageConfig: encryptWithAES(
      JSON.stringify(securedUserDataStorageConfigToPrivateStorageSecuredUserDataStorageConfig(securedUserDataStorageConfig, logger)),
      encryptionAESKey,
      logger,
      "Private Storage Secured User Data Storage Config"
    )
  };
};
