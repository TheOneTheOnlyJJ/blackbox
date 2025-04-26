import { LogFunctions } from "electron-log";
import { ISecuredUserDataTemplateConfig } from "../SecuredUserDataTemplateConfig";
import { IStorageSecuredUserDataTemplateConfig } from "../StorageSecuredUserDataTemplateConfig";
import { encryptWithAES } from "@main/utils/encryption/encryptWithAES";
import { IPrivateStorageSecuredUserDataTemplateConfig } from "../PrivateStorageSecuredUserDataTemplateConfig";
import { securedUserDataTemplateConfigToPrivateStorageSecuredUserDataTemplateConfig } from "./securedUserDataTemplateConfigToPrivateStorageSecuredUserDataTemplateConfig";

export const securedUserDataTemplateConfigToStorageSecuredUserDataTemplateConfig = (
  securedUserDataTemplateConfig: ISecuredUserDataTemplateConfig,
  encryptionAESKey: Buffer,
  logger: LogFunctions | null
): IStorageSecuredUserDataTemplateConfig => {
  logger?.debug("Converting Secured User Data Template Config to Storage Secured User Data Template Config.");
  return {
    templateId: securedUserDataTemplateConfig.templateId,
    storageId: securedUserDataTemplateConfig.storageId,
    boxId: securedUserDataTemplateConfig.boxId,
    encryptedPrivateStorageSecuredUserDataTemplateConfig: encryptWithAES<IPrivateStorageSecuredUserDataTemplateConfig>(
      securedUserDataTemplateConfigToPrivateStorageSecuredUserDataTemplateConfig(securedUserDataTemplateConfig, logger),
      encryptionAESKey,
      logger,
      "Private Storage Secured User Data Template Config"
    )
  } satisfies IStorageSecuredUserDataTemplateConfig;
};
