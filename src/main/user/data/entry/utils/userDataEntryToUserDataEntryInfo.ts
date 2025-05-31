import { LogFunctions } from "electron-log";
import { IUserDataEntry } from "../UserDataEntry";
import { IUserDataEntryInfo } from "@shared/user/data/entry/info/UserDataEntryInfo";

export const userDataEntryToUserDataEntryInfo = (userDataEntry: IUserDataEntry, logger: LogFunctions | null): IUserDataEntryInfo => {
  logger?.debug("Converting User Data Entry to User Data Entry Info.");
  return {
    entryId: userDataEntry.entryId,
    storageId: userDataEntry.storageId,
    boxId: userDataEntry.boxId,
    templateId: userDataEntry.templateId,
    data: userDataEntry.data
  } satisfies IUserDataEntryInfo;
};
