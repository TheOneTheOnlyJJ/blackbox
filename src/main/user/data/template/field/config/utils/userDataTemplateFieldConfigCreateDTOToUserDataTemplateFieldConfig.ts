import { UserDataTemplateFieldConfigCreateDTO } from "@shared/user/data/template/field/config/create/DTO/UserDataTemplateFieldConfigCreateDTO";
import { USER_DATA_TEMPLATE_FIELD_TYPES } from "@shared/user/data/template/field/UserDataTemplateFieldType";
import { LogFunctions } from "electron-log";
import { UserDataTemplateFieldConfig } from "../UserDataTemplateFieldConfig";
import { userDataTemplateIntegerFieldConfigCreateDTOToUserDataTemplateIntegerFieldConfig } from "../implementations/integer/utils/userDataTemplateIntegerFieldConfigCreateDTOToUserDataTemplateIntegerFieldConfig";
import { userDataTemplateRealFieldConfigCreateDTOToUserDataTemplateRealFieldConfig } from "../implementations/real/utils/userDataTemplateRealFieldConfigCreateDTOToUserDataTemplateRealFieldConfig";
import { userDataTemplateTextFieldConfigCreateDTOToUserDataTemplateTextFieldConfig } from "../implementations/text/utils/userDataTemplateTextFieldConfigCreateDTOToUserDataTemplateTextFieldConfig";

export const userDataTemplateFieldConfigCreateDTOToUserDataTemplateFieldConfig = (
  userDataTemplateFieldConfigCreateDTO: UserDataTemplateFieldConfigCreateDTO,
  logger: LogFunctions | null
): UserDataTemplateFieldConfig => {
  logger?.debug("Converting User Data Template Field Config Create DTO to User Data Template Field Config.");
  switch (userDataTemplateFieldConfigCreateDTO.type) {
    case USER_DATA_TEMPLATE_FIELD_TYPES.integer:
      return userDataTemplateIntegerFieldConfigCreateDTOToUserDataTemplateIntegerFieldConfig(userDataTemplateFieldConfigCreateDTO, logger);
    case USER_DATA_TEMPLATE_FIELD_TYPES.real:
      return userDataTemplateRealFieldConfigCreateDTOToUserDataTemplateRealFieldConfig(userDataTemplateFieldConfigCreateDTO, logger);
    case USER_DATA_TEMPLATE_FIELD_TYPES.text:
      return userDataTemplateTextFieldConfigCreateDTOToUserDataTemplateTextFieldConfig(userDataTemplateFieldConfigCreateDTO, logger);
  }
};
