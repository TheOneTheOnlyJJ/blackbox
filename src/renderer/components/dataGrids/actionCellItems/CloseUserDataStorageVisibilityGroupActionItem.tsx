import { GridActionsCellItem } from "@mui/x-data-grid";
import { FC, useCallback } from "react";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import { IPCAPIResponse } from "@shared/IPC/IPCAPIResponse";
import { IPC_API_RESPONSE_STATUSES } from "@shared/IPC/IPCAPIResponseStatus";
import { enqueueSnackbar } from "notistack";
import { IUserDataStorageVisibilityGroupInfo } from "@shared/user/data/storage/visibilityGroup/info/UserDataStorageVisibilityGroupInfo";
import { LogFunctions } from "electron-log";

export interface ICloseUserDataStorageVisibilityGroupActionItemProps {
  logger: LogFunctions;
  key: string | number;
  visibilityGroupInfo: IUserDataStorageVisibilityGroupInfo;
  showInMenu: boolean;
}

const CloseUserDataStorageVisibilityGroupActionItem: FC<ICloseUserDataStorageVisibilityGroupActionItemProps> = (
  props: ICloseUserDataStorageVisibilityGroupActionItemProps
) => {
  const { logger, key, visibilityGroupInfo, showInMenu } = props;
  const closeUserDataStorageVisibilityGroup = useCallback((): void => {
    logger.debug(`Clicked close User Data Storage Visibility Group "${visibilityGroupInfo.visibilityGroupId}" action button.`);
    const CLOSE_USER_DATA_STORAGE_VISIBILITY_GROUP_RESPONSE: IPCAPIResponse<number> =
      window.userDataStorageVisibilityGroupAPI.closeUserDataStorageVisibilityGroups([visibilityGroupInfo.visibilityGroupId]);
    if (CLOSE_USER_DATA_STORAGE_VISIBILITY_GROUP_RESPONSE.status === IPC_API_RESPONSE_STATUSES.SUCCESS) {
      enqueueSnackbar({
        message: `Closed ${visibilityGroupInfo.name} data storage visbility group.`,
        variant: "info"
      });
    } else {
      enqueueSnackbar({ message: `Could not close ${visibilityGroupInfo.name} data storage visibility group.`, variant: "error" });
    }
  }, [logger, visibilityGroupInfo]);

  return (
    <GridActionsCellItem key={key} icon={<CloseOutlinedIcon />} onClick={closeUserDataStorageVisibilityGroup} label="Close" showInMenu={showInMenu} />
  );
};

export default CloseUserDataStorageVisibilityGroupActionItem;
