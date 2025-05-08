import {
  DataGrid,
  GridActionsCellItemProps,
  GridApi,
  GridAutosizeOptions,
  GridColDef,
  GridRenderCellParams,
  GridRowId,
  GridRowIdGetter,
  GridRowParams,
  useGridApiRef
} from "@mui/x-data-grid";
import { FC, MutableRefObject, ReactElement, useCallback, useMemo, useState } from "react";
import { ISignedInRootContext, useSignedInRootContext } from "../roots/signedInRoot/SignedInRootContext";
import { PUBLIC_USER_DATA_STORAGE_VISIBILITY_GROUP_CONSTANTS } from "@shared/user/data/storage/visibilityGroup/public/constants";
import {
  IUserDataStorageConfigInfo,
  USER_DATA_STORAGE_CONFIG_INFO_JSON_SCHEMA_CONSTANTS
} from "@shared/user/data/storage/config/info/UserDataStorageConfigInfo";
import { BASE_USER_DATA_STORAGE_BACKEND_CONFIG_INFO_JSON_SCHEMA_CONSTANTS } from "@shared/user/data/storage/backend/config/info/BaseUserDataStorageBackendConfigInfo";
import { USER_DATA_STORAGE_BACKEND_TYPE_NAMES } from "@shared/user/data/storage/backend/UserDataStorageBackendTypeName";
import { IUserDataStorageVisibilityGroupInfo } from "@shared/user/data/storage/visibilityGroup/info/UserDataStorageVisibilityGroupInfo";
import { appLogger } from "@renderer/utils/loggers";
import UserDataStorageConfigInfoDialog from "../dialogs/info/user/data/storage/config/UserDataStorageConfigInfoDialog";
import { useDialogOpenState } from "@renderer/hooks/useDialogState";
import OpenUserDataStorageConfigInfoDialogActionItem from "./actionCellItems/OpenUserDataStorageConfigInfoDialogActionItem";
import InitialiseUserDataStorageActionItem from "./actionCellItems/InitialiseUserDataStorageActionItem";
import { useMUIXDataGridAutosizeColumnsOnWindowResize } from "@renderer/hooks/useMUIXDataGridAutosizeOnWindowResize";
import TerminateUserDataStorageActionItem from "./actionCellItems/TerminateUserDataStorageActionItem";

const GRID_AUTOSIZE_OPTIONS: GridAutosizeOptions = { expand: true, includeHeaders: true };

const AvailableUserDataStorageConfigsDataGrid: FC = () => {
  const signedInRootContext: ISignedInRootContext = useSignedInRootContext();

  const gridAPIRef: MutableRefObject<GridApi> = useGridApiRef();
  const { gridAutosizeColumns } = useMUIXDataGridAutosizeColumnsOnWindowResize({
    logger: appLogger,
    gridAPIRef: gridAPIRef,
    autosizeOptions: GRID_AUTOSIZE_OPTIONS,
    gridPurposeToLog: "available User Data Storage Configs"
  });
  const [isConfigInfoDialogOpen, setIsConfigInfoDialogOpen] = useDialogOpenState(appLogger, "available User Data Storage Config Info");
  const [chosenStorageConfigInfo, setChosenStorageConfigInfo] = useState<IUserDataStorageConfigInfo | null>(null);

  const handleConfigInfoDialogClose = useCallback((): void => {
    setIsConfigInfoDialogOpen(false);
    setChosenStorageConfigInfo(null);
  }, [setIsConfigInfoDialogOpen]);

  const rowIdGetter: GridRowIdGetter<IUserDataStorageConfigInfo> = useCallback((row: IUserDataStorageConfigInfo): GridRowId => {
    return row.visibilityGroupId === null ? row.storageId : row.storageId + row.visibilityGroupId;
  }, []);

  const COLUMNS: GridColDef[] = useMemo<GridColDef[]>((): GridColDef[] => {
    return [
      { field: "storageId", type: "string", headerName: USER_DATA_STORAGE_CONFIG_INFO_JSON_SCHEMA_CONSTANTS.storageId.title },
      { field: "name", type: "string", headerName: USER_DATA_STORAGE_CONFIG_INFO_JSON_SCHEMA_CONSTANTS.name.title },
      { field: "description", type: "string", headerName: USER_DATA_STORAGE_CONFIG_INFO_JSON_SCHEMA_CONSTANTS.description.title },
      {
        field: "visibilityGroupId",
        type: "singleSelect",
        valueOptions: signedInRootContext.openUserDataStorageVisibilityGroupsInfo.map(
          (openVisibilityGroup: IUserDataStorageVisibilityGroupInfo): string => {
            return openVisibilityGroup.name;
          }
        ),
        headerName: USER_DATA_STORAGE_CONFIG_INFO_JSON_SCHEMA_CONSTANTS.visibilityGroupId.title,
        valueGetter: (_: never, row: IUserDataStorageConfigInfo): string | null => {
          return row.visibilityGroupId === null
            ? null
            : signedInRootContext.getOpenUserDataStorageVisibilityGroupInfoById(row.visibilityGroupId)?.name ?? row.visibilityGroupId;
        },
        renderCell: (params: GridRenderCellParams<IUserDataStorageConfigInfo, string | null>) => {
          return params.value === null ? <em>{PUBLIC_USER_DATA_STORAGE_VISIBILITY_GROUP_CONSTANTS.name}</em> : params.value;
        }
      },
      {
        field: "type",
        type: "singleSelect",
        valueOptions: Object.values(USER_DATA_STORAGE_BACKEND_TYPE_NAMES),
        headerName: BASE_USER_DATA_STORAGE_BACKEND_CONFIG_INFO_JSON_SCHEMA_CONSTANTS.type.title,
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
      },
      {
        field: "isInitialised",
        type: "boolean",
        headerName: "Active",
        valueGetter: (_: never, row: IUserDataStorageConfigInfo): boolean => {
          return row.isInitialised;
        }
      },
      {
        // TODO: Put info in master detail row (pro feature)
        field: "actions",
        type: "actions",
        headerName: "Actions",
        getActions: (params: GridRowParams<IUserDataStorageConfigInfo>) => {
          const ACTION_ITEMS: ReactElement<GridActionsCellItemProps>[] = [
            <OpenUserDataStorageConfigInfoDialogActionItem
              logger={appLogger}
              key="openInfoDialog"
              userDataStorageConfigInfo={params.row}
              setChosenUserDataStorageConfigInfo={setChosenStorageConfigInfo}
              setIsUserDataStorageConfigInfoDialogOpen={setIsConfigInfoDialogOpen}
              showInMenu={false}
            />
          ];
          if (params.row.isInitialised) {
            ACTION_ITEMS.push(
              <TerminateUserDataStorageActionItem
                logger={appLogger}
                key="terminateStorage"
                dataStorage={{
                  name: params.row.name,
                  id: params.row.storageId
                }}
                showInMenu={false}
              />
            );
          } else {
            ACTION_ITEMS.push(
              <InitialiseUserDataStorageActionItem
                logger={appLogger}
                key="initialiseStorage"
                dataStorage={{
                  name: params.row.name,
                  id: params.row.storageId
                }}
                showInMenu={false}
              />
            );
          }
          return ACTION_ITEMS;
        }
      }
    ];
  }, [setIsConfigInfoDialogOpen, signedInRootContext]);

  return (
    <>
      <DataGrid
        apiRef={gridAPIRef}
        autosizeOnMount
        autosizeOptions={GRID_AUTOSIZE_OPTIONS}
        getRowId={rowIdGetter}
        rows={signedInRootContext.availableUserDataStorageConfigsInfo}
        columns={COLUMNS}
        initialState={{
          columns: {
            columnVisibilityModel: {
              storageId: false
            }
          }
        }}
        onColumnVisibilityModelChange={gridAutosizeColumns}
      />
      {chosenStorageConfigInfo !== null ? (
        <UserDataStorageConfigInfoDialog
          open={isConfigInfoDialogOpen}
          onClose={handleConfigInfoDialogClose}
          userDataStorageConfigInfo={chosenStorageConfigInfo}
          doShowId={true}
        />
      ) : null}
    </>
  );
};

export default AvailableUserDataStorageConfigsDataGrid;
