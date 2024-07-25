import { IUser, UserId } from "../user/IUser";
import { IUserStorageIPCInfo } from "./IUserStorageIPCInfo";

export interface IUserStorage {
  isLocal: () => boolean;
  addUser: (user: IUser) => boolean;
  deleteUser: (userId: UserId) => boolean;
  deleteUsers: (userIds: UserId[]) => boolean;
  getUser: (userId: UserId) => IUser;
  getUsers: (userIds: UserId[]) => IUser[];
  getAllUsers: () => IUser[];
  getUserCount: () => number;
  isIdValid: (id: UserId) => boolean;
  close: () => boolean;
  getIPCInfo: () => IUserStorageIPCInfo;
}
