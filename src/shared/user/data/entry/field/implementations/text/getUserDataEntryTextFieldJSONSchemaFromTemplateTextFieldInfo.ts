import { UserDataEntryTextField } from "@shared/user/data/entry/field/implementations/text/UserDataEntryTextField";
import { IUserDataTemplateTextFieldInfo } from "@shared/user/data/template/field/info/implementations/text/UserDataTemplateTextFieldInfo";
import { JSONSchemaType } from "ajv";
import { LogFunctions } from "electron-log";

export const getUserDataEntryTextFieldJSONSchemaFromTemplateTextFieldInfo = (
  userDataTemplateTextFieldInfo: IUserDataTemplateTextFieldInfo,
  logger: LogFunctions | null
): JSONSchemaType<UserDataEntryTextField> => {
  logger?.debug("Getting User Data Entry Text Field JSON Schema from User Data Template Text Field Info.");
  return {
    type: "string",
    title: userDataTemplateTextFieldInfo.name,
    default: userDataTemplateTextFieldInfo.default ?? undefined
  } satisfies JSONSchemaType<UserDataEntryTextField>;
};
