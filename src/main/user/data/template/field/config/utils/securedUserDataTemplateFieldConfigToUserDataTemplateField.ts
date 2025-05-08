import { LogFunctions } from "electron-log";
import { UserDataTemplateField } from "../../UserDataTemplateField";
import { SecuredUserDataTemplateFieldConfig } from "../SecuredUserDataTemplateFieldConfig";
import { USER_DATA_TEMPLATE_FIELD_TYPES } from "@shared/user/data/template/field/UserDataTemplateFieldType";
import { securedUserDataTemplateIntegerFieldConfigToUserDataTemplateIntegerField } from "../implementations/integer/utils/securedUserDataTemplateIntegerFieldConfigToUserDataTemplateIntegerField";
import { securedUserDataTemplateRealFieldConfigToUserDataTemplateRealField } from "../implementations/real/utils/securedUserDataTemplateRealFieldConfigToUserDataTemplateRealField";
import { securedUserDataTemplateTextFieldConfigToUserDataTemplateTextField } from "../implementations/text/utils/securedUserDataTemplateTextFieldConfigToUserDataTemplateTextField";

export const securedUserDataTemplateFieldConfigToUserDataTemplateField = (
  securedUserDataTemplateFieldConfig: SecuredUserDataTemplateFieldConfig,
  logger: LogFunctions | null
): UserDataTemplateField => {
  logger?.debug("Converting User Data Template Field Config to User Data Template Field.");
  switch (securedUserDataTemplateFieldConfig.type) {
    case USER_DATA_TEMPLATE_FIELD_TYPES.integer:
      return securedUserDataTemplateIntegerFieldConfigToUserDataTemplateIntegerField(securedUserDataTemplateFieldConfig, logger);
    case USER_DATA_TEMPLATE_FIELD_TYPES.real:
      return securedUserDataTemplateRealFieldConfigToUserDataTemplateRealField(securedUserDataTemplateFieldConfig, logger);
    case USER_DATA_TEMPLATE_FIELD_TYPES.text:
      return securedUserDataTemplateTextFieldConfigToUserDataTemplateTextField(securedUserDataTemplateFieldConfig, logger);
  }
};
