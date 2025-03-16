import { DataGrid, GridColDef, GridRowId, GridRowIdGetter, GridRowParams } from "@mui/x-data-grid";
import { FC, useCallback } from "react";
import { ISignedInRootContext, useSignedInRootContext } from "../roots/signedInRoot/SignedInRootContext";
import {
  IUserDataStorageVisibilityGroupInfo,
  USER_DATA_STORAGE_VISIBILITY_GROUP_INFO_JSON_SCHEMA_CONSTANTS
} from "@shared/user/data/storage/visibilityGroup/info/UserDataStorageVisibilityGroupInfo";
import CloseUserDataStorageVisibilityGroupActionItem from "./actionCellItems/CloseUserDataStorageVisibilityGroupActionItem";

const USER_DATA_STORAGE_VISIBILIY_GROUPS_DATA_GRID_COLUMNS: GridColDef[] = [
  { field: "visibilityGroupId", type: "string", headerName: USER_DATA_STORAGE_VISIBILITY_GROUP_INFO_JSON_SCHEMA_CONSTANTS.visibilityGroupId.title },
  { field: "name", type: "string", headerName: USER_DATA_STORAGE_VISIBILITY_GROUP_INFO_JSON_SCHEMA_CONSTANTS.name.title },
  { field: "description", type: "string", headerName: USER_DATA_STORAGE_VISIBILITY_GROUP_INFO_JSON_SCHEMA_CONSTANTS.description.title },
  {
    field: "actions",
    type: "actions",
    headerName: "Close",
    getActions: (params: GridRowParams<IUserDataStorageVisibilityGroupInfo>) => {
      return [<CloseUserDataStorageVisibilityGroupActionItem key="close" visibilityGroupInfo={params.row} />];
    }
  }
];

const UserDataStorageVisibilityGroupsDataGrid: FC = () => {
  const signedInRootContext: ISignedInRootContext = useSignedInRootContext();
  const rowIdGetter: GridRowIdGetter<IUserDataStorageVisibilityGroupInfo> = useCallback((row: IUserDataStorageVisibilityGroupInfo): GridRowId => {
    return row.visibilityGroupId;
  }, []);
  return (
    <DataGrid
      autosizeOnMount
      autosizeOptions={{ expand: true, includeHeaders: true }}
      getRowId={rowIdGetter}
      rows={signedInRootContext.openUserDataStorageVisibilityGroupsInfo}
      columns={USER_DATA_STORAGE_VISIBILIY_GROUPS_DATA_GRID_COLUMNS}
      initialState={{
        columns: {
          columnVisibilityModel: {
            visibilityGroupId: false
          }
        }
      }}
    />
  );
};

export default UserDataStorageVisibilityGroupsDataGrid;
