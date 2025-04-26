import { IUserDataTemplateConfigCreateDTO } from "@shared/user/data/template/create/DTO/UserDataTemplateConfigCreateDTO";
import { LogFunctions } from "electron-log";
import { UUID } from "node:crypto";
import { IUserDataTemplateConfig } from "../UserDataTemplateConfig";

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
    description: userDataTemplateConfigCreateDTO.description
  } satisfies IUserDataTemplateConfig;
};
