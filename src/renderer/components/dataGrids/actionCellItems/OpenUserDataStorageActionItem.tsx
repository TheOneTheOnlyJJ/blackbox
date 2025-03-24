import { GridActionsCellItem } from "@mui/x-data-grid";
import { IUserDataStorageConfigInfo } from "@shared/user/data/storage/config/info/UserDataStorageConfigInfo";
import { FC, useCallback } from "react";
import LaunchIcon from "@mui/icons-material/Launch";
import { appLogger } from "@renderer/utils/loggers";

export interface IOpenUserDataStorageActionItemProps {
  key: string | number;
  userDataStorageConfigInfo: IUserDataStorageConfigInfo;
}

const OpenUserDataStorageActionItem: FC<IOpenUserDataStorageActionItemProps> = (props: IOpenUserDataStorageActionItemProps) => {
  const handleOpenClick = useCallback((): void => {
    appLogger.info(`Clicked open User Data Storage "${props.userDataStorageConfigInfo.storageId}" button.`);
  }, [props]);

  return <GridActionsCellItem key={props.key} icon={<LaunchIcon />} onClick={handleOpenClick} label="Show Info" />;
};

export default OpenUserDataStorageActionItem;
