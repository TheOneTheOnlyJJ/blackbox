import { GridColDef } from "@mui/x-data-grid";
import { UserDataTemplateFieldInfo } from "@shared/user/data/template/field/info/UserDataTemplateFieldInfo";
import { USER_DATA_TEMPLATE_FIELD_TYPES } from "@shared/user/data/template/field/UserDataTemplateFieldType";
import { LogFunctions } from "electron-log";
import { getUserDataEntryIntegerFieldInfoDataGridColumnDefinitionFromTemplateIntegerFieldInfo } from "./implementations/integer/getUserDataEntryIntegerFieldInfoDataGridColumnDefinitionFromTemplateIntegerFieldInfo";
import { getUserDataEntryRealFieldInfoDataGridColumnDefinitionFromTemplateRealFieldInfo } from "./implementations/real/getUserDataEntryRealFieldInfoDataGridColumnDefinitionFromTemplateRealFieldInfo";
import { getUserDataEntryTextFieldInfoDataGridColumnDefinitionFromTemplateTextFieldInfo } from "./implementations/text/getUserDataEntryTextFieldInfoDataGridColumnDefinitionFromTemplateTextFieldInfo";

export const getUserDataEntryFieldInfoDataGridColumnDefinitionFromUserDataTemplateFieldInfo = (
  userDataTemplateFieldInfo: UserDataTemplateFieldInfo,
  userDataEntryFieldKey: string,
  logger: LogFunctions | null
): GridColDef => {
  logger?.debug("Getting User Data Entry Field Info data grid column definition from User Data Template Field Info.");
  switch (userDataTemplateFieldInfo.type) {
    case USER_DATA_TEMPLATE_FIELD_TYPES.integer:
      return getUserDataEntryIntegerFieldInfoDataGridColumnDefinitionFromTemplateIntegerFieldInfo(
        userDataTemplateFieldInfo,
        userDataEntryFieldKey,
        logger
      );
    case USER_DATA_TEMPLATE_FIELD_TYPES.real:
      return getUserDataEntryRealFieldInfoDataGridColumnDefinitionFromTemplateRealFieldInfo(userDataTemplateFieldInfo, userDataEntryFieldKey, logger);
    case USER_DATA_TEMPLATE_FIELD_TYPES.text:
      return getUserDataEntryTextFieldInfoDataGridColumnDefinitionFromTemplateTextFieldInfo(userDataTemplateFieldInfo, userDataEntryFieldKey, logger);
  }
};
