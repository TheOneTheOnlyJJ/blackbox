import {
  DataGrid,
  GridApi,
  GridAutosizeOptions,
  GridColDef,
  GridRenderCellParams,
  GridRowId,
  GridRowIdGetter,
  useGridApiRef
} from "@mui/x-data-grid";
import { useMUIXDataGridAutosizeColumnsOnWindowResize } from "@renderer/hooks/useMUIXDataGridAutosizeOnWindowResize";
import { appLogger } from "@renderer/utils/loggers";
import { FC, MutableRefObject, useCallback, useMemo } from "react";
import { ISignedInRootContext, useSignedInRootContext } from "../roots/signedInRoot/SignedInRootContext";
import { IUserDataBoxInfo, USER_DATA_BOX_INFO_JSON_SCHEMA_CONSTANTS } from "@shared/user/data/box/info/UserDataBoxInfo";
import { IUserDataStorageInfo } from "@shared/user/data/storage/info/UserDataStorageInfo";

const GRID_AUTOSIZE_OPTIONS: GridAutosizeOptions = { expand: true, includeHeaders: true };

const AvailableUserDataBoxesDataGrid: FC = () => {
  const signedInRootContext: ISignedInRootContext = useSignedInRootContext();

  const gridAPIRef: MutableRefObject<GridApi> = useGridApiRef();
  const { gridAutosizeColumns } = useMUIXDataGridAutosizeColumnsOnWindowResize({
    logger: appLogger,
    gridAPIRef: gridAPIRef,
    autosizeOptions: GRID_AUTOSIZE_OPTIONS,
    gridPurposeToLog: "available User Data Boxes"
  });

  const rowIdGetter: GridRowIdGetter<IUserDataBoxInfo> = useCallback((row: IUserDataBoxInfo): GridRowId => {
    return row.boxId + row.storageId;
  }, []);

  const COLUMNS: GridColDef[] = useMemo<GridColDef[]>((): GridColDef[] => {
    return [
      { field: "boxId", type: "string", headerName: USER_DATA_BOX_INFO_JSON_SCHEMA_CONSTANTS.boxId.title },
      { field: "name", type: "string", headerName: USER_DATA_BOX_INFO_JSON_SCHEMA_CONSTANTS.name.title },
      {
        field: "storageId",
        type: "singleSelect",
        valueOptions: signedInRootContext.initialisedUserDataStoragesInfo.map((initialisedUserDataStorageInfo: IUserDataStorageInfo): string => {
          return initialisedUserDataStorageInfo.name;
        }),
        headerName: USER_DATA_BOX_INFO_JSON_SCHEMA_CONSTANTS.storageId.title,
        valueGetter: (_: never, row: IUserDataBoxInfo): string => {
          return signedInRootContext.getInitialisedUserDataStorageInfoById(row.storageId)?.name ?? row.storageId;
        }
      },
      {
        field: "description",
        type: "string",
        headerName: USER_DATA_BOX_INFO_JSON_SCHEMA_CONSTANTS.description.title,
        renderCell: (params: GridRenderCellParams<IUserDataBoxInfo, string | null>) => {
          return params.value === null ? <em>No description</em> : params.value;
        }
      }
    ];
  }, [signedInRootContext]);

  return (
    <DataGrid
      apiRef={gridAPIRef}
      autosizeOnMount
      autosizeOptions={GRID_AUTOSIZE_OPTIONS}
      getRowId={rowIdGetter}
      rows={signedInRootContext.availableUserDataDataBoxesInfo}
      columns={COLUMNS}
      initialState={{
        columns: {
          columnVisibilityModel: {
            boxId: false
          }
        }
      }}
      onColumnVisibilityModelChange={gridAutosizeColumns}
    />
  );
};

export default AvailableUserDataBoxesDataGrid;
