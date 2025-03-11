import { IUserSignInDTO } from "@shared/user/account/UserSignInDTO";
import { IUserSignInPayload } from "../UserSignInPayload";
import { LogFunctions } from "electron-log";

export const userSignInDTOToUserSignInPayload = (userSignInDTO: IUserSignInDTO, logger: LogFunctions | null): IUserSignInPayload => {
  logger?.debug("Converting user sign in DTO to user sign in payload.");
  return {
    username: userSignInDTO.username,
    password: userSignInDTO.password
  } satisfies IUserSignInPayload;
};
