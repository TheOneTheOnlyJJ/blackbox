import { IEncryptedData } from "@shared/utils/EncryptedData";

const ENCODER = new TextEncoder();

export const encrypt = async (obj: string, AESKey: CryptoKey): Promise<IEncryptedData> => {
  const ENCODED_STRINGIFIED_OBJ: Uint8Array = ENCODER.encode(obj);
  const IV: Uint8Array = window.crypto.getRandomValues(new Uint8Array(12));
  const ENCRYPTED_OBJ: ArrayBuffer = await window.crypto.subtle.encrypt({ name: "AES-GCM", iv: IV }, AESKey, ENCODED_STRINGIFIED_OBJ);
  return {
    data: ENCRYPTED_OBJ,
    iv: IV
  } satisfies IEncryptedData;
};
