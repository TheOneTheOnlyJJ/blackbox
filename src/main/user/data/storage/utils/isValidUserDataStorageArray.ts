import { UserDataStorage } from "../UserDataStorage";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isValidUserDataStorageArray = (data: any): data is UserDataStorage[] => {
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
