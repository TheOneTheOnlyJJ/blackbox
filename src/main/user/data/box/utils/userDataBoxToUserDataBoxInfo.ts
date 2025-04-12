import { LogFunctions } from "electron-log";
import { IUserDataBox } from "../UserDataBox";
import { IUserDataBoxInfo } from "@shared/user/data/box/info/UserDataBoxInfo";

export const userDataBoxToUserDataBoxInfo = (userDataBox: IUserDataBox, logger: LogFunctions | null): IUserDataBoxInfo => {
  logger?.debug("Converting User Data Box to User Data Box Info.");
  return {
    boxId: userDataBox.boxId,
    storageId: userDataBox.storageId,
    name: userDataBox.name,
    description: userDataBox.description
  } satisfies IUserDataBoxInfo;
};
