import { LogFunctions } from "electron-log";
import { FC, useCallback } from "react";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import { GridActionsCellItem } from "@mui/x-data-grid";

export interface INewUserDataBoxActionItemProps {
  logger: LogFunctions;
  key: string | number;
  dataStorage: { name: string; id: string };
  onButtonClick: (dataStorage: { name: string; id: string }) => void;
  showInMenu: boolean;
}

export const NewUserDataBoxActionItem: FC<INewUserDataBoxActionItemProps> = (props: INewUserDataBoxActionItemProps) => {
  const { logger, key, dataStorage, onButtonClick, showInMenu } = props;

  const handleNewUserDataBoxClick = useCallback((): void => {
    logger.info(`Clicked new User Data Box for User Data Storage "${dataStorage.id}" action button.`);
    // TODO: Implement this; Dialog should be outside, in the Data Grid, and this should set it to open and give the storage ID
    onButtonClick(dataStorage);
  }, [logger, dataStorage, onButtonClick]);

  return (
    <GridActionsCellItem key={key} icon={<Inventory2OutlinedIcon />} onClick={handleNewUserDataBoxClick} label="New box" showInMenu={showInMenu} />
  );
};

export default NewUserDataBoxActionItem;
