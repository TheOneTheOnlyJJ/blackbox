import { LogFunctions } from "electron-log";
import { IStorageSecuredUserDataTemplateConfig } from "../StorageSecuredUserDataTemplateConfig";
import { decryptWithAESAndValidateJSON } from "@main/utils/encryption/decryptWithAESAndValidateJSON";
import {
  IPrivateStorageSecuredUserDataTemplateConfig,
  isValidPrivateStorageSecuredUserDataTemplateConfig
} from "../PrivateStorageSecuredUserDataTemplateConfig";
import { ISecuredUserDataTemplateConfig } from "../SecuredUserDataTemplateConfig";

export const storageSecuredUserDataTemplateConfigToSecuredUserDataTemplateConfig = (
  storageSecuredUserDataTemplateConfig: IStorageSecuredUserDataTemplateConfig,
  decryptionAESKey: Buffer,
  logger: LogFunctions | null
): ISecuredUserDataTemplateConfig => {
  logger?.debug("Converting Storage Secured User Data Template Config to Secured User Data Template Config.");
  const DECRYPTED_PRIVATE_STORAGE_SECURED_USER_DATA_TEMPLATE_CONFIG: IPrivateStorageSecuredUserDataTemplateConfig =
    decryptWithAESAndValidateJSON<IPrivateStorageSecuredUserDataTemplateConfig>(
      storageSecuredUserDataTemplateConfig.encryptedPrivateStorageSecuredUserDataTemplateConfig,
      isValidPrivateStorageSecuredUserDataTemplateConfig,
      decryptionAESKey,
      logger,
      "Private Storage Secured User Data Template Config"
    );
  return {
    templateId: storageSecuredUserDataTemplateConfig.templateId,
    storageId: storageSecuredUserDataTemplateConfig.storageId,
    boxId: storageSecuredUserDataTemplateConfig.boxId,
    name: DECRYPTED_PRIVATE_STORAGE_SECURED_USER_DATA_TEMPLATE_CONFIG.name,
    description: DECRYPTED_PRIVATE_STORAGE_SECURED_USER_DATA_TEMPLATE_CONFIG.description
  } satisfies ISecuredUserDataTemplateConfig;
};
