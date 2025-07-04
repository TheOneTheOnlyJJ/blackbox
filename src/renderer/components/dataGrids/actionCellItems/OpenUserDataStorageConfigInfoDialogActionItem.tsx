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
  setIsUserDataStorageConfigInfoDialogOpen: Dispatch<SetStateAction<boolean>>;
  showInMenu: boolean;
}

const OpenUserDataStorageConfigInfoDialogActionItem: FC<IOpenUserDataStorageConfigInfoDialogActionItemProps> = (
  props: IOpenUserDataStorageConfigInfoDialogActionItemProps
) => {
  const { logger, key, userDataStorageConfigInfo, setChosenUserDataStorageConfigInfo, setIsUserDataStorageConfigInfoDialogOpen, showInMenu } = props;

  const handleInfoClick = useCallback((): void => {
    logger.info(`Clicked open User Data Storage Config Info "${userDataStorageConfigInfo.storageId}" action button.`);
    setChosenUserDataStorageConfigInfo(userDataStorageConfigInfo);
    setIsUserDataStorageConfigInfoDialogOpen(true);
  }, [logger, userDataStorageConfigInfo, setChosenUserDataStorageConfigInfo, setIsUserDataStorageConfigInfoDialogOpen]);

  return <GridActionsCellItem key={key} icon={<InfoOutlinedIcon />} onClick={handleInfoClick} label="Show information" showInMenu={showInMenu} />;
};

export default OpenUserDataStorageConfigInfoDialogActionItem;
