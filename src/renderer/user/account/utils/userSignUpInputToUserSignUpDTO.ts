import { LogFunctions } from "electron-log";
import { IUserSignUpInput } from "../UserSignUpInput";
import { IUserSignUpDTO } from "@shared/user/account/UserSignUpDTO";

export const userSignUpInputToUserSignUpDTO = (userSignUpInput: IUserSignUpInput, logger: LogFunctions): IUserSignUpDTO => {
  logger.debug("Converting user sign up input to user sign up DTO.");
  return {
    username: userSignUpInput.username,
    password: userSignUpInput.password
  } satisfies IUserSignUpDTO;
};
