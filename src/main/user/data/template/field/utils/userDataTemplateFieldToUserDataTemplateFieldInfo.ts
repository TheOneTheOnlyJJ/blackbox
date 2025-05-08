import { UserDataTemplateFieldInfo } from "@shared/user/data/template/field/info/UserDataTemplateFieldInfo";
import { UserDataTemplateField } from "../UserDataTemplateField";
import { LogFunctions } from "electron-log";
import { USER_DATA_TEMPLATE_FIELD_TYPES } from "@shared/user/data/template/field/UserDataTemplateFieldType";
import { userDataTemplateIntegerFieldToUserDataTemplateIntegerFieldInfo } from "../implementations/integer/utils/userDataTemplateIntegerFieldToUserDataTemplateIntegerFieldInfo";
import { userDataTemplateRealFieldToUserDataTemplateRealFieldInfo } from "../implementations/real/utils/userDataTemplateRealFieldToUserDataTemplateRealFieldInfo";
import { userDataTemplateTextFieldToUserDataTemplateTextFieldInfo } from "../implementations/text/utils/userDataTemplateTextFieldToUserDataTemplateTextFieldInfo";

export const userDataTemplateFieldToUserDataTemplateFieldInfo = (
  userDataTemplateField: UserDataTemplateField,
  logger: LogFunctions | null
): UserDataTemplateFieldInfo => {
  logger?.debug("Converting User Data Template Field to User Data Template Field Info.");
  switch (userDataTemplateField.type) {
    case USER_DATA_TEMPLATE_FIELD_TYPES.integer:
      return userDataTemplateIntegerFieldToUserDataTemplateIntegerFieldInfo(userDataTemplateField, logger);
    case USER_DATA_TEMPLATE_FIELD_TYPES.real:
      return userDataTemplateRealFieldToUserDataTemplateRealFieldInfo(userDataTemplateField, logger);
    case USER_DATA_TEMPLATE_FIELD_TYPES.text:
      return userDataTemplateTextFieldToUserDataTemplateTextFieldInfo(userDataTemplateField, logger);
  }
};
