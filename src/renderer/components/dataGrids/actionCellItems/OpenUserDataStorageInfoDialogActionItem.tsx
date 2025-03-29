import { GridActionsCellItem } from "@mui/x-data-grid";
import { Dispatch, FC, SetStateAction, useCallback } from "react";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { LogFunctions } from "electron-log";
import { IUserDataStorageInfo } from "@shared/user/data/storage/info/UserDataStorageInfo";

export interface IOpenUserDataStorageInfoDialogActionItemProps {
  logger: LogFunctions;
  key: string | number;
  userDataStorageInfo: IUserDataStorageInfo;
  setChosenUserDataStorageInfo: Dispatch<SetStateAction<IUserDataStorageInfo | null>>;
  setIsShowUserDataStorageInfoDialogOpen: Dispatch<SetStateAction<boolean>>;
  showInMenu: boolean;
}

const OpenUserDataStorageInfoDialogActionItem: FC<IOpenUserDataStorageInfoDialogActionItemProps> = (
  props: IOpenUserDataStorageInfoDialogActionItemProps
) => {
  const { logger, key, userDataStorageInfo, setChosenUserDataStorageInfo, setIsShowUserDataStorageInfoDialogOpen, showInMenu } = props;

  const handleInfoClick = useCallback((): void => {
    logger.info(`Clicked show User Data Storage Info "${userDataStorageInfo.storageId}" action button.`);
    setChosenUserDataStorageInfo(userDataStorageInfo);
    setIsShowUserDataStorageInfoDialogOpen(true);
  }, [logger, userDataStorageInfo, setChosenUserDataStorageInfo, setIsShowUserDataStorageInfoDialogOpen]);

  return <GridActionsCellItem key={key} icon={<InfoOutlinedIcon />} onClick={handleInfoClick} label="Show information" showInMenu={showInMenu} />;
};

export default OpenUserDataStorageInfoDialogActionItem;
