import { IUserDataTemplateTextFieldConfigCreateDTO } from "@shared/user/data/template/field/config/create/DTO/implementations/text/UserDataTemplateTextFieldConfigCreateDTO";
import { LogFunctions } from "electron-log";
import { IUserDataTemplateTextFieldConfig } from "../UserDataTemplateTextFieldConfig";

export const userDataTemplateTextFieldConfigCreateDTOToUserDataTemplateTextFieldConfig = (
  userDataTemplateTextFieldConfigCreateDTO: IUserDataTemplateTextFieldConfigCreateDTO,
  logger: LogFunctions | null
): IUserDataTemplateTextFieldConfig => {
  logger?.debug("Converting User Data Template Text Field Config Create DTO to User Data Template Text Field Config.");
  return {
    type: userDataTemplateTextFieldConfigCreateDTO.type,
    name: userDataTemplateTextFieldConfigCreateDTO.name,
    description: userDataTemplateTextFieldConfigCreateDTO.description,
    useTextBox: userDataTemplateTextFieldConfigCreateDTO.useTextBox,
    default: userDataTemplateTextFieldConfigCreateDTO.default
  } satisfies IUserDataTemplateTextFieldConfig;
};
