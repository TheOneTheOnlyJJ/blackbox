import { IUserDataTemplateConfigCreateDTO } from "@shared/user/data/template/create/DTO/UserDataTemplateConfigCreateDTO";
import { IUserDataTemplateConfigCreateInput } from "../UserDataTemplateCreateInput";
import { LogFunctions } from "electron-log";

export const userDataTemplateConfigCreateInputToUserDataTemplateConfigCreateDTO = (
  userDataTemplateConfigCreateInput: IUserDataTemplateConfigCreateInput,
  logger: LogFunctions | null
): IUserDataTemplateConfigCreateDTO => {
  logger?.debug("Converting User Data Template Config Create Input to User Data Template Config Create DTO.");
  return {
    storageId: userDataTemplateConfigCreateInput.storageId,
    boxId: userDataTemplateConfigCreateInput.boxId,
    name: userDataTemplateConfigCreateInput.name,
    description: userDataTemplateConfigCreateInput.description ?? null
  } satisfies IUserDataTemplateConfigCreateDTO;
};
