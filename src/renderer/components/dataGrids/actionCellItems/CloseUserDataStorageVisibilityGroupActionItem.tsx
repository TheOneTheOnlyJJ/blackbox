import { GridActionsCellItem } from "@mui/x-data-grid";
import { FC, useCallback } from "react";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import { appLogger } from "@renderer/utils/loggers";
import { IPCAPIResponse } from "@shared/IPC/IPCAPIResponse";
import { IPC_API_RESPONSE_STATUSES } from "@shared/IPC/IPCAPIResponseStatus";
import { enqueueSnackbar } from "notistack";

export interface ICloseUserDataStorageVisibilityGroupActionItemProps {
  key: string | number;
  visibilityGroupId: string;
}

const CloseUserDataStorageVisibilityGroupActionItem: FC<ICloseUserDataStorageVisibilityGroupActionItemProps> = (
  props: ICloseUserDataStorageVisibilityGroupActionItemProps
) => {
  const { visibilityGroupId } = props;
  const closeUserDataStorageVisibilityGroup = useCallback((): void => {
    appLogger.debug(`Clicked close User Data Storage Visibility Group "${visibilityGroupId}" action.`);
    const CLOSE_USER_DATA_STORAGE_VISIBILITY_GROUP_RESPONSE: IPCAPIResponse<number> = window.userAPI.closeUserDataStorageVisibilityGroups([
      visibilityGroupId
    ]);
    if (CLOSE_USER_DATA_STORAGE_VISIBILITY_GROUP_RESPONSE.status === IPC_API_RESPONSE_STATUSES.SUCCESS) {
      enqueueSnackbar({
        message: `Closed ${CLOSE_USER_DATA_STORAGE_VISIBILITY_GROUP_RESPONSE.data.toString()} data storage visbility group${
          CLOSE_USER_DATA_STORAGE_VISIBILITY_GROUP_RESPONSE.data === 1 ? "" : "s"
        }.`,
        variant: "info"
      });
    } else {
      enqueueSnackbar({ message: "Could not close data storage visibility group.", variant: "error" });
    }
  }, [visibilityGroupId]);

  return <GridActionsCellItem key={props.key} icon={<CloseOutlinedIcon />} onClick={closeUserDataStorageVisibilityGroup} label="Close" />;
};

export default CloseUserDataStorageVisibilityGroupActionItem;
