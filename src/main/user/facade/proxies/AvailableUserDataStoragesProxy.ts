import { UserDataStorage } from "@main/user/data/storage/UserDataStorage";

export interface IAvailableUserDataStoragesProxy {
  value: UserDataStorage[]; // TODO: Make this readonly?
}
