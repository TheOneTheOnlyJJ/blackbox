import { IEncryptedData, isEncryptedDataValid } from "@shared/utils/EncryptedData";
import { UUID } from "node:crypto";
import { IPrivateStorageSecuredUserDataEntry } from "./PrivateStorageSecuredUserDataEntry";
import { isValidUUID } from "@main/utils/dataValidation/isValidUUID";

export interface IStorageSecuredUserDataEntry {
  entryId: UUID;
  storageId: UUID;
  boxId: UUID;
  templateId: UUID;
  encryptedPrivateStorageSecuredUserDataEntry: IEncryptedData<IPrivateStorageSecuredUserDataEntry>;
}

export const isValidStorageSecuredUserDataEntry = (data: unknown): data is IStorageSecuredUserDataEntry => {
  return (
    typeof data === "object" &&
    data !== null &&
    "entryId" in data &&
    "storageId" in data &&
    "boxId" in data &&
    "templateId" in data &&
    "encryptedPrivateStorageSecuredUserDataEntry" in data &&
    isValidUUID(data.entryId) &&
    isValidUUID(data.storageId) &&
    isValidUUID(data.boxId) &&
    isValidUUID(data.templateId) &&
    isEncryptedDataValid(data.encryptedPrivateStorageSecuredUserDataEntry)
  );
};
