import { IUserDataEntryCreateDTO } from "@shared/user/data/entry/create/DTO/UserDataEntryCreateDTO";
import { LogFunctions } from "electron-log";
import { IUserDataEntry } from "../UserDataEntry";
import { UUID } from "node:crypto";

export const userDataEntryCreateDTOToUserDataEntry = (
  userDataEntryCreateDTO: IUserDataEntryCreateDTO,
  entryId: UUID,
  logger: LogFunctions | null
): IUserDataEntry => {
  logger?.debug("Converting User Data Entry Create DTO to User Data Entry.");
  return {
    entryId: entryId,
    storageId: userDataEntryCreateDTO.storageId as UUID,
    boxId: userDataEntryCreateDTO.boxId as UUID,
    templateId: userDataEntryCreateDTO.templateId as UUID,
    data: userDataEntryCreateDTO.data
  } satisfies IUserDataEntry;
};
