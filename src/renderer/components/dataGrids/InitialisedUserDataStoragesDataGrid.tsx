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
import { useMUIXDataGridAutosizeColumnsOnWindowResize } from "@renderer/hooks/useMUIXDataGridAutosizeOnWindowResize";
import { appLogger } from "@renderer/utils/loggers";
import { FC, MutableRefObject, ReactElement, useCallback, useMemo, useState } from "react";
import { ISignedInRootContext, useSignedInRootContext } from "../roots/signedInRoot/SignedInRootContext";
import { IUserDataStorageInfo, USER_DATA_STORAGE_INFO_JSON_SCHEMA_CONSTANTS } from "@shared/user/data/storage/info/UserDataStorageInfo";
import { IUserDataStorageVisibilityGroupInfo } from "@shared/user/data/storage/visibilityGroup/info/UserDataStorageVisibilityGroupInfo";
import { PUBLIC_USER_DATA_STORAGE_VISIBILITY_GROUP_CONSTANTS } from "@shared/user/data/storage/visibilityGroup/public/constants";
import { USER_DATA_STORAGE_BACKEND_TYPE_NAMES } from "@shared/user/data/storage/backend/UserDataStorageBackendTypeName";
import { BASE_USER_DATA_STORAGE_BACKEND_INFO_JSON_SCHEMA_CONSTANTS } from "@shared/user/data/storage/backend/info/BaseUserDataStorageBackendInfo";
import { useDialogOpenState } from "@renderer/hooks/useDialogState";
import UserDataStorageInfoDialog from "../dialogs/info/user/data/storage/UserDataStorageInfoDialog";
import OpenUserDataStorageInfoDialogActionItem from "./actionCellItems/OpenUserDataStorageInfoDialogActionItem";
import TerminateUserDataStorageActionItem from "./actionCellItems/TerminateUserDataStorageActionItem";
import CloseUserDataStorageActionItem from "./actionCellItems/CloseUserDataStorageActionItem";
import OpenUserDataStorageActionItem from "./actionCellItems/OpenUserDataStorageActionItem";
import NewUserDataBoxActionItem from "./actionCellItems/NewUserDataBoxActionItem";
import NewUserDataBoxConfigFormDialog from "../dialogs/forms/user/data/box/NewUserDataBoxConfigFormDialog";
import { IUserDataBoxConfigCreateInput } from "@renderer/user/data/box/config/create/input/UserDataBoxConfigCreateInput";

const GRID_AUTOSIZE_OPTIONS: GridAutosizeOptions = { expand: true, includeHeaders: true };

const InitialisedUserDataStoragesDataGrid: FC = () => {
  const signedInRootContext: ISignedInRootContext = useSignedInRootContext();

  const gridAPIRef: MutableRefObject<GridApi> = useGridApiRef();
  const { gridAutosizeColumns } = useMUIXDataGridAutosizeColumnsOnWindowResize({
    logger: appLogger,
    gridAPIRef: gridAPIRef,
    autosizeOptions: GRID_AUTOSIZE_OPTIONS,
    gridPurposeToLog: "initialised User Data Storages"
  });
  const [isStorageInfoDialogOpen, setIsStorageInfoDialogOpen] = useDialogOpenState(appLogger, "initialised User Data Storage Info");
  const [chosenStorageInfo, setChosenStorageInfo] = useState<IUserDataStorageInfo | null>(null);
  const [newUserDataBoxConfigDefaultValues, setNewUserDataBoxConfigDefaultValues] = useState<Partial<IUserDataBoxConfigCreateInput> | null>(null);

  const handleStorageInfoDialogClose = useCallback((): void => {
    setIsStorageInfoDialogOpen(false);
    setChosenStorageInfo(null);
  }, [setIsStorageInfoDialogOpen]);

  // TODO: Move all of these to Boxes page (Remove form here)
  const [isNewUserDataBoxConfigFormDialogOpen, setIsNewUserDataBoxConfigFormDialogOpen] = useDialogOpenState(
    appLogger,
    "new User Data Box Config form"
  );

  const handleNewDataBoxConfigButtonClick = useCallback(
    (dataStorage: { name: string; id: string }): void => {
      appLogger.debug("New User Data Box Config button clicked.");
      setNewUserDataBoxConfigDefaultValues({ storageId: dataStorage.id });
      setIsNewUserDataBoxConfigFormDialogOpen(true);
    },
    [setIsNewUserDataBoxConfigFormDialogOpen]
  );

  const handleNewUserDataBoxConfigFormDialogClose = useCallback((): void => {
    setIsNewUserDataBoxConfigFormDialogOpen(false);
  }, [setIsNewUserDataBoxConfigFormDialogOpen]);

  const handleSuccessfullyAddedNewUserDataBoxConfig = useCallback((): void => {
    handleNewUserDataBoxConfigFormDialogClose();
  }, [handleNewUserDataBoxConfigFormDialogClose]);
  // Move until here

  const rowIdGetter: GridRowIdGetter<IUserDataStorageInfo> = useCallback((row: IUserDataStorageInfo): GridRowId => {
    return row.visibilityGroupId === null ? row.storageId : row.storageId + row.visibilityGroupId;
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
            : signedInRootContext.getOpenUserDataStorageVisibilityGroupInfoById(row.visibilityGroupId)?.name ?? row.visibilityGroupId;
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
          const ACTION_ITEMS: ReactElement<GridActionsCellItemProps>[] = [
            <OpenUserDataStorageInfoDialogActionItem
              logger={appLogger}
              key="openInfoDialog"
              userDataStorageInfo={params.row}
              setChosenUserDataStorageInfo={setChosenStorageInfo}
              setIsUserDataStorageInfoDialogOpen={setIsStorageInfoDialogOpen}
              showInMenu={false}
            />
          ];
          if (params.row.backend.isOpen) {
            ACTION_ITEMS.push(
              <NewUserDataBoxActionItem
                logger={appLogger}
                key="newBox"
                dataStorage={{
                  name: params.row.name,
                  id: params.row.storageId
                }}
                onButtonClick={handleNewDataBoxConfigButtonClick}
                showInMenu={true}
              />,
              <CloseUserDataStorageActionItem
                logger={appLogger}
                key="closeStorage"
                dataStorage={{
                  name: params.row.name,
                  id: params.row.storageId
                }}
                showInMenu={true}
              />
            );
          } else {
            ACTION_ITEMS.push(
              <OpenUserDataStorageActionItem
                logger={appLogger}
                key="openStorage"
                dataStorage={{
                  name: params.row.name,
                  id: params.row.storageId
                }}
                showInMenu={true}
              />
            );
          }
          ACTION_ITEMS.push(
            <TerminateUserDataStorageActionItem
              logger={appLogger}
              key="terminateStorage"
              dataStorage={{
                name: params.row.name,
                id: params.row.storageId
              }}
              showInMenu={true}
            />
          );
          return ACTION_ITEMS;
        }
      }
    ];
  }, [signedInRootContext, setIsStorageInfoDialogOpen, handleNewDataBoxConfigButtonClick]);

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
        onColumnVisibilityModelChange={gridAutosizeColumns}
      />
      {chosenStorageInfo !== null ? (
        <UserDataStorageInfoDialog
          open={isStorageInfoDialogOpen}
          onClose={handleStorageInfoDialogClose}
          userDataStorageInfo={chosenStorageInfo}
          doShowId={true}
        />
      ) : null}
      <NewUserDataBoxConfigFormDialog
        defaultValues={newUserDataBoxConfigDefaultValues}
        onAddedSuccessfully={handleSuccessfullyAddedNewUserDataBoxConfig}
        open={isNewUserDataBoxConfigFormDialogOpen}
        onClose={handleNewUserDataBoxConfigFormDialogClose}
      />
    </>
  );
};

export default InitialisedUserDataStoragesDataGrid;
