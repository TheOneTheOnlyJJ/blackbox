import { UserDataStorage } from "../UserDataStorage";

export const isValidUserDataStorageArray = (data: unknown): data is UserDataStorage[] => {
  if (!Array.isArray(data)) {
    return false;
  }
  for (const ARRAY_VALUE of data) {
    if (!(ARRAY_VALUE instanceof UserDataStorage)) {
      return false;
    }
  }
  return true;
};
