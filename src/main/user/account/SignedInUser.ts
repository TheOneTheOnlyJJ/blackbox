import { isValidUUID } from "@main/utils/dataValidation/isValidUUID";
import { UUID } from "node:crypto";

export interface ISignedInUser {
  userId: UUID;
  username: string;
  userDataAESKey: Buffer;
}

export const isValidSignedInUser = (data: unknown): data is ISignedInUser => {
  return (
    typeof data === "object" &&
    data !== null &&
    "userId" in data &&
    "username" in data &&
    "userDataAESKey" in data &&
    isValidUUID(data.userId) &&
    typeof data.username === "string" &&
    Buffer.isBuffer(data.userDataAESKey)
  );
};
