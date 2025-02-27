/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { IV_LENGTH } from "@shared/encryption/constants";

export interface IEncryptedData {
  data: ArrayBuffer;
  iv: Uint8Array;
}

export const isEncryptedDataValid = (data: any): data is IEncryptedData => {
  return (
    typeof data === "object" &&
    data !== null &&
    "data" in data &&
    "iv" in data &&
    data.data instanceof ArrayBuffer &&
    data.iv instanceof Uint8Array &&
    data.iv.length === IV_LENGTH
  );
};
