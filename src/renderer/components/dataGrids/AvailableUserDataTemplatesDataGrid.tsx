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
import { useMUIXDataGridAutosizeColumnsOnWindowResize } from "@renderer/hooks/useMUIXDataGridAutosizeOnWindowResize";
import { appLogger } from "@renderer/utils/loggers";
import { IUserDataTemplateInfo, USER_DATA_TEMPLATE_INFO_JSON_SCHEMA_CONSTANTS } from "@shared/user/data/template/info/UserDataTemplateInfo";
import { IUserDataStorageInfo } from "@shared/user/data/storage/info/UserDataStorageInfo";
import { IUserDataBoxInfo } from "@shared/user/data/box/info/UserDataBoxInfo";
import { IUserDataBoxIdentifier } from "@shared/user/data/box/identifier/UserDataBoxIdentifier";
import UserDataTemplateInfoDialog from "../dialogs/info/user/data/template/UserDataTemplateInfoDialog";
import { useDialogOpenState } from "@renderer/hooks/useDialogState";
import OpenUserDataTemplateInfoDialogActionItem from "./actionCellItems/OpenUserDataTemplateInfoDialogActionItem";
import NewUserDataEntryActionItem from "./actionCellItems/NewUserDataEntryActionItem";
import { userDataTemplateInfoToUserDataTemplateIdentifier } from "@shared/user/data/template/utils/userDataTemplateInfoToUserDataTemplateIdentifier";
import { IUserDataTemplateIdentifier } from "@shared/user/data/template/identifier/UserDataTemplateIdentifier";
import NewUserDataEntryFormDialog from "../dialogs/forms/user/data/entry/NewUserDataEntryFormDialog";
import NavigateToUserDataEntriesPageActionItem from "./actionCellItems/NavigateToUserDataEntriesPageActionItem";

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
  const [isTemplateInfoDialogOpen, setIsTemplateInfoDialogOpen] = useDialogOpenState(appLogger, "User Data Template Info");
  const [chosenTemplateInfo, setChosenTemplateInfo] = useState<IUserDataTemplateInfo | null>(null);
  const [newUserDataEntryTemplateInfo, setNewUserDataEntryTemplateInfo] = useState<IUserDataTemplateInfo | null>(null);

  const handleTemplateInfoDialogClose = useCallback((): void => {
    setIsTemplateInfoDialogOpen(false);
    setChosenTemplateInfo(null);
  }, [setIsTemplateInfoDialogOpen]);

  const [isNewUserDataEntryFormDialogOpen, setIsNewUserDataEntryFormDialogOpen] = useDialogOpenState(appLogger, "new User Data Entry form");

  const handleNewDataEntryButtonClick = useCallback(
    (dataTemplateIdentifier: IUserDataTemplateIdentifier): void => {
      appLogger.debug("New User Data Entry button clicked.");
      const TEMPLATE_INFO: IUserDataTemplateInfo | null = signedInRootContext.getAvailableUserDataTemplateInfoByIdentifier(dataTemplateIdentifier);
      if (TEMPLATE_INFO === null) {
        appLogger.warn(
          `Missing User Data Template ${dataTemplateIdentifier.templateId} from User Data Box ${dataTemplateIdentifier.boxId} from User Data Storage ${dataTemplateIdentifier.storageId}!`
        );
        return;
      }
      setNewUserDataEntryTemplateInfo(TEMPLATE_INFO);
      setIsNewUserDataEntryFormDialogOpen(true);
    },
    [setIsNewUserDataEntryFormDialogOpen, signedInRootContext]
  );

  const handleNewUserDataEntryFormDialogClose = useCallback((): void => {
    setIsNewUserDataEntryFormDialogOpen(false);
  }, [setIsNewUserDataEntryFormDialogOpen]);

  const handleSuccessfullyAddedNewUserDataEntry = useCallback((): void => {
    handleNewUserDataEntryFormDialogClose();
  }, [handleNewUserDataEntryFormDialogClose]);

  const rowIdGetter: GridRowIdGetter<IUserDataTemplateInfo> = useCallback((row: IUserDataTemplateInfo): GridRowId => {
    return "".concat(row.templateId, row.boxId, row.storageId);
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
      },
      {
        // TODO: Put info in master detail row (pro feature)
        field: "actions",
        type: "actions",
        headerName: "Actions",
        getActions: (params: GridRowParams<IUserDataTemplateInfo>) => {
          const CURRENT_ROW_IDENTIFIER: IUserDataTemplateIdentifier = userDataTemplateInfoToUserDataTemplateIdentifier(params.row, null);
          return [
            <OpenUserDataTemplateInfoDialogActionItem
              logger={appLogger}
              key="openInfoDialog"
              userDataTemplateInfo={params.row}
              setChosenUserDataTemplateInfo={setChosenTemplateInfo}
              setIsUserDataTemplateInfoDialogOpen={setIsTemplateInfoDialogOpen}
              showInMenu={false}
            />,
            <NewUserDataEntryActionItem
              logger={appLogger}
              key="newDataEntry"
              dataTemplateIdentifier={CURRENT_ROW_IDENTIFIER}
              onButtonClick={handleNewDataEntryButtonClick}
              showInMenu={false}
            />,
            <NavigateToUserDataEntriesPageActionItem
              logger={appLogger}
              key="navigateToEntries"
              dataTemplateIdentifier={CURRENT_ROW_IDENTIFIER}
              showInMenu={false}
            />
          ];
        }
      }
    ];
  }, [signedInRootContext, setIsTemplateInfoDialogOpen, handleNewDataEntryButtonClick]);

  return (
    <>
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
      {chosenTemplateInfo !== null ? (
        <UserDataTemplateInfoDialog
          open={isTemplateInfoDialogOpen}
          onClose={handleTemplateInfoDialogClose}
          userDataTemplateInfo={chosenTemplateInfo}
          doShowId={true}
        />
      ) : null}
      {newUserDataEntryTemplateInfo !== null ? (
        <NewUserDataEntryFormDialog
          templateInfo={newUserDataEntryTemplateInfo}
          onAddedSuccessfully={handleSuccessfullyAddedNewUserDataEntry}
          open={isNewUserDataEntryFormDialogOpen}
          onClose={handleNewUserDataEntryFormDialogClose}
        />
      ) : null}
    </>
  );
};

export default AvailableUserDataTemplatesDataGrid;
