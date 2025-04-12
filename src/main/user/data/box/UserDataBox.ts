import { isValidUUID } from "@main/utils/dataValidation/isValidUUID";
import { UUID } from "node:crypto";

export interface IUserDataBox {
  boxId: UUID;
  storageId: UUID;
  name: string;
  description: string | null;
}

export const isValidUserDataBox = (data: unknown): data is IUserDataBox => {
  return (
    typeof data === "object" &&
    data !== null &&
    "boxId" in data &&
    "storageId" in data &&
    "name" in data &&
    "description" in data &&
    isValidUUID(data.boxId) &&
    isValidUUID(data.storageId) &&
    typeof data.name === "string" &&
    (data.description === null || typeof data.description === "string")
  );
};

export const isValidUserDataBoxArray = (data: unknown): data is IUserDataBox[] => {
  if (!Array.isArray(data)) {
    return false;
  }
  return data.every((value: unknown): value is IUserDataBox => {
    return isValidUserDataBox(value);
  });
};
