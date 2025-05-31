import { IUserDataTemplateIntegerFieldConfigCreateDTO } from "@shared/user/data/template/field/config/create/DTO/implementations/integer/UserDataTemplateIntegerFieldConfigCreateDTO";
import { LogFunctions } from "electron-log";
import { IUserDataTemplateIntegerFieldConfig } from "../UserDataTemplateIntegerFieldConfig";

export const userDataTemplateIntegerFieldConfigCreateDTOToUserDataTemplateIntegerFieldConfig = (
  userDataTemplateIntegerFieldConfigCreateDTO: IUserDataTemplateIntegerFieldConfigCreateDTO,
  logger: LogFunctions | null
): IUserDataTemplateIntegerFieldConfig => {
  logger?.debug("Converting User Data Template Integer Field Config Create DTO to User Data Template Integer Field Config.");
  return {
    type: userDataTemplateIntegerFieldConfigCreateDTO.type,
    name: userDataTemplateIntegerFieldConfigCreateDTO.name,
    description: userDataTemplateIntegerFieldConfigCreateDTO.description,
    isRequired: userDataTemplateIntegerFieldConfigCreateDTO.isRequired,
    minimum: userDataTemplateIntegerFieldConfigCreateDTO.minimum,
    maximum: userDataTemplateIntegerFieldConfigCreateDTO.maximum,
    multipleOf: userDataTemplateIntegerFieldConfigCreateDTO.multipleOf,
    default: userDataTemplateIntegerFieldConfigCreateDTO.default
  } satisfies IUserDataTemplateIntegerFieldConfig;
};
