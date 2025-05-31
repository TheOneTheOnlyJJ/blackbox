import { IUserDataEntryIdentifier } from "@shared/user/data/entry/identifier/UserDataEntryIdentifier";
import { IUserDataEntryInfo } from "../info/UserDataEntryInfo";

export const isUserDataEntryIdentifierMatchingUserDataEntryInfo = (
  userDataEntryIdentifier: IUserDataEntryIdentifier,
  userDataEntryInfo: IUserDataEntryInfo
): boolean => {
  return (
    userDataEntryIdentifier.entryId === userDataEntryInfo.entryId &&
    userDataEntryIdentifier.storageId === userDataEntryInfo.storageId &&
    userDataEntryIdentifier.boxId === userDataEntryInfo.boxId &&
    userDataEntryIdentifier.templateId === userDataEntryInfo.templateId
  );
};
