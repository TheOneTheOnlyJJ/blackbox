import { LogFunctions } from "electron-log";
import { IUserDataEntryCreateInput } from "../UserDataEntryCreateInput";
import { IUserDataEntryCreateDTO } from "@shared/user/data/entry/create/DTO/UserDataEntryCreateDTO";

export const userDataEntryCreateInputToUserDataEntryCreateDTO = (
  userDataEntryCreateInput: IUserDataEntryCreateInput,
  logger: LogFunctions | null
): IUserDataEntryCreateDTO => {
  logger?.debug("Converting User Data Entry Create Input to User Data Entry Create DTO.");
  return {
    storageId: userDataEntryCreateInput.storageId,
    boxId: userDataEntryCreateInput.boxId,
    templateId: userDataEntryCreateInput.templateId,
    data: userDataEntryCreateInput.data
  } satisfies IUserDataEntryCreateDTO;
};
