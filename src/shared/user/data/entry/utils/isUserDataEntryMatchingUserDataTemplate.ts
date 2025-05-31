import { IUserDataTemplateIdentifier } from "../../template/identifier/UserDataTemplateIdentifier";
import { IUserDataEntryIdentifier } from "../identifier/UserDataEntryIdentifier";

export const isUserDataEntryMatchingUserDataTemplate = (
  userDataEntryIdentifier: IUserDataEntryIdentifier,
  userDataTemplateIdentifier: IUserDataTemplateIdentifier
): boolean => {
  return (
    userDataEntryIdentifier.storageId === userDataTemplateIdentifier.storageId &&
    userDataEntryIdentifier.boxId === userDataTemplateIdentifier.boxId &&
    userDataEntryIdentifier.templateId === userDataTemplateIdentifier.templateId
  );
};
