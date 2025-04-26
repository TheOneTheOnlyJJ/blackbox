import { IUserDataTemplateIdentifier } from "@shared/user/data/template/identifier/UserDataTemplateIdentifier";
import { IUserDataTemplate } from "../UserDataTemplate";

export const isUserDataTemplateIdentifierMatchingUserDataTemplate = (
  userDataTemplateIdentifier: IUserDataTemplateIdentifier,
  userDataTemplate: IUserDataTemplate
): boolean => {
  return (
    userDataTemplateIdentifier.templateId === userDataTemplate.templateId &&
    userDataTemplateIdentifier.boxId === userDataTemplate.boxId &&
    userDataTemplateIdentifier.storageId === userDataTemplate.storageId
  );
};
