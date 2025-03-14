import { IEncryptedData, isEncryptedDataValid } from "@shared/utils/EncryptedData";
import { UUID } from "crypto";
import { IPrivateStorageSecuredUserDataStorageVisibilityGroup } from "./PrivateStorageSecuredUserDataStorageVisibilityGroup";

export interface IStorageSecuredUserDataStorageVisibilityGroup {
  visibilityGroupId: UUID;
  userId: UUID;
  encryptedPrivateStorageSecuredUserDataStorageVisibilityGroup: IEncryptedData<IPrivateStorageSecuredUserDataStorageVisibilityGroup>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isStorageSecuredUserDataStorageVisibilityGroupValid = (data: any): data is IStorageSecuredUserDataStorageVisibilityGroup => {
  return (
    typeof data === "object" &&
    data !== null &&
    "visibilityGroupId" in data &&
    "userId" in data &&
    "encryptedPrivateStorageSecuredUserDataStorageVisibilityGroup" in data &&
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    typeof data.visibilityGroupId === "string" &&
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    typeof data.userId === "string" &&
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    isEncryptedDataValid(data.encryptedPrivateStorageSecuredUserDataStorageVisibilityGroup)
  );
};
