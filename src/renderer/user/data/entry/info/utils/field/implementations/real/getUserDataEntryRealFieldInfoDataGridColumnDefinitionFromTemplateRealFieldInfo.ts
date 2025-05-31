import { GridColDef } from "@mui/x-data-grid";
import { IUserDataTemplateRealFieldInfo } from "@shared/user/data/template/field/info/implementations/real/UserDataTemplateRealFieldInfo";
import { LogFunctions } from "electron-log";

export const getUserDataEntryRealFieldInfoDataGridColumnDefinitionFromTemplateRealFieldInfo = (
  userDataTemplateRealFieldInfo: IUserDataTemplateRealFieldInfo,
  userDataEntryFieldKey: string,
  logger: LogFunctions | null
): GridColDef => {
  logger?.debug("Getting User Data Entry Real Field Info data grid column definition from User Data Template Real Field Info.");
  return {
    field: userDataEntryFieldKey,
    type: "number",
    description: userDataTemplateRealFieldInfo.description ?? undefined,
    headerName: userDataTemplateRealFieldInfo.name
  } satisfies GridColDef;
};
