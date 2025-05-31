import { LogFunctions } from "electron-log";
import { IUserDataTemplateIntegerField } from "../UserDataTemplateIntegerField";
import { IUserDataTemplateIntegerFieldInfo } from "@shared/user/data/template/field/info/implementations/integer/UserDataTemplateIntegerFieldInfo";

export const userDataTemplateIntegerFieldToUserDataTemplateIntegerFieldInfo = (
  userDataTemplateIntegerField: IUserDataTemplateIntegerField,
  logger: LogFunctions | null
): IUserDataTemplateIntegerFieldInfo => {
  logger?.debug("Converting User Data Template Integer Field to User Data Template Integer Field Info.");
  return {
    type: userDataTemplateIntegerField.type,
    name: userDataTemplateIntegerField.name,
    description: userDataTemplateIntegerField.description,
    isRequired: userDataTemplateIntegerField.isRequired,
    minimum: userDataTemplateIntegerField.minimum,
    maximum: userDataTemplateIntegerField.maximum,
    multipleOf: userDataTemplateIntegerField.multipleOf,
    default: userDataTemplateIntegerField.default
  } satisfies IUserDataTemplateIntegerFieldInfo;
};
