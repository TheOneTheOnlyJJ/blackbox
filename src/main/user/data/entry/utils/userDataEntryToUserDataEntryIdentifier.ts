import { IUserDataEntryIdentifier } from "@shared/user/data/entry/identifier/UserDataEntryIdentifier";
import { LogFunctions } from "electron-log";
import { IUserDataEntry } from "../UserDataEntry";

export const userDataEntryToUserDataEntryIdentifier = (userDataEntry: IUserDataEntry, logger: LogFunctions | null): IUserDataEntryIdentifier => {
  logger?.debug("Converting User Data Entry to User Data Entry Identifier.");
  return {
    entryId: userDataEntry.entryId,
    storageId: userDataEntry.storageId,
    boxId: userDataEntry.boxId,
    templateId: userDataEntry.templateId
  } satisfies IUserDataEntryIdentifier;
};
