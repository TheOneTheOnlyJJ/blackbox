import { LogFunctions } from "electron-log";
import { IStorageSecuredUserDataBoxConfig } from "../StorageSecuredUserDataBoxConfig";
import { ISecuredUserDataBoxConfig } from "../SecuredUserDataBoxConfig";
import { IPrivateStorageSecuredUserDataBoxConfig, isValidPrivateStorageSecuredUserDataBoxConfig } from "../PrivateStorageSecuredUserDataBoxConfig";
import { decryptWithAESAndValidateJSON } from "@main/utils/encryption/decryptWithAESAndValidateJSON";

export const storageSecuredUserDataBoxConfigToSecuredUserDataBoxConfig = (
  storageSecuredUserDataBoxConfig: IStorageSecuredUserDataBoxConfig,
  decryptionAESKey: Buffer,
  logger: LogFunctions | null
): ISecuredUserDataBoxConfig => {
  logger?.debug("Converting Storage Secured User Data Box Config to Secured User Data Box Config.");
  const DECRYPTED_PRIVATE_STORAGE_SECURED_USER_DATA_BOX_CONFIG: IPrivateStorageSecuredUserDataBoxConfig =
    decryptWithAESAndValidateJSON<IPrivateStorageSecuredUserDataBoxConfig>(
      storageSecuredUserDataBoxConfig.encryptedPrivateStorageSecuredUserDataBoxConfig,
      isValidPrivateStorageSecuredUserDataBoxConfig,
      decryptionAESKey,
      logger,
      "Private Storage Secured User Data Box Config"
    );
  return {
    boxId: storageSecuredUserDataBoxConfig.boxId,
    storageId: storageSecuredUserDataBoxConfig.storageId,
    name: DECRYPTED_PRIVATE_STORAGE_SECURED_USER_DATA_BOX_CONFIG.name,
    description: DECRYPTED_PRIVATE_STORAGE_SECURED_USER_DATA_BOX_CONFIG.description
  } satisfies ISecuredUserDataBoxConfig;
};
