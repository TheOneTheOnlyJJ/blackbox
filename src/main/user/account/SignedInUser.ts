import { UUID } from "node:crypto";

export interface ISignedInUser {
  userId: UUID;
  username: string;
  userDataAESKey: Buffer;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isValidSignedInUser = (data: any): data is ISignedInUser => {
  return (
    typeof data === "object" &&
    data !== null &&
    "userId" in data &&
    "username" in data &&
    "userDataAESKey" in data &&
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    typeof data.userId === "string" &&
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    typeof data.username === "string" &&
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    Buffer.isBuffer(data.userDataAESKey)
  );
};
