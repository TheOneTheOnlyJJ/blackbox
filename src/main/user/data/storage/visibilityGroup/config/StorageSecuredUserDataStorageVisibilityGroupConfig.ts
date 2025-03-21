import { IEncryptedData, isEncryptedDataValid } from "@shared/utils/EncryptedData";
import { UUID } from "crypto";
import { IPrivateStorageSecuredUserDataStorageVisibilityGroupConfig } from "./PrivateStorageSecuredUserDataStorageVisibilityGroupConfig";

export interface IStorageSecuredUserDataStorageVisibilityGroupConfig {
  visibilityGroupId: UUID;
  userId: UUID;
  encryptedPrivateStorageSecuredUserDataStorageVisibilityGroupConfig: IEncryptedData<IPrivateStorageSecuredUserDataStorageVisibilityGroupConfig>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isStorageSecuredUserDataStorageVisibilityGroupConfigValid = (data: any): data is IStorageSecuredUserDataStorageVisibilityGroupConfig => {
  return (
    typeof data === "object" &&
    data !== null &&
    "visibilityGroupId" in data &&
    "userId" in data &&
    "encryptedPrivateStorageSecuredUserDataStorageVisibilityGroupConfig" in data &&
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    typeof data.visibilityGroupId === "string" &&
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    typeof data.userId === "string" &&
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    isEncryptedDataValid(data.encryptedPrivateStorageSecuredUserDataStorageVisibilityGroupConfig)
  );
};
