import { GridColDef } from "@mui/x-data-grid";
import { IUserDataTemplateTextFieldInfo } from "@shared/user/data/template/field/info/implementations/text/UserDataTemplateTextFieldInfo";
import { LogFunctions } from "electron-log";

export const getUserDataEntryTextFieldInfoDataGridColumnDefinitionFromTemplateTextFieldInfo = (
  userDataTemplateTextFieldInfo: IUserDataTemplateTextFieldInfo,
  userDataEntryFieldKey: string,
  logger: LogFunctions | null
): GridColDef => {
  logger?.debug("Getting User Data Entry Text Field Info data grid column definition from User Data Template Text Field Info.");
  return {
    field: userDataEntryFieldKey,
    type: "string",
    description: userDataTemplateTextFieldInfo.description ?? undefined,
    headerName: userDataTemplateTextFieldInfo.name
  } satisfies GridColDef;
};
