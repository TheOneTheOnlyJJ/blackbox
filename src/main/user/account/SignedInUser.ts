export interface ISignedInUser {
  userId: string;
  username: string;
  userDataEncryptionAESKey: Buffer;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isSignedInUserValid = (data: any): data is ISignedInUser => {
  return (
    typeof data === "object" &&
    data !== null &&
    "userId" in data &&
    "username" in data &&
    "userDataEncryptionAESKey" in data &&
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    typeof data.userId === "string" &&
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    typeof data.username === "string" &&
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    Buffer.isBuffer(data.userDataEncryptionAESKey)
  );
};
