import { LogFunctions } from "electron-log";
import { IUserDataEntry } from "../UserDataEntry";
import { IStorageSecuredUserDataEntry } from "../StorageSecuredUserDataEntry";
import { IPrivateStorageSecuredUserDataEntry, isValidPrivateStorageSecuredUserDataEntry } from "../PrivateStorageSecuredUserDataEntry";
import { decryptWithAESAndValidateJSON } from "@main/utils/encryption/decryptWithAESAndValidateJSON";

export const storageSecuredUserDataEntryToUserDataEntry = (
  storageSecuredUserDataEntry: IStorageSecuredUserDataEntry,
  decryptionAESKey: Buffer,
  logger: LogFunctions | null
): IUserDataEntry => {
  logger?.debug("Converting Storage Secured User Data Entry to User Data Entry.");
  const DECRYPTED_PRIVATE_STORAGE_SECURED_USER_DATA_ENTRY: IPrivateStorageSecuredUserDataEntry =
    decryptWithAESAndValidateJSON<IPrivateStorageSecuredUserDataEntry>(
      storageSecuredUserDataEntry.encryptedPrivateStorageSecuredUserDataEntry,
      isValidPrivateStorageSecuredUserDataEntry,
      decryptionAESKey,
      logger,
      "Private Storage Secured User Data Entry"
    );
  return {
    entryId: storageSecuredUserDataEntry.entryId,
    storageId: storageSecuredUserDataEntry.storageId,
    boxId: storageSecuredUserDataEntry.boxId,
    templateId: storageSecuredUserDataEntry.templateId,
    data: DECRYPTED_PRIVATE_STORAGE_SECURED_USER_DATA_ENTRY.data
  } satisfies IUserDataEntry;
};
