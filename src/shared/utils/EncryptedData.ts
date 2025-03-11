/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { IV_LENGTH } from "@shared/encryption/constants";

// @ts-expect-error TEncryptedPayload is required for inference purposes only
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface IEncryptedData<TEncryptedPayload> {
  data: Uint8Array;
  iv: Uint8Array;
}

export const isEncryptedDataValid = (data: any): data is IEncryptedData<unknown> => {
  return (
    typeof data === "object" &&
    data !== null &&
    "data" in data &&
    "iv" in data &&
    data.data instanceof Uint8Array &&
    data.iv instanceof Uint8Array &&
    data.iv.length === IV_LENGTH
  );
};
