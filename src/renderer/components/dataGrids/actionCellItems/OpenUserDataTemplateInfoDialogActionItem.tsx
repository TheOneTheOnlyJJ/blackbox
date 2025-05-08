import { GridActionsCellItem } from "@mui/x-data-grid";
import { Dispatch, FC, SetStateAction, useCallback } from "react";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { LogFunctions } from "electron-log";
import { IUserDataTemplateInfo } from "@shared/user/data/template/info/UserDataTemplateInfo";

export interface IOpenUserDataTemplateInfoDialogActionItemProps {
  logger: LogFunctions;
  key: string | number;
  userDataTemplateInfo: IUserDataTemplateInfo;
  setChosenUserDataTemplateInfo: Dispatch<SetStateAction<IUserDataTemplateInfo | null>>;
  setIsUserDataTemplateInfoDialogOpen: Dispatch<SetStateAction<boolean>>;
  showInMenu: boolean;
}

const OpenUserDataTemplateInfoDialogActionItem: FC<IOpenUserDataTemplateInfoDialogActionItemProps> = (
  props: IOpenUserDataTemplateInfoDialogActionItemProps
) => {
  const { logger, key, userDataTemplateInfo, setChosenUserDataTemplateInfo, setIsUserDataTemplateInfoDialogOpen, showInMenu } = props;

  const handleInfoClick = useCallback((): void => {
    logger.info(`Clicked open User Data Template Info "${userDataTemplateInfo.storageId}" action button.`);
    setChosenUserDataTemplateInfo(userDataTemplateInfo);
    setIsUserDataTemplateInfoDialogOpen(true);
  }, [logger, userDataTemplateInfo, setChosenUserDataTemplateInfo, setIsUserDataTemplateInfoDialogOpen]);

  return <GridActionsCellItem key={key} icon={<InfoOutlinedIcon />} onClick={handleInfoClick} label="Show information" showInMenu={showInMenu} />;
};

export default OpenUserDataTemplateInfoDialogActionItem;
