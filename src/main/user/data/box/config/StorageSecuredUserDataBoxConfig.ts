import { IEncryptedData, isEncryptedDataValid } from "@shared/utils/EncryptedData";
import { UUID } from "node:crypto";
import { IPrivateStorageSecuredUserDataBoxConfig } from "./PrivateStorageSecuredUserDataBoxConfig";
import { isValidUUID } from "@main/utils/dataValidation/isValidUUID";

export interface IStorageSecuredUserDataBoxConfig {
  boxId: UUID;
  storageId: UUID;
  encryptedPrivateStorageSecuredUserDataBoxConfig: IEncryptedData<IPrivateStorageSecuredUserDataBoxConfig>;
}

export const isValidStorageSecuredUserDataBoxConfig = (data: unknown): data is IStorageSecuredUserDataBoxConfig => {
  return (
    typeof data === "object" &&
    data !== null &&
    "boxId" in data &&
    "storageId" in data &&
    "encryptedPrivateStorageSecuredUserDataBoxConfig" in data &&
    isValidUUID(data.boxId) &&
    isValidUUID(data.storageId) &&
    isEncryptedDataValid(data.encryptedPrivateStorageSecuredUserDataBoxConfig)
  );
};
