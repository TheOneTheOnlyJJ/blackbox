import { isValidUUID } from "@main/utils/dataValidation/isValidUUID";
import { UUID } from "node:crypto";

export interface IUserDataStorageVisibilityGroup {
  visibilityGroupId: UUID;
  userId: UUID;
  name: string;
  description: string | null;
  AESKey: Buffer;
}

export const isValidUserDataStorageVisibilityGroup = (data: unknown): data is IUserDataStorageVisibilityGroup => {
  return (
    typeof data === "object" &&
    data !== null &&
    "visibilityGroupId" in data &&
    "userId" in data &&
    "name" in data &&
    "description" in data &&
    "AESKey" in data &&
    isValidUUID(data.visibilityGroupId) &&
    isValidUUID(data.userId) &&
    typeof data.name === "string" &&
    (data.description === null || typeof data.description === "string") &&
    Buffer.isBuffer(data.AESKey)
  );
};

export const isValidUserDataStorageVisibilityGroupArray = (data: unknown): data is IUserDataStorageVisibilityGroup[] => {
  if (!Array.isArray(data)) {
    return false;
  }
  return data.every((value: unknown): value is IUserDataStorageVisibilityGroup => {
    return isValidUserDataStorageVisibilityGroup(value);
  });
};
