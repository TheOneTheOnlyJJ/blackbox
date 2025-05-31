import { LogFunctions } from "electron-log";
import { IUserDataTemplateTextFieldConfigCreateInput } from "../UserDataTemplateTextFieldConfigCreateInput";
import { IUserDataTemplateTextFieldConfigCreateDTO } from "@shared/user/data/template/field/config/create/DTO/implementations/text/UserDataTemplateTextFieldConfigCreateDTO";

export const userDataTemplateTextFieldConfigCreateInputToUserDataTemplateTextFieldConfigCreateDTO = (
  userDataTemplateTextFieldConfigCreateInput: IUserDataTemplateTextFieldConfigCreateInput,
  logger: LogFunctions | null
): IUserDataTemplateTextFieldConfigCreateDTO => {
  logger?.debug("Converting User Data Template Text Field Config Create Input to User Data Template Text Field Config Create DTO.");
  return {
    type: userDataTemplateTextFieldConfigCreateInput.type,
    name: userDataTemplateTextFieldConfigCreateInput.name,
    description: userDataTemplateTextFieldConfigCreateInput.description ?? null,
    isRequired: userDataTemplateTextFieldConfigCreateInput.isRequired ?? false,
    useTextBox: userDataTemplateTextFieldConfigCreateInput.textUseTextBox ?? false,
    default: userDataTemplateTextFieldConfigCreateInput.textDefault ?? null
  } satisfies IUserDataTemplateTextFieldConfigCreateDTO;
};
