import { LogFunctions } from "electron-log";
import { FC, useCallback } from "react";
import { GridActionsCellItem } from "@mui/x-data-grid";
import { IUserDataTemplateIdentifier } from "@shared/user/data/template/identifier/UserDataTemplateIdentifier";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";

export interface INewUserDataEntryActionItemProps {
  logger: LogFunctions;
  key: string | number;
  dataTemplateIdentifier: IUserDataTemplateIdentifier;
  onButtonClick: (dataTemplateIdentifier: IUserDataTemplateIdentifier) => void;
  showInMenu: boolean;
}

export const NewUserDataEntryActionItem: FC<INewUserDataEntryActionItemProps> = (props: INewUserDataEntryActionItemProps) => {
  const { logger, key, dataTemplateIdentifier, onButtonClick, showInMenu } = props;

  const handleNewUserDataEntryClick = useCallback((): void => {
    logger.info(
      `Clicked new User Data Entry action button for User Data Template "${dataTemplateIdentifier.templateId}" from User Data Box "${dataTemplateIdentifier.boxId}" from User Data Storage "${dataTemplateIdentifier.storageId}".`
    );
    onButtonClick(dataTemplateIdentifier);
  }, [logger, dataTemplateIdentifier, onButtonClick]);

  return <GridActionsCellItem key={key} icon={<AddOutlinedIcon />} onClick={handleNewUserDataEntryClick} label="New box" showInMenu={showInMenu} />;
};

export default NewUserDataEntryActionItem;
