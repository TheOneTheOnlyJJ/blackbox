import { LogFunctions } from "electron-log";
import { ISecuredUserDataStorageVisibilityGroupConfig } from "../SecuredUserDataStorageVisibilityGroupConfig";
import { IStorageSecuredUserDataStorageVisibilityGroupConfig } from "../StorageSecuredUserDataStorageVisibilityGroupConfig";
import {
  IPrivateStorageSecuredUserDataStorageVisibilityGroupConfig,
  isValidPrivateStorageSecuredUserDataStorageVisibilityGroupConfig
} from "../PrivateStorageSecuredUserDataStorageVisibilityGroupConfig";
import { decryptWithAESAndValidateJSON } from "@main/utils/encryption/decryptWithAESAndValidateJSON";

export const storageSecuredUserDataStorageVisibilityGroupConfigToSecuredUserDataStorageVisibilityGroupConfig = (
  storageSecuredUserDataStorageVisibilityGroupConfig: IStorageSecuredUserDataStorageVisibilityGroupConfig,
  decryptionAESKey: Buffer,
  logger: LogFunctions | null
): ISecuredUserDataStorageVisibilityGroupConfig => {
  logger?.debug("Converting Storage Secured User Data Storage Visibility Group Config to Secured User Data Storage Visibility Group Config.");
  const DECRYPTED_PRIVATE_STORAGE_SECURED_USER_DATA_STORAGE_VISIBILITY_GROUP_CONFIG: IPrivateStorageSecuredUserDataStorageVisibilityGroupConfig =
    decryptWithAESAndValidateJSON<IPrivateStorageSecuredUserDataStorageVisibilityGroupConfig>(
      storageSecuredUserDataStorageVisibilityGroupConfig.encryptedPrivateStorageSecuredUserDataStorageVisibilityGroupConfig,
      isValidPrivateStorageSecuredUserDataStorageVisibilityGroupConfig,
      decryptionAESKey,
      logger,
      "Private Storage Secured User Data Storage Config"
    );
  return {
    visibilityGroupId: storageSecuredUserDataStorageVisibilityGroupConfig.visibilityGroupId,
    userId: storageSecuredUserDataStorageVisibilityGroupConfig.userId,
    name: DECRYPTED_PRIVATE_STORAGE_SECURED_USER_DATA_STORAGE_VISIBILITY_GROUP_CONFIG.name,
    securedPassword: DECRYPTED_PRIVATE_STORAGE_SECURED_USER_DATA_STORAGE_VISIBILITY_GROUP_CONFIG.securedPassword,
    description: DECRYPTED_PRIVATE_STORAGE_SECURED_USER_DATA_STORAGE_VISIBILITY_GROUP_CONFIG.description,
    AESKeySalt: DECRYPTED_PRIVATE_STORAGE_SECURED_USER_DATA_STORAGE_VISIBILITY_GROUP_CONFIG.AESKeySalt
  } satisfies ISecuredUserDataStorageVisibilityGroupConfig;
};
