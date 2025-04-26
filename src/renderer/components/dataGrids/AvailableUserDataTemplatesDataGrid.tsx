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
import { FC, MutableRefObject, useCallback, useMemo } from "react";
import { ISignedInRootContext, useSignedInRootContext } from "../roots/signedInRoot/SignedInRootContext";
import { useMUIXDataGridAutosizeColumnsOnWindowResize } from "@renderer/hooks/useMUIXDataGridAutosizeOnWindowResize";
import { appLogger } from "@renderer/utils/loggers";
import { IUserDataTemplateInfo, USER_DATA_TEMPLATE_INFO_JSON_SCHEMA_CONSTANTS } from "@shared/user/data/template/info/UserDataTemplateInfo";
import { IUserDataStorageInfo } from "@shared/user/data/storage/info/UserDataStorageInfo";
import { IUserDataBoxInfo } from "@shared/user/data/box/info/UserDataBoxInfo";
import { IUserDataBoxIdentifier } from "@shared/user/data/box/identifier/UserDataBoxIdentifier";

const GRID_AUTOSIZE_OPTIONS: GridAutosizeOptions = { expand: true, includeHeaders: true };

const AvailableUserDataTemplatesDataGrid: FC = () => {
  const signedInRootContext: ISignedInRootContext = useSignedInRootContext();

  const gridAPIRef: MutableRefObject<GridApi> = useGridApiRef();
  const { gridAutosizeColumns } = useMUIXDataGridAutosizeColumnsOnWindowResize({
    logger: appLogger,
    gridAPIRef: gridAPIRef,
    autosizeOptions: GRID_AUTOSIZE_OPTIONS,
    gridPurposeToLog: "available User Data Templates"
  });

  const rowIdGetter: GridRowIdGetter<IUserDataTemplateInfo> = useCallback((row: IUserDataTemplateInfo): GridRowId => {
    return row.templateId + row.boxId + row.storageId;
  }, []);

  const COLUMNS: GridColDef[] = useMemo<GridColDef[]>((): GridColDef[] => {
    return [
      { field: "templateId", type: "string", headerName: USER_DATA_TEMPLATE_INFO_JSON_SCHEMA_CONSTANTS.templateId.title },
      { field: "name", type: "string", headerName: USER_DATA_TEMPLATE_INFO_JSON_SCHEMA_CONSTANTS.name.title },
      {
        field: "boxId",
        type: "singleSelect",
        valueOptions: signedInRootContext.availableUserDataDataBoxesInfo.map((availableUserDataBoxInfo: IUserDataBoxInfo): string => {
          // TODO: Check if this can have duplicates if boxes are from different storages, and check the other data grids aswell
          return availableUserDataBoxInfo.name;
        }),
        headerName: USER_DATA_TEMPLATE_INFO_JSON_SCHEMA_CONSTANTS.boxId.title,
        valueGetter: (_: never, row: IUserDataBoxInfo): string => {
          return (
            signedInRootContext.getAvailableUserDataBoxInfoByIdentifier({
              boxId: row.boxId,
              storageId: row.storageId
            } satisfies IUserDataBoxIdentifier)?.name ?? row.boxId
          );
        }
      },
      {
        field: "storageId",
        type: "singleSelect",
        valueOptions: signedInRootContext.initialisedUserDataStoragesInfo.map((initialisedUserDataStorageInfo: IUserDataStorageInfo): string => {
          return initialisedUserDataStorageInfo.name;
        }),
        headerName: USER_DATA_TEMPLATE_INFO_JSON_SCHEMA_CONSTANTS.storageId.title,
        valueGetter: (_: never, row: IUserDataTemplateInfo): string => {
          return signedInRootContext.getInitialisedUserDataStorageInfoById(row.storageId)?.name ?? row.storageId;
        }
      },
      {
        field: "description",
        type: "string",
        headerName: USER_DATA_TEMPLATE_INFO_JSON_SCHEMA_CONSTANTS.description.title,
        renderCell: (params: GridRenderCellParams<IUserDataTemplateInfo, string | null>) => {
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
      rows={signedInRootContext.availableUserDataDataTemplatesInfo}
      columns={COLUMNS}
      initialState={{
        columns: {
          columnVisibilityModel: {
            templateId: false
          }
        }
      }}
      onColumnVisibilityModelChange={gridAutosizeColumns}
    />
  );
};

export default AvailableUserDataTemplatesDataGrid;
