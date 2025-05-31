import { LogFunctions } from "electron-log";
import { FC, useCallback } from "react";
import { GridActionsCellItem } from "@mui/x-data-grid";
import { IUserDataTemplateIdentifier } from "@shared/user/data/template/identifier/UserDataTemplateIdentifier";
import OpenInNewOutlinedIcon from "@mui/icons-material/OpenInNewOutlined";
import { NavigateFunction, useNavigate } from "react-router-dom";
import { ISignedInRootContext, useSignedInRootContext } from "@renderer/components/roots/signedInRoot/SignedInRootContext";

export interface INavigateToUserDataEntriesPageActionItemProps {
  logger: LogFunctions;
  key: string | number;
  dataTemplateIdentifier: IUserDataTemplateIdentifier;
  showInMenu: boolean;
}

export const NavigateToUserDataEntriesPageActionItem: FC<INavigateToUserDataEntriesPageActionItemProps> = (
  props: INavigateToUserDataEntriesPageActionItemProps
) => {
  const signedInRootContext: ISignedInRootContext = useSignedInRootContext();
  const { logger, key, dataTemplateIdentifier, showInMenu } = props;
  const navigate: NavigateFunction = useNavigate();

  const handleNewUserDataEntryClick = useCallback((): void => {
    logger.info(
      `Clicked navigate to User Data Entries page action button for User Data Template "${dataTemplateIdentifier.templateId}" from User Data Box "${dataTemplateIdentifier.boxId}" from User Data Storage "${dataTemplateIdentifier.storageId}".`
    );
    navigate(
      `/users/${signedInRootContext.signedInUserInfo.userId}/data/entries/${dataTemplateIdentifier.storageId}/${dataTemplateIdentifier.boxId}/${dataTemplateIdentifier.templateId}/available`
    );
  }, [logger, signedInRootContext, dataTemplateIdentifier, navigate]);

  return (
    <GridActionsCellItem key={key} icon={<OpenInNewOutlinedIcon />} onClick={handleNewUserDataEntryClick} label="New box" showInMenu={showInMenu} />
  );
};

export default NavigateToUserDataEntriesPageActionItem;
