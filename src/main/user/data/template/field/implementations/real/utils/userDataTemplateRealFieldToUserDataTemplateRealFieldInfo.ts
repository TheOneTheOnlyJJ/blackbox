import { IUserDataTemplateRealFieldInfo } from "@shared/user/data/template/field/info/implementations/real/UserDataTemplateRealFieldInfo";
import { LogFunctions } from "electron-log";
import { IUserDataTemplateRealField } from "../UserDataTemplateRealField";

export const userDataTemplateRealFieldToUserDataTemplateRealFieldInfo = (
  userDataTemplateRealField: IUserDataTemplateRealField,
  logger: LogFunctions | null
): IUserDataTemplateRealFieldInfo => {
  logger?.debug("Converting User Data Template Real Field to User Data Template Real Field Info.");
  return {
    type: userDataTemplateRealField.type,
    name: userDataTemplateRealField.name,
    description: userDataTemplateRealField.description,
    isRequired: userDataTemplateRealField.isRequired,
    minimum: userDataTemplateRealField.minimum,
    maximum: userDataTemplateRealField.maximum,
    multipleOf: userDataTemplateRealField.multipleOf,
    default: userDataTemplateRealField.default
  } satisfies IUserDataTemplateRealFieldInfo;
};
