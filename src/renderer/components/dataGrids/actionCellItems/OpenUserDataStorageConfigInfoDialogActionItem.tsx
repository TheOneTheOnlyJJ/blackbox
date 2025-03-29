import { GridActionsCellItem } from "@mui/x-data-grid";
import { IUserDataStorageConfigInfo } from "@shared/user/data/storage/config/info/UserDataStorageConfigInfo";
import { Dispatch, FC, SetStateAction, useCallback } from "react";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { LogFunctions } from "electron-log";

export interface IOpenUserDataStorageConfigInfoDialogActionItemProps {
  logger: LogFunctions;
  key: string | number;
  userDataStorageConfigInfo: IUserDataStorageConfigInfo;
  setChosenUserDataStorageConfigInfo: Dispatch<SetStateAction<IUserDataStorageConfigInfo | null>>;
  setIsShowUserDataStorageConfigInfoDialogOpen: Dispatch<SetStateAction<boolean>>;
}

const OpenUserDataStorageConfigInfoDialogActionItem: FC<IOpenUserDataStorageConfigInfoDialogActionItemProps> = (
  props: IOpenUserDataStorageConfigInfoDialogActionItemProps
) => {
  const { logger, key, userDataStorageConfigInfo, setChosenUserDataStorageConfigInfo, setIsShowUserDataStorageConfigInfoDialogOpen } = props;

  const handleInfoClick = useCallback((): void => {
    logger.info(`Clicked show User Data Storage Config Info "${userDataStorageConfigInfo.storageId}" action button.`);
    setChosenUserDataStorageConfigInfo(userDataStorageConfigInfo);
    setIsShowUserDataStorageConfigInfoDialogOpen(true);
  }, [logger, userDataStorageConfigInfo, setChosenUserDataStorageConfigInfo, setIsShowUserDataStorageConfigInfoDialogOpen]);

  return <GridActionsCellItem key={key} icon={<InfoOutlinedIcon />} onClick={handleInfoClick} label="Show information" />;
};

export default OpenUserDataStorageConfigInfoDialogActionItem;
