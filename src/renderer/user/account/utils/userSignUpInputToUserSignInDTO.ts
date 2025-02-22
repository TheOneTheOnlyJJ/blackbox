import { LogFunctions } from "electron-log";
import { IUserSignUpInput } from "../UserSignUpInput";
import { IUserSignInDTO } from "@shared/user/account/UserSignInDTO";

export const userSignUpInputToUserSignInDTO = (userSignUpInput: IUserSignUpInput, logger: LogFunctions): IUserSignInDTO => {
  logger.debug("Converting user sign up input to user sign in DTO.");
  return {
    username: userSignUpInput.username,
    password: userSignUpInput.password
  } satisfies IUserSignInDTO;
};
