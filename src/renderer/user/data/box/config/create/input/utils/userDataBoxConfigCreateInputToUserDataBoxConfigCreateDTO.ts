import { LogFunctions } from "electron-log";
import { IUserDataBoxConfigCreateInput } from "../UserDataBoxConfigCreateInput";
import { IUserDataBoxConfigCreateDTO } from "@shared/user/data/box/create/DTO/UserDataBoxConfigCreateDTO";

export const userDataBoxConfigCreateInputToUserDataBoxConfigCreateDTO = (
  userDataBoxConfigCreateInput: IUserDataBoxConfigCreateInput,
  logger: LogFunctions | null
): IUserDataBoxConfigCreateDTO => {
  logger?.debug("Converting User Data Box Config Create Input to User Data Box Config Create DTO.");
  return {
    storageId: userDataBoxConfigCreateInput.storageId,
    name: userDataBoxConfigCreateInput.name,
    description: userDataBoxConfigCreateInput.description ?? null
  } satisfies IUserDataBoxConfigCreateDTO;
};
