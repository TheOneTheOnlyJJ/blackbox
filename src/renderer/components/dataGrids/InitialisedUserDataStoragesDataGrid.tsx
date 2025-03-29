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
import { useMUIXDataGridAutosizeColumnsOnWindowResize } from "@renderer/hooks/useMUIXDataGridAutosizeOnWindowResize";
import { appLogger } from "@renderer/utils/loggers";
import { FC, MutableRefObject, useCallback, useMemo, useState } from "react";
import { ISignedInRootContext, useSignedInRootContext } from "../roots/signedInRoot/SignedInRootContext";
import { IUserDataStorageInfo, USER_DATA_STORAGE_INFO_JSON_SCHEMA_CONSTANTS } from "@shared/user/data/storage/info/UserDataStorageInfo";
import { IUserDataStorageVisibilityGroupInfo } from "@shared/user/data/storage/visibilityGroup/info/UserDataStorageVisibilityGroupInfo";
import { PUBLIC_USER_DATA_STORAGE_VISIBILITY_GROUP_CONSTANTS } from "@shared/user/data/storage/visibilityGroup/constants";
import { USER_DATA_STORAGE_BACKEND_TYPE_NAMES } from "@shared/user/data/storage/backend/UserDataStorageBackendTypeName";
import { BASE_USER_DATA_STORAGE_BACKEND_INFO_JSON_SCHEMA_CONSTANTS } from "@shared/user/data/storage/backend/info/BaseUserDataStorageBackendInfo";
import { useDialogOpenState } from "@renderer/hooks/useDialogState";
import UserDataStorageInfoDialog from "../dialogs/UserDataStorageInfoDialog";
import OpenUserDataStorageInfoDialogActionItem from "./actionCellItems/OpenUserDataStorageInfoDialogActionItem";
import OpenAndCloseUserDataStorageActionItem from "./actionCellItems/OpenAndCloseUserDataStorageActionItem";
import TerminateUserDataStorageActionItem from "./actionCellItems/TerminateUserDataStorageActionItem";

const GRID_AUTOSIZE_OPTIONS: GridAutosizeOptions = { expand: true, includeHeaders: true };

const InitialisedUserDataStoragesDataGrid: FC = () => {
  const signedInRootContext: ISignedInRootContext = useSignedInRootContext();

  const gridAPIRef: MutableRefObject<GridApi> = useGridApiRef();
  useMUIXDataGridAutosizeColumnsOnWindowResize({
    logger: appLogger,
    gridAPIRef: gridAPIRef,
    autosizeOptions: GRID_AUTOSIZE_OPTIONS,
    gridPurposeToLog: "initialised User Data Storages"
  });
  const [isShowInfoDialogOpen, setIsShowInfoDialogOpen] = useDialogOpenState(appLogger, "initialised User Data Storage Info");
  const [chosenStorageInfo, setChosenStorageInfo] = useState<IUserDataStorageInfo | null>(null);

  const handleInfoDialogClose = useCallback((): void => {
    setIsShowInfoDialogOpen(false);
    setChosenStorageInfo(null);
  }, [setIsShowInfoDialogOpen]);

  const rowIdGetter: GridRowIdGetter<IUserDataStorageInfo> = useCallback((row: IUserDataStorageInfo): GridRowId => {
    return row.storageId;
  }, []);

  const COLUMNS: GridColDef[] = useMemo<GridColDef[]>((): GridColDef[] => {
    return [
      { field: "storageId", type: "string", headerName: USER_DATA_STORAGE_INFO_JSON_SCHEMA_CONSTANTS.storageId.title },
      { field: "name", type: "string", headerName: USER_DATA_STORAGE_INFO_JSON_SCHEMA_CONSTANTS.name.title },
      { field: "description", type: "string", headerName: USER_DATA_STORAGE_INFO_JSON_SCHEMA_CONSTANTS.description.title },
      {
        field: "visibilityGroupId",
        type: "singleSelect",
        valueOptions: signedInRootContext.openUserDataStorageVisibilityGroupsInfo.map(
          (openVisibilityGroup: IUserDataStorageVisibilityGroupInfo): string => {
            return openVisibilityGroup.name;
          }
        ),
        headerName: USER_DATA_STORAGE_INFO_JSON_SCHEMA_CONSTANTS.visibilityGroupId.title,
        valueGetter: (_: never, row: IUserDataStorageInfo): string | null => {
          return row.visibilityGroupId === null
            ? null
            : signedInRootContext.getOpenUserDataStorageVisibilityGroupInfo(row.visibilityGroupId)?.name ?? row.visibilityGroupId;
        },
        renderCell: (params: GridRenderCellParams<IUserDataStorageInfo, string | null>) => {
          return params.value === null ? <em>{PUBLIC_USER_DATA_STORAGE_VISIBILITY_GROUP_CONSTANTS.name}</em> : params.value;
        }
      },
      {
        field: "type",
        type: "singleSelect",
        valueOptions: Object.values(USER_DATA_STORAGE_BACKEND_TYPE_NAMES),
        headerName: BASE_USER_DATA_STORAGE_BACKEND_INFO_JSON_SCHEMA_CONSTANTS.type.title,
        valueGetter: (_: never, row: IUserDataStorageInfo): string => {
          return USER_DATA_STORAGE_BACKEND_TYPE_NAMES[row.backend.type];
        }
      },
      {
        field: "isLocal",
        type: "boolean",
        headerName: BASE_USER_DATA_STORAGE_BACKEND_INFO_JSON_SCHEMA_CONSTANTS.isLocal.title,
        valueGetter: (_: never, row: IUserDataStorageInfo): boolean => {
          return row.backend.isLocal;
        }
      },
      {
        field: "isOpen",
        type: "boolean",
        headerName: BASE_USER_DATA_STORAGE_BACKEND_INFO_JSON_SCHEMA_CONSTANTS.isOpen.title,
        valueGetter: (_: never, row: IUserDataStorageInfo): boolean => {
          return row.backend.isOpen;
        }
      },
      {
        // TODO: Put info in master detail row (pro feature)
        field: "actions",
        type: "actions",
        headerName: "Actions",
        getActions: (params: GridRowParams<IUserDataStorageInfo>) => {
          return [
            <OpenUserDataStorageInfoDialogActionItem
              logger={appLogger}
              key="openInfoDialog"
              userDataStorageInfo={params.row}
              setChosenUserDataStorageInfo={setChosenStorageInfo}
              setIsShowUserDataStorageInfoDialogOpen={setIsShowInfoDialogOpen}
            />,
            <OpenAndCloseUserDataStorageActionItem
              logger={appLogger}
              key="openAndCloseStorage"
              keys={{ open: "openStorage", close: "openStorage" }}
              userDataStorageInfo={params.row}
            />,
            <TerminateUserDataStorageActionItem logger={appLogger} key="terminateStorage" userDataStorageInfo={params.row} />
          ];
        }
      }
    ];
  }, [signedInRootContext, setIsShowInfoDialogOpen]);

  // TODO: Add info dialog
  return (
    <>
      <DataGrid
        apiRef={gridAPIRef}
        autosizeOnMount
        autosizeOptions={GRID_AUTOSIZE_OPTIONS}
        getRowId={rowIdGetter}
        rows={signedInRootContext.initialisedUserDataStoragesInfo}
        columns={COLUMNS}
        initialState={{
          columns: {
            columnVisibilityModel: {
              storageId: false
            }
          }
        }}
      />
      {chosenStorageInfo !== null ? (
        <UserDataStorageInfoDialog
          open={isShowInfoDialogOpen}
          onClose={handleInfoDialogClose}
          userDataStorageInfo={chosenStorageInfo}
          doShowId={true}
        />
      ) : null}
    </>
  );
};

export default InitialisedUserDataStoragesDataGrid;
