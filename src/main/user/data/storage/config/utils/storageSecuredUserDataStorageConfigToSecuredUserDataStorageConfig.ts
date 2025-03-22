import { LogFunctions } from "electron-log";
import { ISecuredUserDataStorageConfig } from "../SecuredUserDataStorageConfig";
import { IStorageSecuredUserDataStorageConfig } from "../StorageSecuredUserDataStorageConfig";
import {
  IPrivateStorageSecuredUserDataStorageConfig,
  isValidPrivateStorageSecuredUserDataStorageConfig
} from "../PrivateStorageSecuredUserDataStorageConfig";
import { decryptWithAESAndValidateJSON } from "@main/utils/encryption/decryptWithAESAndValidateJSON";

export const storageSecuredUserDataStorageConfigToSecuredUserDataStorageConfig = (
  storageSecuredUserDataStorageConfig: IStorageSecuredUserDataStorageConfig,
  decryptionAESKey: Buffer,
  logger: LogFunctions | null
): ISecuredUserDataStorageConfig => {
  logger?.debug("Converting Storage Secured User Data Storage Config to Secured User Data Storage Config.");
  const DECRYPTED_PRIVATE_STORAGE_SECURED_USER_DATA_STORAGE_CONFIG: IPrivateStorageSecuredUserDataStorageConfig =
    decryptWithAESAndValidateJSON<IPrivateStorageSecuredUserDataStorageConfig>(
      storageSecuredUserDataStorageConfig.encryptedPrivateStorageSecuredUserDataStorageConfig,
      isValidPrivateStorageSecuredUserDataStorageConfig,
      decryptionAESKey,
      logger,
      "Private Storage Secured User Data Storage Config"
    );
  return {
    storageId: storageSecuredUserDataStorageConfig.storageId,
    userId: storageSecuredUserDataStorageConfig.userId,
    visibilityGroupId: storageSecuredUserDataStorageConfig.visibilityGroupId,
    name: DECRYPTED_PRIVATE_STORAGE_SECURED_USER_DATA_STORAGE_CONFIG.name,
    description: DECRYPTED_PRIVATE_STORAGE_SECURED_USER_DATA_STORAGE_CONFIG.description,
    backendConfig: DECRYPTED_PRIVATE_STORAGE_SECURED_USER_DATA_STORAGE_CONFIG.backendConfig
  };
};
