import { LogFunctions } from "electron-log";
import { IUserDataEntry } from "../UserDataEntry";
import { IStorageSecuredUserDataEntry } from "../StorageSecuredUserDataEntry";
import { IPrivateStorageSecuredUserDataEntry } from "../PrivateStorageSecuredUserDataEntry";
import { encryptWithAES } from "@main/utils/encryption/encryptWithAES";
import { userDataEntryToPrivateStorageSecuredUserDataEntry } from "./userDataEntryToPrivateStorageSecuredUserDataEntry";

export const userDataEntryToStorageSecuredUserDataEntry = (
  userDataEntry: IUserDataEntry,
  encryptionAESKey: Buffer,
  logger: LogFunctions | null
): IStorageSecuredUserDataEntry => {
  logger?.debug("Converting User Data Entry to Storage Secured User Data Entry.");
  return {
    entryId: userDataEntry.entryId,
    storageId: userDataEntry.storageId,
    boxId: userDataEntry.boxId,
    templateId: userDataEntry.templateId,
    encryptedPrivateStorageSecuredUserDataEntry: encryptWithAES<IPrivateStorageSecuredUserDataEntry>(
      userDataEntryToPrivateStorageSecuredUserDataEntry(userDataEntry, logger),
      encryptionAESKey,
      logger,
      "Private Storage Secured User Data Entry"
    )
  } satisfies IStorageSecuredUserDataEntry;
};
