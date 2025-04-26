import { IEncryptedData, isEncryptedDataValid } from "@shared/utils/EncryptedData";
import { UUID } from "node:crypto";
import { isValidUUID } from "@main/utils/dataValidation/isValidUUID";
import { IPrivateStorageSecuredUserDataTemplateConfig } from "./PrivateStorageSecuredUserDataTemplateConfig";

export interface IStorageSecuredUserDataTemplateConfig {
  templateId: UUID;
  storageId: UUID;
  boxId: UUID;
  encryptedPrivateStorageSecuredUserDataTemplateConfig: IEncryptedData<IPrivateStorageSecuredUserDataTemplateConfig>;
}

export const isValidStorageSecuredUserDataTemplateConfig = (data: unknown): data is IStorageSecuredUserDataTemplateConfig => {
  return (
    typeof data === "object" &&
    data !== null &&
    "templateId" in data &&
    "storageId" in data &&
    "boxId" in data &&
    "encryptedPrivateStorageSecuredUserDataTemplateConfig" in data &&
    isValidUUID(data.templateId) &&
    isValidUUID(data.storageId) &&
    isValidUUID(data.boxId) &&
    isEncryptedDataValid(data.encryptedPrivateStorageSecuredUserDataTemplateConfig)
  );
};
