import { LogFunctions } from "electron-log";
import { UserDataTemplateFieldConfigCreateInput } from "../UserDataTemplateFieldConfigCreateInput";
import { UserDataTemplateFieldConfigCreateDTO } from "@shared/user/data/template/field/config/create/DTO/UserDataTemplateFieldConfigCreateDTO";
import { USER_DATA_TEMPLATE_FIELD_TYPES } from "@shared/user/data/template/field/UserDataTemplateFieldType";
import { userDataTemplateIntegerFieldConfigCreateInputToUserDataTemplateIntegerFieldConfigCreateDTO } from "../implementations/integer/utils/userDataTemplateIntegerFieldConfigCreateInputToUserDataTemplateIntegerFieldConfigCreateDTO";
import { userDataTemplateRealFieldConfigCreateInputToUserDataTemplateRealFieldConfigCreateDTO } from "../implementations/real/utils/userDataTemplateRealFieldConfigCreateInputToUserDataTemplateRealFieldConfigCreateDTO";
import { userDataTemplateTextFieldConfigCreateInputToUserDataTemplateTextFieldConfigCreateDTO } from "../implementations/text/utils/userDataTemplateTextFieldConfigCreateInputToUserDataTemplateTextFieldConfigCreateDTO";

export const userDataTemplateFieldConfigCreateInputToUserDataTemplateFieldConfigCreateDTO = (
  userDataTemplateFieldConfigCreateInput: UserDataTemplateFieldConfigCreateInput,
  logger: LogFunctions | null
): UserDataTemplateFieldConfigCreateDTO => {
  logger?.debug("Converting User Data Template Field Config Create Input to User Data Template Field Config Create DTO.");
  switch (userDataTemplateFieldConfigCreateInput.type) {
    case USER_DATA_TEMPLATE_FIELD_TYPES.integer:
      return userDataTemplateIntegerFieldConfigCreateInputToUserDataTemplateIntegerFieldConfigCreateDTO(
        userDataTemplateFieldConfigCreateInput,
        logger
      );
    case USER_DATA_TEMPLATE_FIELD_TYPES.real:
      return userDataTemplateRealFieldConfigCreateInputToUserDataTemplateRealFieldConfigCreateDTO(userDataTemplateFieldConfigCreateInput, logger);
    case USER_DATA_TEMPLATE_FIELD_TYPES.text:
      return userDataTemplateTextFieldConfigCreateInputToUserDataTemplateTextFieldConfigCreateDTO(userDataTemplateFieldConfigCreateInput, logger);
  }
};
