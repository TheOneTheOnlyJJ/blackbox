import { LogFunctions } from "electron-log";
import { ISecuredUserDataBoxConfig } from "../SecuredUserDataBoxConfig";
import { IStorageSecuredUserDataBoxConfig } from "../StorageSecuredUserDataBoxConfig";
import { IPrivateStorageSecuredUserDataBoxConfig } from "../PrivateStorageSecuredUserDataBoxConfig";
import { encryptWithAES } from "@main/utils/encryption/encryptWithAES";
import { securedUserDataBoxConfigToPrivateStorageSecuredUserDataBoxConfig } from "./securedUserDataBoxConfigToPrivateStorageSecuredUserDataBoxConfig";

export const securedUserDataBoxConfigToStorageSecuredUserDataBoxConfig = (
  securedUserDataBoxConfig: ISecuredUserDataBoxConfig,
  encryptionAESKey: Buffer,
  logger: LogFunctions | null
): IStorageSecuredUserDataBoxConfig => {
  logger?.debug("Converting Secured User Data Box Config to Storage Secured User Data Box Config.");
  return {
    boxId: securedUserDataBoxConfig.boxId,
    storageId: securedUserDataBoxConfig.storageId,
    encryptedPrivateStorageSecuredUserDataBoxConfig: encryptWithAES<IPrivateStorageSecuredUserDataBoxConfig>(
      securedUserDataBoxConfigToPrivateStorageSecuredUserDataBoxConfig(securedUserDataBoxConfig, logger),
      encryptionAESKey,
      logger,
      "Private Storage Secured User Data Box Config"
    )
  } satisfies IStorageSecuredUserDataBoxConfig;
};
