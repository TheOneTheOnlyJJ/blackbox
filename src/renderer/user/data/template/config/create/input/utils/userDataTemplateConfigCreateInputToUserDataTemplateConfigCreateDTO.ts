import { IUserDataTemplateConfigCreateDTO } from "@shared/user/data/template/config/create/DTO/UserDataTemplateConfigCreateDTO";
import { IUserDataTemplateConfigCreateInput } from "../UserDataTemplateConfigCreateInput";
import { LogFunctions } from "electron-log";
import { UserDataTemplateFieldConfigCreateInput } from "../../../../field/config/create/input/UserDataTemplateFieldConfigCreateInput";
import { UserDataTemplateFieldConfigCreateDTO } from "@shared/user/data/template/field/config/create/DTO/UserDataTemplateFieldConfigCreateDTO";
import { userDataTemplateFieldConfigCreateInputToUserDataTemplateFieldConfigCreateDTO } from "../../../../field/config/create/input/utils/userDataTemplateFieldConfigCreateInputToUserDataTemplateFieldConfigCreateDTO";

export const userDataTemplateConfigCreateInputToUserDataTemplateConfigCreateDTO = (
  userDataTemplateConfigCreateInput: IUserDataTemplateConfigCreateInput,
  logger: LogFunctions | null
): IUserDataTemplateConfigCreateDTO => {
  logger?.debug("Converting User Data Template Config Create Input to User Data Template Config Create DTO.");
  return {
    storageId: userDataTemplateConfigCreateInput.storageId,
    boxId: userDataTemplateConfigCreateInput.boxId,
    name: userDataTemplateConfigCreateInput.name,
    description: userDataTemplateConfigCreateInput.description ?? null,
    fields: userDataTemplateConfigCreateInput.fields.map(
      (userDataTemplateConfigCreateInput: UserDataTemplateFieldConfigCreateInput): UserDataTemplateFieldConfigCreateDTO => {
        return userDataTemplateFieldConfigCreateInputToUserDataTemplateFieldConfigCreateDTO(userDataTemplateConfigCreateInput, logger);
      }
    )
  } satisfies IUserDataTemplateConfigCreateDTO;
};
