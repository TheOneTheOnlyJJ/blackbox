import { IStorageSecuredUserDataStorageConfig } from "@main/user/data/storage/config/StorageSecuredUserDataStorageConfig";
import { LogFunctions } from "electron-log";
import { UUID } from "node:crypto";

export interface IRawStorageSecuredUserDataStorageConfig {
  storageId: UUID;
  visibilityGroupId: UUID;
  userDataStorageConfigIV: Buffer;
  userDataStorageConfigData: Buffer;
}

export const rawStorageSecuredUserDataStorageConfigToStorageSecuredUserDataStorageConfig = (
  rawStorageSecuredUserDataStorageConfig: IRawStorageSecuredUserDataStorageConfig,
  userId: UUID,
  logger: LogFunctions | null
): IStorageSecuredUserDataStorageConfig => {
  logger?.debug("Converting Raw Storage Secured User Data Storage Config to Storage Secured User Data Storage Config.");
  return {
    storageId: rawStorageSecuredUserDataStorageConfig.storageId,
    userId: userId,
    visibilityGroupId: rawStorageSecuredUserDataStorageConfig.visibilityGroupId,
    encryptedPrivateStorageSecuredUserDataStorageConfig: {
      data: rawStorageSecuredUserDataStorageConfig.userDataStorageConfigData,
      iv: rawStorageSecuredUserDataStorageConfig.userDataStorageConfigIV
    }
  } satisfies IStorageSecuredUserDataStorageConfig;
};
