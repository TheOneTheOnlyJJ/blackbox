import { UserDataStorage } from "../UserDataStorage";

export const isValidUserDataStorageArray = (data: unknown): data is UserDataStorage[] => {
  if (!Array.isArray(data)) {
    return false;
  }
  return data.every((value: unknown): value is UserDataStorage => {
    return value instanceof UserDataStorage;
  });
};
