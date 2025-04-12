import { IUserDataBoxConfigCreateDTO } from "@shared/user/data/box/create/DTO/UserDataBoxConfigCreateDTO";
import { IUserDataBoxConfig } from "../UserDataBoxConfig";
import { LogFunctions } from "electron-log";
import { UUID } from "node:crypto";

export const userDataBoxConfigCreateDTOToUserDataBoxConfig = (
  userDataBoxConfigCreateDTO: IUserDataBoxConfigCreateDTO,
  boxId: UUID,
  logger: LogFunctions | null
): IUserDataBoxConfig => {
  logger?.debug("Converting User Data Box Config Create DTO to User Data Box Config.");
  return {
    boxId: boxId,
    storageId: userDataBoxConfigCreateDTO.storageId as UUID,
    name: userDataBoxConfigCreateDTO.name,
    description: userDataBoxConfigCreateDTO.description
  } satisfies IUserDataBoxConfig;
};
