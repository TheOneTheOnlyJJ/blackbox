import { GridActionsCellItem } from "@mui/x-data-grid";
import { IUserDataStorageConfigInfo } from "@shared/user/data/storage/config/info/UserDataStorageConfigInfo";
import { FC, useCallback } from "react";
import PlayCircleOutlineOutlinedIcon from "@mui/icons-material/PlayCircleOutlineOutlined";
import { appLogger } from "@renderer/utils/loggers";

export interface IStartUserDataStorageActionItemProps {
  key: string | number;
  userDataStorageConfigInfo: IUserDataStorageConfigInfo;
}

const ActivateUserDataStorageActionItem: FC<IStartUserDataStorageActionItemProps> = (props: IStartUserDataStorageActionItemProps) => {
  const handleOpenClick = useCallback((): void => {
    appLogger.info(`Clicked activate User Data Storage "${props.userDataStorageConfigInfo.storageId}" action button.`);
  }, [props]);

  return <GridActionsCellItem key={props.key} icon={<PlayCircleOutlineOutlinedIcon />} onClick={handleOpenClick} label="Activate" />;
};

export default ActivateUserDataStorageActionItem;
