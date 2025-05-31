import { LogFunctions } from "electron-log";
import { IPrivateStorageSecuredUserDataEntry } from "../PrivateStorageSecuredUserDataEntry";
import { IUserDataEntry } from "../UserDataEntry";

export const userDataEntryToPrivateStorageSecuredUserDataEntry = (
  userDataEntry: IUserDataEntry,
  logger: LogFunctions | null
): IPrivateStorageSecuredUserDataEntry => {
  logger?.debug("Converting User Data Entry to Private Storage Secured User Data Entry.");
  return {
    data: userDataEntry.data
  } satisfies IPrivateStorageSecuredUserDataEntry;
};
