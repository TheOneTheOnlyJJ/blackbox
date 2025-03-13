import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { FC } from "react";

const USER_DATA_STORAGE_VISIBILIY_GROUPS_DATA_GRID_COLUMNS: GridColDef[] = [
  { field: "visibilityGroupId", type: "string" },
  { field: "name", type: "string" }
  // TODO: Add action -> remove to remove form currently visible groups
];

const UserDataStorageVisibilityGroupsDataGrid: FC = () => {
  return (
    <DataGrid
      autosizeOnMount
      autosizeOptions={{ expand: true, includeHeaders: true }}
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
