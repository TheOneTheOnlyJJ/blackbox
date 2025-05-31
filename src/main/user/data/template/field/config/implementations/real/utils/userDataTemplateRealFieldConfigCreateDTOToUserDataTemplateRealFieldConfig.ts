import { IUserDataTemplateRealFieldConfigCreateDTO } from "@shared/user/data/template/field/config/create/DTO/implementations/real/UserDataTemplateRealFieldConfigCreateDTO";
import { LogFunctions } from "electron-log";
import { IUserDataTemplateRealFieldConfig } from "../UserDataTemplateRealFieldConfig";

export const userDataTemplateRealFieldConfigCreateDTOToUserDataTemplateRealFieldConfig = (
  userDataTemplateRealFieldConfigCreateDTO: IUserDataTemplateRealFieldConfigCreateDTO,
  logger: LogFunctions | null
): IUserDataTemplateRealFieldConfig => {
  logger?.debug("Converting User Data Template Real Field Config Create DTO to User Data Template Real Field Config.");
  return {
    type: userDataTemplateRealFieldConfigCreateDTO.type,
    name: userDataTemplateRealFieldConfigCreateDTO.name,
    description: userDataTemplateRealFieldConfigCreateDTO.description,
    isRequired: userDataTemplateRealFieldConfigCreateDTO.isRequired,
    minimum: userDataTemplateRealFieldConfigCreateDTO.minimum,
    maximum: userDataTemplateRealFieldConfigCreateDTO.maximum,
    multipleOf: userDataTemplateRealFieldConfigCreateDTO.multipleOf,
    default: userDataTemplateRealFieldConfigCreateDTO.default
  } satisfies IUserDataTemplateRealFieldConfig;
};
