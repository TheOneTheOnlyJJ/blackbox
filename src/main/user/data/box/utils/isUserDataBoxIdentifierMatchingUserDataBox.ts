import { IUserDataBoxIdentifier } from "@shared/user/data/box/identifier/UserDataBoxIdentifier";
import { IUserDataBox } from "../UserDataBox";

export const isUserDataBoxIdentifierMatchingUserDataBox = (userDataBoxIdentifier: IUserDataBoxIdentifier, userDataBox: IUserDataBox): boolean => {
  return userDataBoxIdentifier.boxId === userDataBox.boxId && userDataBoxIdentifier.storageId === userDataBox.storageId;
};
