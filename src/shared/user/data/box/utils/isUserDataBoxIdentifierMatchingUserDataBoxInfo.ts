import { IUserDataBoxIdentifier } from "../identifier/UserDataBoxIdentifier";
import { IUserDataBoxInfo } from "../info/UserDataBoxInfo";

export const isUserDataBoxIdentifierMatchingUserDataBoxInfo = (
  userDataBoxIdentifier: IUserDataBoxIdentifier,
  userDataBoxInfo: IUserDataBoxInfo
): boolean => {
  return userDataBoxIdentifier.boxId === userDataBoxInfo.boxId && userDataBoxIdentifier.storageId === userDataBoxInfo.storageId;
};
