import { IUserDataTemplateConfigCreateDTO } from "@shared/user/data/template/config/create/DTO/UserDataTemplateConfigCreateDTO";
import { LogFunctions } from "electron-log";
import { UUID } from "node:crypto";
import { IUserDataTemplateConfig } from "../UserDataTemplateConfig";
import { UserDataTemplateFieldConfigCreateDTO } from "@shared/user/data/template/field/config/create/DTO/UserDataTemplateFieldConfigCreateDTO";
import { UserDataTemplateFieldConfig } from "../../field/config/UserDataTemplateFieldConfig";
import { userDataTemplateFieldConfigCreateDTOToUserDataTemplateFieldConfig } from "../../field/config/utils/userDataTemplateFieldConfigCreateDTOToUserDataTemplateFieldConfig";

export const userDataTemplateConfigCreateDTOToUserDataTemplateConfig = (
  userDataTemplateConfigCreateDTO: IUserDataTemplateConfigCreateDTO,
  templateId: UUID,
  logger: LogFunctions | null
): IUserDataTemplateConfig => {
  logger?.debug("Converting User Data Template Config Create DTO to User Data Template Config.");
  return {
    templateId: templateId,
    storageId: userDataTemplateConfigCreateDTO.storageId as UUID,
    boxId: userDataTemplateConfigCreateDTO.boxId as UUID,
    name: userDataTemplateConfigCreateDTO.name,
    description: userDataTemplateConfigCreateDTO.description,
    fields: userDataTemplateConfigCreateDTO.fields.map(
      (userDataTemplateFieldConfigCreateDTO: UserDataTemplateFieldConfigCreateDTO): UserDataTemplateFieldConfig => {
        return userDataTemplateFieldConfigCreateDTOToUserDataTemplateFieldConfig(userDataTemplateFieldConfigCreateDTO, logger);
      }
    )
  } satisfies IUserDataTemplateConfig;
};
