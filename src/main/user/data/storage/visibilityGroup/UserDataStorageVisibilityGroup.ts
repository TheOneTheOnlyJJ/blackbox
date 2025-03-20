import { UUID } from "node:crypto";

export interface IUserDataStorageVisibilityGroup {
  visibilityGroupId: UUID;
  userId: UUID;
  name: string;
  description: string | null;
  AESKey: Buffer;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isValidUserDataStorageVisibilityGroup = (data: any): data is IUserDataStorageVisibilityGroup => {
  return (
    typeof data === "object" &&
    data !== null &&
    "visibilityGroupId" in data &&
    "userId" in data &&
    "name" in data &&
    "description" in data &&
    "AESKey" in data &&
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    typeof data.visibilityGroupId === "string" &&
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    typeof data.userId === "string" &&
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    typeof data.name === "string" &&
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    (data.description === null || typeof data.description === "string") &&
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    Buffer.isBuffer(data.AESKey)
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isValidUserDataStorageVisibilityGroupArray = (data: any): data is IUserDataStorageVisibilityGroup[] => {
  if (!Array.isArray(data)) {
    return false;
  }
  for (const ARRAY_VALUE of data) {
    if (!isValidUserDataStorageVisibilityGroup(ARRAY_VALUE)) {
      return false;
    }
  }
  return true;
};
