import { IStorageSecuredUserDataEntry } from "@main/user/data/entry/StorageSecuredUserDataEntry";
import { LogFunctions } from "electron-log";
import { UUID } from "node:crypto";

export interface IRawStorageSecuredUserDataEntry {
  entryId: UUID;
  storageId: UUID;
  boxId: UUID;
  templateId: UUID;
  entryIV: Buffer;
  entryData: Buffer;
}

export const rawStorageSecuredUserDataEntryToStorageSecuredUserDataEntry = (
  rawStorageSecuredUserDataEntry: IRawStorageSecuredUserDataEntry,
  storageId: UUID,
  logger: LogFunctions | null
): IStorageSecuredUserDataEntry => {
  logger?.debug("Converting Raw Storage Secured User Data Entry to Storage Secured User Data Entry.");
  return {
    entryId: rawStorageSecuredUserDataEntry.entryId,
    storageId: storageId,
    boxId: rawStorageSecuredUserDataEntry.boxId,
    templateId: rawStorageSecuredUserDataEntry.templateId,
    encryptedPrivateStorageSecuredUserDataEntry: {
      data: rawStorageSecuredUserDataEntry.entryData,
      iv: rawStorageSecuredUserDataEntry.entryIV
    }
  } satisfies IStorageSecuredUserDataEntry;
};
