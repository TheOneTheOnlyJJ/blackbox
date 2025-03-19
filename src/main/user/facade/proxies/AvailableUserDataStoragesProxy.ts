import { UserDataStorage } from "@main/user/data/storage/UserDataStorage";

export interface IAvailableUserDataStoragesProxy {
  value: UserDataStorage[]; // TODO: DELETE ALL OF THESE AND THE DIRECTORY
}
