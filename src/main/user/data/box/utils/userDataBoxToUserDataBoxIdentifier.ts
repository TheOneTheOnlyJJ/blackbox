import { IUserDataBoxIdentifier } from "@shared/user/data/box/identifier/UserDataBoxIdentifier";
import { IUserDataBox } from "../UserDataBox";
import { LogFunctions } from "electron-log";

export const userDataBoxToUserDataBoxIdentifier = (userDataBox: IUserDataBox, logger: LogFunctions | null): IUserDataBoxIdentifier => {
  logger?.debug("Converting User Data Box to User Data Box Identifier.");
  return {
    boxId: userDataBox.boxId,
    storageId: userDataBox.storageId
  } satisfies IUserDataBoxIdentifier;
};
