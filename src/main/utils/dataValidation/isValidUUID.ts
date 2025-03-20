import { UUID } from "node:crypto";

// https://nodejs.org/api/crypto.html#cryptorandomuuidoptions
// eslint-disable-next-line @typescript-eslint/no-inferrable-types
export const RFC_4122_UUID_V4_REGEX: RegExp = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isValidUUID = (data: any): data is UUID => {
  return typeof data === "string" && RFC_4122_UUID_V4_REGEX.test(data);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isValidUUIDArray = (data: any): data is UUID[] => {
  if (!Array.isArray(data)) {
    return false;
  }
  for (const ARRAY_VALUE of data) {
    if (!isValidUUID(ARRAY_VALUE)) {
      return false;
    }
  }
  return true;
};
