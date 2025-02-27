import { LogFunctions } from "electron-log";
import { ISecuredUserDataStorageConfig } from "../SecuredUserDataStorageConfig";
import { IStorageSecuredUserDataStorageConfig } from "../StorageSecuredUserDataStorageConfig";
import { IPrivateStorageSecuredUserDataStorageConfig } from "../PrivateStorageSecuredUserDataStorageConfig";
import { decryptWithAESAndValidateJSON } from "@main/utils/encryption/decryptWithAESAndValidateJSON";
import { ValidateFunction } from "ajv";

export const storageSecuredUserDataStorageConfigToSecuredUserDataStorageConfig = (
  storageSecuredUserDataStorageConfig: IStorageSecuredUserDataStorageConfig,
  privateStorageSecuredUserDataStorageConfigValidator: ValidateFunction<IPrivateStorageSecuredUserDataStorageConfig>,
  decryptionAESKey: Buffer,
  logger: LogFunctions
): ISecuredUserDataStorageConfig => {
  logger.debug(`Converting Storage Secured User Data Storage Config to Secured User Data Storage Config.`);
  const DECRYPTED_PRIVATE_STORAGE_SECURED_USER_DATA_STORAGE_CONFIG: IPrivateStorageSecuredUserDataStorageConfig =
    decryptWithAESAndValidateJSON<IPrivateStorageSecuredUserDataStorageConfig>(
      storageSecuredUserDataStorageConfig.encryptedPrivateStorageSecuredUserDataStorageConfig,
      privateStorageSecuredUserDataStorageConfigValidator,
      decryptionAESKey,
      logger,
      "Private Storage Secured User Data Storage Config"
    );
  return {
    storageId: storageSecuredUserDataStorageConfig.storageId,
    userId: storageSecuredUserDataStorageConfig.userId,
    name: DECRYPTED_PRIVATE_STORAGE_SECURED_USER_DATA_STORAGE_CONFIG.name,
    description: DECRYPTED_PRIVATE_STORAGE_SECURED_USER_DATA_STORAGE_CONFIG.description,
    securedVisibilityPassword: DECRYPTED_PRIVATE_STORAGE_SECURED_USER_DATA_STORAGE_CONFIG.securedVisibilityPassword,
    backendConfig: DECRYPTED_PRIVATE_STORAGE_SECURED_USER_DATA_STORAGE_CONFIG.backendConfig
  };
};
