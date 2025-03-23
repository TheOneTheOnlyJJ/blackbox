import {
  DataGrid,
  GridApi,
  GridAutosizeOptions,
  GridColDef,
  GridRenderCellParams,
  GridRowId,
  GridRowIdGetter,
  GridRowParams,
  useGridApiRef
} from "@mui/x-data-grid";
import { FC, MutableRefObject, useCallback, useMemo, useState } from "react";
import { ISignedInRootContext, useSignedInRootContext } from "../roots/signedInRoot/SignedInRootContext";
import { PUBLIC_USER_DATA_STORAGE_VISIBILITY_GROUP_CONSTANTS } from "@shared/user/data/storage/visibilityGroup/constants";
import {
  IUserDataStorageConfigInfo,
  USER_DATA_STORAGE_CONFIG_INFO_JSON_SCHEMA_CONSTANTS
} from "@shared/user/data/storage/config/info/UserDataStorageConfigInfo";
import { BASE_USER_DATA_STORAGE_BACKEND_CONFIG_INFO_JSON_SCHEMA_CONSTANTS } from "@shared/user/data/storage/backend/config/info/BaseUserDataStorageBackendConfigInfo";
import { USER_DATA_STORAGE_BACKEND_TYPE_NAMES } from "@shared/user/data/storage/backend/UserDataStorageBackendTypeName";
import { IUserDataStorageVisibilityGroupInfo } from "@shared/user/data/storage/visibilityGroup/info/UserDataStorageVisibilityGroupInfo";
import { appLogger } from "@renderer/utils/loggers";
import UserDataStorageConfigInfoDialog from "../dialogs/UserDataStorageConfigInfoDialog";
import { useDialogOpenState } from "@renderer/hooks/useDialogState";
import OpenUserDataStorageConfigInfoDialogActionItem from "./actionCellItems/OpenUserDataStorageConfigInfoDialogActionItem";
import OpenUserDataStorageActionItem from "./actionCellItems/OpenUserDataStorageActionItem";
import { useMUIXDataGridAutosizeColumnsOnWindowResize } from "@renderer/hooks/useMUIXDataGridAutosizeOnWindowResize";

const GRID_AUTOSIZE_OPTIONS: GridAutosizeOptions = { expand: true, includeHeaders: true };

const AvailableUserDataStorageConfigsDataGrid: FC = () => {
  const signedInRootContext: ISignedInRootContext = useSignedInRootContext();

  const gridAPIRef: MutableRefObject<GridApi> = useGridApiRef();
  useMUIXDataGridAutosizeColumnsOnWindowResize({
    logger: appLogger,
    gridAPIRef: gridAPIRef,
    autosizeOptions: GRID_AUTOSIZE_OPTIONS,
    gridPurposeToLog: "available User Data Storage Configs"
  });
  const [isShowConfigInfoDialogOpen, setIsShowConfigInfoDialogOpen] = useDialogOpenState(appLogger, "available User Data Storage Config Info");
  const [chosenStorageConfigInfo, setChosenStorageConfigInfo] = useState<IUserDataStorageConfigInfo | null>(null);

  const handleConfigInfoDialogClose = useCallback((): void => {
    setIsShowConfigInfoDialogOpen(false);
    setChosenStorageConfigInfo(null);
  }, [setIsShowConfigInfoDialogOpen]);

  const rowIdGetter: GridRowIdGetter<IUserDataStorageConfigInfo> = useCallback((row: IUserDataStorageConfigInfo): GridRowId => {
    return row.storageId;
  }, []);

  const getOpenUserDataStorageVisibilityGroupName = useCallback(
    (visibilityGroupId: string): string => {
      // TODO: Use a Map here, declare it in signedInRoot
      const VISIBILITY_GROUP_INFO: IUserDataStorageVisibilityGroupInfo | undefined = signedInRootContext.openUserDataStorageVisibilityGroupsInfo.find(
        (openVisibilityGroupInfo: IUserDataStorageVisibilityGroupInfo) => {
          return openVisibilityGroupInfo.visibilityGroupId === visibilityGroupId;
        }
      );
      if (VISIBILITY_GROUP_INFO === undefined) {
        appLogger.warn(`Could not get name for User Data Storage Visibility Group ${visibilityGroupId}.`);
        return visibilityGroupId;
      }
      return VISIBILITY_GROUP_INFO.name;
    },
    [signedInRootContext.openUserDataStorageVisibilityGroupsInfo]
  );

  const COLUMNS: GridColDef[] = useMemo<GridColDef[]>((): GridColDef[] => {
    return [
      { field: "storageId", type: "string", headerName: USER_DATA_STORAGE_CONFIG_INFO_JSON_SCHEMA_CONSTANTS.storageId.title },
      { field: "name", type: "string", headerName: USER_DATA_STORAGE_CONFIG_INFO_JSON_SCHEMA_CONSTANTS.name.title },
      { field: "description", type: "string", headerName: USER_DATA_STORAGE_CONFIG_INFO_JSON_SCHEMA_CONSTANTS.description.title },
      {
        field: "visibilityGroupId",
        type: "string",
        headerName: USER_DATA_STORAGE_CONFIG_INFO_JSON_SCHEMA_CONSTANTS.visibilityGroupId.title,
        valueGetter: (_: never, row: IUserDataStorageConfigInfo): string | null => {
          return row.visibilityGroupId === null ? null : getOpenUserDataStorageVisibilityGroupName(row.visibilityGroupId);
        },
        renderCell: (params: GridRenderCellParams<IUserDataStorageConfigInfo, string | null>) => {
          return params.value === null ? <em>{PUBLIC_USER_DATA_STORAGE_VISIBILITY_GROUP_CONSTANTS.name}</em> : params.value;
        }
      },
      {
        field: "type",
        type: "string",
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
        // TODO: Put this in master detail row (pro feature)
        field: "actions",
        type: "actions",
        headerName: "Actions",
        getActions: (params: GridRowParams<IUserDataStorageConfigInfo>) => {
          return [
            <OpenUserDataStorageConfigInfoDialogActionItem
              key="openInfoDialog"
              userDataStorageConfigInfo={params.row}
              setChosenUserDataStorageConfigInfo={setChosenStorageConfigInfo}
              setIsShowUserDataStorageConfigInfoDialogOpen={setIsShowConfigInfoDialogOpen}
            />,
            <OpenUserDataStorageActionItem key="openStorage" userDataStorageConfigInfo={params.row} />
          ];
        }
      }
    ];
  }, [getOpenUserDataStorageVisibilityGroupName, setIsShowConfigInfoDialogOpen]);

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
      />
      {chosenStorageConfigInfo !== null ? (
        <UserDataStorageConfigInfoDialog
          open={isShowConfigInfoDialogOpen}
          onClose={handleConfigInfoDialogClose}
          userDataStorageConfigInfo={chosenStorageConfigInfo}
          doShowId={true}
        />
      ) : null}
    </>
  );
};

export default AvailableUserDataStorageConfigsDataGrid;
