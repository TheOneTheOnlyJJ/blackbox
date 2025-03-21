import { IStorageSecuredUserDataStorageVisibilityGroupConfig } from "@main/user/data/storage/visibilityGroup/config/StorageSecuredUserDataStorageVisibilityGroupConfig";
import { LogFunctions } from "electron-log";
import { UUID } from "node:crypto";

export interface IRawStorageSecuredUserDataStorageVisibilityGroupConfig {
  visibilityGroupId: UUID;
  userDataStorageVisibilityGroupConfigIV: Buffer;
  userDataStorageVisibilityGroupConfigData: Buffer;
}

export const rawStorageSecuredUserDataStorageVisibilityGroupConfigToStorageSecuredUserDataStorageVisibilityGroupConfig = (
  rawStorageSecuredUserDataStorageVisibilityGroupConfig: IRawStorageSecuredUserDataStorageVisibilityGroupConfig,
  userId: UUID,
  logger: LogFunctions | null
): IStorageSecuredUserDataStorageVisibilityGroupConfig => {
  logger?.debug(
    "Converting Raw Storage Secured User Data Storage Visibility Group Config to Storage Secured User Data Storage Visibility Group Config."
  );
  return {
    visibilityGroupId: rawStorageSecuredUserDataStorageVisibilityGroupConfig.visibilityGroupId,
    userId: userId,
    encryptedPrivateStorageSecuredUserDataStorageVisibilityGroupConfig: {
      data: rawStorageSecuredUserDataStorageVisibilityGroupConfig.userDataStorageVisibilityGroupConfigData,
      iv: rawStorageSecuredUserDataStorageVisibilityGroupConfig.userDataStorageVisibilityGroupConfigIV
    }
  } satisfies IStorageSecuredUserDataStorageVisibilityGroupConfig;
};
