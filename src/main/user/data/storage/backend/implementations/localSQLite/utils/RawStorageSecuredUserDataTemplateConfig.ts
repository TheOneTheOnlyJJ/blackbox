import { IStorageSecuredUserDataTemplateConfig } from "@main/user/data/template/config/StorageSecuredUserDataTemplateConfig";
import { LogFunctions } from "electron-log";
import { UUID } from "node:crypto";

export interface IRawStorageSecuredUserDataTemplateConfig {
  templateId: UUID;
  boxId: UUID;
  templateConfigIV: Buffer;
  templateConfigData: Buffer;
}

export const rawStorageSecuredUserDataTemplateConfigToStorageSecuredUserDataTemplateConfig = (
  rawStorageSecuredUserDataTemplateConfig: IRawStorageSecuredUserDataTemplateConfig,
  storageId: UUID,
  logger: LogFunctions | null
): IStorageSecuredUserDataTemplateConfig => {
  logger?.debug("Converting Raw Storage Secured User Data Template Config to Storage Secured User Data Template Config.");
  return {
    templateId: rawStorageSecuredUserDataTemplateConfig.templateId,
    boxId: rawStorageSecuredUserDataTemplateConfig.boxId,
    storageId: storageId,
    encryptedPrivateStorageSecuredUserDataTemplateConfig: {
      data: rawStorageSecuredUserDataTemplateConfig.templateConfigData,
      iv: rawStorageSecuredUserDataTemplateConfig.templateConfigIV
    }
  } satisfies IStorageSecuredUserDataTemplateConfig;
};
