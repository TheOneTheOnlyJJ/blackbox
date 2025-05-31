import { IUserDataEntryIdentifier } from "@shared/user/data/entry/identifier/UserDataEntryIdentifier";
import { IUserDataEntry } from "../UserDataEntry";

export const isUserDataEntryIdentifierMatchingUserDataEntry = (
  userDataEntryIdentifier: IUserDataEntryIdentifier,
  userDataEntry: IUserDataEntry
): boolean => {
  return (
    userDataEntryIdentifier.entryId === userDataEntry.entryId &&
    userDataEntryIdentifier.storageId === userDataEntry.storageId &&
    userDataEntryIdentifier.boxId === userDataEntry.boxId &&
    userDataEntryIdentifier.templateId === userDataEntry.templateId
  );
};
