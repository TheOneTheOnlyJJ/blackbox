import { UUID } from "node:crypto";

// https://nodejs.org/api/crypto.html#cryptorandomuuidoptions
export const RFC_4122_UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const isValidUUID = (data: unknown): data is UUID => {
  return typeof data === "string" && RFC_4122_UUID_V4_REGEX.test(data);
};

export const isValidUUIDArray = (data: unknown): data is UUID[] => {
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
