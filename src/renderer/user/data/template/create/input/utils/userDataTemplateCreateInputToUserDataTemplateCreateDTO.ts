import { IUserDataTemplateCreateDTO } from "@shared/user/data/template/create/DTO/UserDataTemplateCreateDTO";
import { IUserDataTemplateCreateInput } from "../UserDataTemplateCreateInput";
import { LogFunctions } from "electron-log";

export const userDataTemplateCreateInputToUserDataTemplateCreateDTO = (
  userDataTemplateCreateInput: IUserDataTemplateCreateInput,
  logger: LogFunctions | null
): IUserDataTemplateCreateDTO => {
  logger?.debug("Converting User Data Template Create Input to User Data Template Create DTO.");
  return {
    storageId: userDataTemplateCreateInput.storageId,
    boxId: userDataTemplateCreateInput.boxId,
    name: userDataTemplateCreateInput.name,
    description: userDataTemplateCreateInput.description ?? null
  } satisfies IUserDataTemplateCreateDTO;
};
