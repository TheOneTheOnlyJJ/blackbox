import { LogFunctions } from "electron-log";
import { SecuredUserDataTemplateFieldConfig } from "../SecuredUserDataTemplateFieldConfig";
import { UserDataTemplateFieldConfig } from "../UserDataTemplateFieldConfig";
import { USER_DATA_TEMPLATE_FIELD_TYPES } from "@shared/user/data/template/field/UserDataTemplateFieldType";
import { userDataTemplateIntegerFieldConfigToSecuredUserDataTemplateIntegerFieldConfig } from "../implementations/integer/utils/userDataTemplateIntegerFieldConfigToSecuredUserDataTemplateIntegerFieldConfig";
import { userDataTemplateRealFieldConfigToSecuredUserDataTemplateRealFieldConfig } from "../implementations/real/utils/userDataTemplateRealFieldConfigToSecuredUserDataTemplateRealFieldConfig";
import { userDataTemplateTextFieldConfigToSecuredUserDataTemplateTextFieldConfig } from "../implementations/text/utils/userDataTemplateTextFieldConfigToSecuredUserDataTemplateTextFieldConfig";

export const userDataTemplateFieldConfigToSecuredUserDataTemplateFieldConfig = (
  userDataTemplateFieldConfig: UserDataTemplateFieldConfig,
  logger: LogFunctions | null
): SecuredUserDataTemplateFieldConfig => {
  logger?.debug("Converting User Data Template Field Config to Secured User Data Template Field Config.");
  switch (userDataTemplateFieldConfig.type) {
    case USER_DATA_TEMPLATE_FIELD_TYPES.integer:
      return userDataTemplateIntegerFieldConfigToSecuredUserDataTemplateIntegerFieldConfig(userDataTemplateFieldConfig, logger);
    case USER_DATA_TEMPLATE_FIELD_TYPES.real:
      return userDataTemplateRealFieldConfigToSecuredUserDataTemplateRealFieldConfig(userDataTemplateFieldConfig, logger);
    case USER_DATA_TEMPLATE_FIELD_TYPES.text:
      return userDataTemplateTextFieldConfigToSecuredUserDataTemplateTextFieldConfig(userDataTemplateFieldConfig, logger);
  }
};
