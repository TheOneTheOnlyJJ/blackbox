import { IUserDataStorageInfo } from "@shared/user/data/storage/info/UserDataStorageInfo";
import { LogFunctions } from "electron-log";
import { FC, useCallback } from "react";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import { GridActionsCellItem } from "@mui/x-data-grid";

export interface INewUserDataBoxActionItemProps {
  logger: LogFunctions;
  key: string | number;
  userDataStorageInfo: IUserDataStorageInfo;
  showInMenu: boolean;
}

export const NewUserDataBoxActionItem: FC<INewUserDataBoxActionItemProps> = (props: INewUserDataBoxActionItemProps) => {
  const { logger, key, userDataStorageInfo, showInMenu } = props;

  const handleNewUserDataBoxClick = useCallback((): void => {
    logger.info(`Clicked new User Data Box for User Data Storage "${userDataStorageInfo.storageId}" action button.`);
    // TODO: Implement this; Dialog should be outside, in the Data Grid, and this should set it to open and give the storage ID
  }, [logger, userDataStorageInfo]);

  return (
    <GridActionsCellItem key={key} icon={<Inventory2OutlinedIcon />} onClick={handleNewUserDataBoxClick} label="New box" showInMenu={showInMenu} />
  );
};

export default NewUserDataBoxActionItem;
