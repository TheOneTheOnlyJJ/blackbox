import { IStorageSecuredUserDataBoxConfig } from "@main/user/data/box/config/StorageSecuredUserDataBoxConfig";
import { LogFunctions } from "electron-log";
import { UUID } from "node:crypto";

export interface IRawStorageSecuredUserDataBoxConfig {
  boxId: UUID;
  boxConfigIV: Buffer;
  boxConfigData: Buffer;
}

export const rawStorageSecuredUserDataBoxConfigToStorageSecuredUserDataBoxConfig = (
  rawStorageSecuredUserDataBoxConfig: IRawStorageSecuredUserDataBoxConfig,
  storageId: UUID,
  logger: LogFunctions | null
): IStorageSecuredUserDataBoxConfig => {
  logger?.debug("Converting Raw Storage Secured User Data Box Config to Storage Secured User Data Box Config.");
  return {
    boxId: rawStorageSecuredUserDataBoxConfig.boxId,
    storageId: storageId,
    encryptedPrivateStorageSecuredUserDataBoxConfig: {
      data: rawStorageSecuredUserDataBoxConfig.boxConfigData,
      iv: rawStorageSecuredUserDataBoxConfig.boxConfigIV
    }
  } satisfies IStorageSecuredUserDataBoxConfig;
};
