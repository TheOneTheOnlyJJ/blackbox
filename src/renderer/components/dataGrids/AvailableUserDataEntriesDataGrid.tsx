import { DataGrid, GridApi, GridAutosizeOptions, GridColDef, GridRowId, GridRowIdGetter, useGridApiRef } from "@mui/x-data-grid";
import { useMUIXDataGridAutosizeColumnsOnWindowResize } from "@renderer/hooks/useMUIXDataGridAutosizeOnWindowResize";
import { appLogger } from "@renderer/utils/loggers";
import { FC, MutableRefObject, useCallback, useMemo } from "react";
import { ISignedInRootContext, useSignedInRootContext } from "../roots/signedInRoot/SignedInRootContext";
import { IUserDataEntryInfo, USER_DATA_ENTRY_INFO_JSON_SCHEMA_CONSTANTS } from "@shared/user/data/entry/info/UserDataEntryInfo";
import { isUserDataEntryMatchingUserDataTemplate } from "@shared/user/data/entry/utils/isUserDataEntryMatchingUserDataTemplate";
import { IUserDataTemplateInfo } from "@shared/user/data/template/info/UserDataTemplateInfo";
import { getUserDataEntryFieldInfoDataGridColumnDefinitionFromUserDataTemplateFieldInfo } from "@renderer/user/data/entry/info/utils/field/getUserDataEntryFieldInfoDataGridColumnDefinitionFromUserDataTemplateFieldInfo";
import { UserDataTemplateFieldInfo } from "@shared/user/data/template/field/info/UserDataTemplateFieldInfo";
import { getUserDataEntryFieldKey } from "@shared/user/data/entry/utils/getUserDataEntryFieldKey";

const GRID_AUTOSIZE_OPTIONS: GridAutosizeOptions = { expand: true, includeHeaders: true };

export interface IAvailableUserDataEntriesDataGridProps {
  userDataTemplateInfo: IUserDataTemplateInfo;
}

const AvailableUserDataEntriesDataGrid: FC<IAvailableUserDataEntriesDataGridProps> = (props: IAvailableUserDataEntriesDataGridProps) => {
  const signedInRootContext: ISignedInRootContext = useSignedInRootContext();

  const gridAPIRef: MutableRefObject<GridApi> = useGridApiRef();
  const { gridAutosizeColumns } = useMUIXDataGridAutosizeColumnsOnWindowResize({
    logger: appLogger,
    gridAPIRef: gridAPIRef,
    autosizeOptions: GRID_AUTOSIZE_OPTIONS,
    gridPurposeToLog: "available User Data Entries"
  });

  const rowIdGetter: GridRowIdGetter<IUserDataEntryInfo> = useCallback((row: IUserDataEntryInfo): GridRowId => {
    return "".concat(row.entryId, row.templateId, row.boxId, row.storageId);
  }, []);

  const ROWS: IUserDataEntryInfo[] = useMemo<IUserDataEntryInfo[]>((): IUserDataEntryInfo[] => {
    return signedInRootContext.availableUserDataDataEntriesInfo.filter((availableUserDataEntryInfo: IUserDataEntryInfo): boolean => {
      return isUserDataEntryMatchingUserDataTemplate(availableUserDataEntryInfo, props.userDataTemplateInfo);
    });
  }, [props, signedInRootContext.availableUserDataDataEntriesInfo]);

  const COLUMNS: GridColDef[] = useMemo<GridColDef[]>((): GridColDef[] => {
    return [
      // TODO: Add this headerName to a list of disallowed entry field names to avoid user confusion if an entry field has the same name
      { field: "entryId", type: "string", headerName: USER_DATA_ENTRY_INFO_JSON_SCHEMA_CONSTANTS.entryId.title },
      ...props.userDataTemplateInfo.fields.map((userDataTemplateInfoField: UserDataTemplateFieldInfo, index: number): GridColDef => {
        const USER_DATA_ENTRY_FIELD_KEY: string = getUserDataEntryFieldKey(index);
        const USER_DATA_ENTRY_FIELD_INFO_DATA_GRID_COLUMN_DEFINITION: GridColDef =
          getUserDataEntryFieldInfoDataGridColumnDefinitionFromUserDataTemplateFieldInfo(userDataTemplateInfoField, USER_DATA_ENTRY_FIELD_KEY, null);
        if (USER_DATA_ENTRY_FIELD_INFO_DATA_GRID_COLUMN_DEFINITION.valueGetter !== undefined) {
          appLogger.warn(`User Data Entry Field Info data grid column definition has a value getter! It will be replaced!`);
        }
        USER_DATA_ENTRY_FIELD_INFO_DATA_GRID_COLUMN_DEFINITION.valueGetter = (_: never, row: IUserDataEntryInfo): unknown => {
          return row.data[USER_DATA_ENTRY_FIELD_KEY];
        };
        // TODO: Handle null or undefined values with a renderCell function, should be inside the ColDef getter function
        return USER_DATA_ENTRY_FIELD_INFO_DATA_GRID_COLUMN_DEFINITION;
      })
    ];
  }, [props]);

  return (
    <DataGrid
      apiRef={gridAPIRef}
      autosizeOnMount
      autosizeOptions={GRID_AUTOSIZE_OPTIONS}
      getRowId={rowIdGetter}
      rows={ROWS}
      columns={COLUMNS}
      initialState={{
        columns: {
          columnVisibilityModel: {
            entryId: false
          }
        }
      }}
      onColumnVisibilityModelChange={gridAutosizeColumns}
    />
  );
};

export default AvailableUserDataEntriesDataGrid;
