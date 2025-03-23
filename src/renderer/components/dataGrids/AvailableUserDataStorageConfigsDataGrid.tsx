import { DataGrid, GridColDef, GridRenderCellParams, GridRowId, GridRowIdGetter } from "@mui/x-data-grid";
import { FC, useCallback } from "react";
import { ISignedInRootContext, useSignedInRootContext } from "../roots/signedInRoot/SignedInRootContext";
import { PUBLIC_USER_DATA_STORAGE_VISIBILITY_GROUP_CONSTANTS } from "@shared/user/data/storage/visibilityGroup/constants";
import {
  IUserDataStorageConfigInfo,
  USER_DATA_STORAGE_CONFIG_INFO_JSON_SCHEMA_CONSTANTS
} from "@shared/user/data/storage/config/info/UserDataStorageConfigInfo";
import { BASE_USER_DATA_STORAGE_BACKEND_CONFIG_INFO_JSON_SCHEMA_CONSTANTS } from "@shared/user/data/storage/backend/config/info/BaseUserDataStorageBackendConfigInfo";
import { USER_DATA_STORAGE_BACKEND_TYPE_NAMES } from "@shared/user/data/storage/backend/UserDataStorageBackendTypeName";

const AVAILABLE_USER_DATA_STORAGE_CONFIGS_DATA_GRID_COLUMNS: GridColDef[] = [
  { field: "storageId", type: "string", headerName: USER_DATA_STORAGE_CONFIG_INFO_JSON_SCHEMA_CONSTANTS.storageId.title },
  { field: "name", type: "string", headerName: USER_DATA_STORAGE_CONFIG_INFO_JSON_SCHEMA_CONSTANTS.name.title },
  { field: "description", type: "string", headerName: USER_DATA_STORAGE_CONFIG_INFO_JSON_SCHEMA_CONSTANTS.description.title },
  {
    field: "visibilityGroupId",
    type: "string",
    headerName: USER_DATA_STORAGE_CONFIG_INFO_JSON_SCHEMA_CONSTANTS.visibilityGroupId.title,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    renderCell: (params: GridRenderCellParams<any, string | null>) => {
      // TODO: Extract name from open visibility groups info, move inside FC to get context
      return params.value === null ? <em>{PUBLIC_USER_DATA_STORAGE_VISIBILITY_GROUP_CONSTANTS.name}</em> : params.value;
    }
  },
  {
    field: "type",
    type: "string",
    headerName: "Type",
    valueGetter: (_: never, row: IUserDataStorageConfigInfo): string => {
      return USER_DATA_STORAGE_BACKEND_TYPE_NAMES[row.backend.type];
    }
  },
  {
    field: "isLocal",
    type: "boolean",
    headerName: BASE_USER_DATA_STORAGE_BACKEND_CONFIG_INFO_JSON_SCHEMA_CONSTANTS.isLocal.title,
    valueGetter: (_: never, row: IUserDataStorageConfigInfo): boolean => {
      return row.backend.isLocal;
    }
  }
  // TODO: Add master detail row (pro feature)
];

const AvailableUserDataStorageConfigsDataGrid: FC = () => {
  const signedInRootContext: ISignedInRootContext = useSignedInRootContext();
  const rowIdGetter: GridRowIdGetter<IUserDataStorageConfigInfo> = useCallback((row: IUserDataStorageConfigInfo): GridRowId => {
    return row.storageId;
  }, []);
  return (
    <DataGrid
      autosizeOnMount
      autosizeOptions={{ expand: true, includeHeaders: true }}
      getRowId={rowIdGetter}
      rows={signedInRootContext.availableUserDataStorageConfigsInfo}
      columns={AVAILABLE_USER_DATA_STORAGE_CONFIGS_DATA_GRID_COLUMNS}
      initialState={{
        columns: {
          columnVisibilityModel: {
            storageId: false
          }
        }
      }}
    />
  );
};

export default AvailableUserDataStorageConfigsDataGrid;
