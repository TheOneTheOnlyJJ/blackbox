import { LogFunctions } from "electron-log";
import { ISecuredUserDataStorageVisibilityGroup } from "../SecuredUserDataStorageVisibilityGroup";
import { IStorageSecuredUserDataStorageVisibilityGroup } from "../StorageSecuredUserDataStorageVisibilityGroup";
import {
  IPrivateStorageSecuredUserDataStorageVisibilityGroup,
  PRIVATE_STORAGE_SECURED_USER_DATA_STORAGE_VISIBILITY_GROUP_VALIDATE_FUNCTION
} from "../PrivateStorageSecuredUserDataStorageVisibilityGroup";
import { decryptWithAESAndValidateJSON } from "@main/utils/encryption/decryptWithAESAndValidateJSON";

export const storageSecuredUserDataStorageVisibilityGroupToSecuredUserDataStorageVisibilityGroup = (
  storageSecuredUserDataStorageVisibilityGroup: IStorageSecuredUserDataStorageVisibilityGroup,
  decryptionAESKey: Buffer,
  logger: LogFunctions | null
): ISecuredUserDataStorageVisibilityGroup => {
  logger?.debug("Converting Storage Secured User Data Storage Visibility Group to Secured User Data Storage Visibility Group.");
  const DECRYPTED_PRIVATE_STORAGE_SECURED_USER_DATA_STORAGE_VISIBILITY_GROUP: IPrivateStorageSecuredUserDataStorageVisibilityGroup =
    decryptWithAESAndValidateJSON<IPrivateStorageSecuredUserDataStorageVisibilityGroup>(
      storageSecuredUserDataStorageVisibilityGroup.encryptedPrivateStorageSecuredUserDataStorageVisibilityGroup,
      PRIVATE_STORAGE_SECURED_USER_DATA_STORAGE_VISIBILITY_GROUP_VALIDATE_FUNCTION,
      decryptionAESKey,
      logger,
      "Private Storage Secured User Data Storage Config"
    );
  return {
    visibilityGroupId: storageSecuredUserDataStorageVisibilityGroup.visibilityGroupId,
    userId: storageSecuredUserDataStorageVisibilityGroup.userId,
    name: DECRYPTED_PRIVATE_STORAGE_SECURED_USER_DATA_STORAGE_VISIBILITY_GROUP.name,
    securedPassword: DECRYPTED_PRIVATE_STORAGE_SECURED_USER_DATA_STORAGE_VISIBILITY_GROUP.securedPassword,
    description: DECRYPTED_PRIVATE_STORAGE_SECURED_USER_DATA_STORAGE_VISIBILITY_GROUP.description,
    AESKeySalt: DECRYPTED_PRIVATE_STORAGE_SECURED_USER_DATA_STORAGE_VISIBILITY_GROUP.AESKeySalt
  } satisfies ISecuredUserDataStorageVisibilityGroup;
};
