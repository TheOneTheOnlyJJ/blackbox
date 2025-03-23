import { GridActionsCellItem } from "@mui/x-data-grid";
import { IUserDataStorageConfigInfo } from "@shared/user/data/storage/config/info/UserDataStorageConfigInfo";
import { Dispatch, FC, SetStateAction, useCallback } from "react";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

export interface IOpenUserDataStorageConfigInfoDialogActionItemProps {
  key: string | number;
  userDataStorageConfigInfo: IUserDataStorageConfigInfo;
  setChosenUserDataStorageConfigInfo: Dispatch<SetStateAction<IUserDataStorageConfigInfo | null>>;
  setIsShowUserDataStorageConfigInfoDialogOpen: Dispatch<SetStateAction<boolean>>;
}

const OpenUserDataStorageConfigInfoDialogActionItem: FC<IOpenUserDataStorageConfigInfoDialogActionItemProps> = (
  props: IOpenUserDataStorageConfigInfoDialogActionItemProps
) => {
  const handleInfoClick = useCallback((): void => {
    props.setChosenUserDataStorageConfigInfo(props.userDataStorageConfigInfo);
    props.setIsShowUserDataStorageConfigInfoDialogOpen(true);
  }, [props]);

  return <GridActionsCellItem key={props.key} icon={<InfoOutlinedIcon />} onClick={handleInfoClick} label="Show Info" />;
};

export default OpenUserDataStorageConfigInfoDialogActionItem;
