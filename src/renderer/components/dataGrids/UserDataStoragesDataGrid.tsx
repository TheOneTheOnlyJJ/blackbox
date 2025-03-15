import { DataGrid, GridColDef, GridRenderCellParams, GridRowId, GridRowIdGetter } from "@mui/x-data-grid";
import { FC, useCallback } from "react";
import { IUserDataStorageInfo, USER_DATA_STORAGE_INFO_JSON_SCHEMA_CONSTANTS } from "@shared/user/data/storage/info/UserDataStorageInfo";
import { ISignedInRootContext, useSignedInRootContext } from "../roots/signedInRoot/SignedInRootContext";
import { PUBLIC_USER_DATA_STORAGE_VISIBILITY_GROUP_CONSTANTS } from "@shared/user/data/storage/visibilityGroup/constants";

const USER_DATA_STORAGES_DATA_GRID_COLUMNS: GridColDef[] = [
  { field: "storageId", type: "string", headerName: USER_DATA_STORAGE_INFO_JSON_SCHEMA_CONSTANTS.storageId.title },
  { field: "name", type: "string", headerName: USER_DATA_STORAGE_INFO_JSON_SCHEMA_CONSTANTS.name.title },
  { field: "description", type: "string", headerName: USER_DATA_STORAGE_INFO_JSON_SCHEMA_CONSTANTS.description.title },
  {
    field: "visibilityGroupName",
    type: "string",
    headerName: USER_DATA_STORAGE_INFO_JSON_SCHEMA_CONSTANTS.visibilityGroupName.title,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    renderCell: (params: GridRenderCellParams<any, string>) => {
      return params.value === PUBLIC_USER_DATA_STORAGE_VISIBILITY_GROUP_CONSTANTS.name ? <em>{params.value}</em> : params.value;
    }
  },
  { field: "type", type: "string", headerName: USER_DATA_STORAGE_INFO_JSON_SCHEMA_CONSTANTS.type.title },
  { field: "isOpen", type: "boolean", headerName: USER_DATA_STORAGE_INFO_JSON_SCHEMA_CONSTANTS.isOpen.title }
];

const UserDataStoragesDataGrid: FC = () => {
  const signedInRootContext: ISignedInRootContext = useSignedInRootContext();
  const rowIdGetter: GridRowIdGetter<IUserDataStorageInfo> = useCallback((row: IUserDataStorageInfo): GridRowId => {
    return row.storageId;
  }, []);
  return (
    <DataGrid
      autosizeOnMount
      autosizeOptions={{ expand: true, includeHeaders: true }}
      getRowId={rowIdGetter}
      rows={signedInRootContext.userDataStoragesInfo}
      columns={USER_DATA_STORAGES_DATA_GRID_COLUMNS}
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

export default UserDataStoragesDataGrid;
