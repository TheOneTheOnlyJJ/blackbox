import { DataGrid, GridApi, GridAutosizeOptions, GridColDef, GridRowId, GridRowIdGetter, GridRowParams, useGridApiRef } from "@mui/x-data-grid";
import { FC, MutableRefObject, useCallback } from "react";
import { ISignedInRootContext, useSignedInRootContext } from "../roots/signedInRoot/SignedInRootContext";
import {
  IUserDataStorageVisibilityGroupInfo,
  USER_DATA_STORAGE_VISIBILITY_GROUP_INFO_JSON_SCHEMA_CONSTANTS
} from "@shared/user/data/storage/visibilityGroup/info/UserDataStorageVisibilityGroupInfo";
import CloseUserDataStorageVisibilityGroupActionItem from "./actionCellItems/CloseUserDataStorageVisibilityGroupActionItem";
import { useMUIXDataGridAutosizeColumnsOnWindowResize } from "@renderer/hooks/useMUIXDataGridAutosizeOnWindowResize";
import { appLogger } from "@renderer/utils/loggers";

const OPEN_USER_DATA_STORAGE_VISIBILIY_GROUPS_DATA_GRID_COLUMNS: GridColDef[] = [
  { field: "visibilityGroupId", type: "string", headerName: USER_DATA_STORAGE_VISIBILITY_GROUP_INFO_JSON_SCHEMA_CONSTANTS.visibilityGroupId.title },
  { field: "name", type: "string", headerName: USER_DATA_STORAGE_VISIBILITY_GROUP_INFO_JSON_SCHEMA_CONSTANTS.name.title },
  { field: "description", type: "string", headerName: USER_DATA_STORAGE_VISIBILITY_GROUP_INFO_JSON_SCHEMA_CONSTANTS.description.title },
  {
    field: "actions",
    type: "actions",
    headerName: "Close",
    getActions: (params: GridRowParams<IUserDataStorageVisibilityGroupInfo>) => {
      return [
        <CloseUserDataStorageVisibilityGroupActionItem
          logger={appLogger}
          key="closeVisibilityGroup"
          visibilityGroup={{
            name: params.row.name,
            id: params.row.visibilityGroupId
          }}
          showInMenu={false}
        />
      ];
    }
  }
];

const GRID_AUTOSIZE_OPTIONS: GridAutosizeOptions = { expand: true, includeHeaders: true };

const OpenUserDataStorageVisibilityGroupsDataGrid: FC = () => {
  const signedInRootContext: ISignedInRootContext = useSignedInRootContext();

  const gridAPIRef: MutableRefObject<GridApi> = useGridApiRef();
  const { gridAutosizeColumns } = useMUIXDataGridAutosizeColumnsOnWindowResize({
    logger: appLogger,
    gridAPIRef: gridAPIRef,
    autosizeOptions: GRID_AUTOSIZE_OPTIONS,
    gridPurposeToLog: "open User Data Storage Visibility Groups"
  });

  const rowIdGetter: GridRowIdGetter<IUserDataStorageVisibilityGroupInfo> = useCallback((row: IUserDataStorageVisibilityGroupInfo): GridRowId => {
    return row.visibilityGroupId;
  }, []);

  return (
    <DataGrid
      apiRef={gridAPIRef}
      autosizeOnMount
      autosizeOptions={GRID_AUTOSIZE_OPTIONS}
      getRowId={rowIdGetter}
      rows={signedInRootContext.openUserDataStorageVisibilityGroupsInfo}
      columns={OPEN_USER_DATA_STORAGE_VISIBILIY_GROUPS_DATA_GRID_COLUMNS}
      initialState={{
        columns: {
          columnVisibilityModel: {
            visibilityGroupId: false
          }
        }
      }}
      onColumnVisibilityModelChange={gridAutosizeColumns}
    />
  );
};

export default OpenUserDataStorageVisibilityGroupsDataGrid;
