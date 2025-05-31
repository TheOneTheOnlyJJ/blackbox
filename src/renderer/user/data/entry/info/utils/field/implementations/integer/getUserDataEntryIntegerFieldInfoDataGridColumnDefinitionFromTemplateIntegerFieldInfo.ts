import { GridColDef } from "@mui/x-data-grid";
import { IUserDataTemplateIntegerFieldInfo } from "@shared/user/data/template/field/info/implementations/integer/UserDataTemplateIntegerFieldInfo";
import { LogFunctions } from "electron-log";

export const getUserDataEntryIntegerFieldInfoDataGridColumnDefinitionFromTemplateIntegerFieldInfo = (
  userDataTemplateIntegerFieldInfo: IUserDataTemplateIntegerFieldInfo,
  userDataEntryFieldKey: string,
  logger: LogFunctions | null
): GridColDef => {
  logger?.debug("Getting User Data Entry Integer Field Info data grid column definition from User Data Template Integer Field Info.");
  return {
    field: userDataEntryFieldKey,
    type: "number",
    description: userDataTemplateIntegerFieldInfo.description ?? undefined,
    headerName: userDataTemplateIntegerFieldInfo.name
  } satisfies GridColDef;
};
