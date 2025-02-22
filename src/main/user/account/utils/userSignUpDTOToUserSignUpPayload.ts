import { IUserSignUpDTO } from "@shared/user/account/UserSignUpDTO";
import { LogFunctions } from "electron-log";
import { IUserSignUpPayload } from "../UserSignUpPayload";
import { UUID } from "node:crypto";

export const userSignUpDTOToUserSignUpPayload = (userSignUpDTO: IUserSignUpDTO, userId: UUID, logger: LogFunctions): IUserSignUpPayload => {
  logger.debug("Converting user sign up DTO to user sign up payload.");
  return {
    userId: userId,
    username: userSignUpDTO.username,
    password: userSignUpDTO.password
  } satisfies IUserSignUpPayload;
};
