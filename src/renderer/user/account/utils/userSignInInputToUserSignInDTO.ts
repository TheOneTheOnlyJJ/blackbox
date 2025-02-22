import { IUserSignInDTO } from "@shared/user/account/UserSignInDTO";
import { IUserSignInInput } from "../UserSignInInput";
import { LogFunctions } from "electron-log";

export const userSignInInputToUserSignInDTO = (userSignInInput: IUserSignInInput, logger: LogFunctions): IUserSignInDTO => {
  logger.debug("Converting user sign in input to user sign in DTO.");
  return {
    username: userSignInInput.username,
    password: userSignInInput.password
  } satisfies IUserSignInDTO;
};
