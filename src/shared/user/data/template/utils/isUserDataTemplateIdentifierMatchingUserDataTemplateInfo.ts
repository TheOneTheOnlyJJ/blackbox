import { IUserDataTemplateIdentifier } from "../identifier/UserDataTemplateIdentifier";
import { IUserDataTemplateInfo } from "../info/UserDataTemplateInfo";

export const isUserDataTemplateIdentifierMatchingUserDataTemplateInfo = (
  userDataTemplateIdentifier: IUserDataTemplateIdentifier,
  userDataTemplateInfo: IUserDataTemplateInfo
): boolean => {
  return (
    userDataTemplateIdentifier.templateId === userDataTemplateInfo.templateId &&
    userDataTemplateIdentifier.boxId === userDataTemplateInfo.boxId &&
    userDataTemplateIdentifier.storageId === userDataTemplateInfo.storageId
  );
};
