import { FC } from "react";
import { Typography } from "@mui/material";
import { IBaseUserDataStorageBackendInfoTypographyProps } from "../../BaseUserDataStorageBackendInfoTypography";
import { BASE_USER_DATA_STORAGE_BACKEND_INFO_JSON_SCHEMA_CONSTANTS } from "@shared/user/data/storage/backend/info/BaseUserDataStorageBackendInfo";
import { USER_DATA_STORAGE_BACKEND_TYPE_NAMES } from "@shared/user/data/storage/backend/UserDataStorageBackendTypeName";
import { IOptionBUserDataStorageBackendInfo } from "@shared/user/data/storage/backend/info/implementations/optionB/OptionBUserDataStorageBackendInfo";
import { OPTION_B_USER_DATA_STORAGE_BACKEND_JSON_SCHEMA_CONSTANTS } from "@shared/user/data/storage/backend/constants/implementations/optionB/OptionBUserDataStorageBackendConstants";

export interface IOptionBUserDataStorageBackendInfoTypographyProps extends IBaseUserDataStorageBackendInfoTypographyProps {
  userDataStorageBackendInfo: IOptionBUserDataStorageBackendInfo;
}

const OptionBUserDataStorageBackendInfoTypography: FC<IOptionBUserDataStorageBackendInfoTypographyProps> = (
  props: IOptionBUserDataStorageBackendInfoTypographyProps
) => {
  const { userDataStorageBackendInfo } = props;
  return (
    <>
      <Typography>
        <b>{BASE_USER_DATA_STORAGE_BACKEND_INFO_JSON_SCHEMA_CONSTANTS.type.title}:</b> {USER_DATA_STORAGE_BACKEND_TYPE_NAMES.optionB}
      </Typography>
      <Typography>
        <b>{OPTION_B_USER_DATA_STORAGE_BACKEND_JSON_SCHEMA_CONSTANTS.optionB.title}:</b> {userDataStorageBackendInfo.optionB}
      </Typography>
      <Typography>
        <b>{BASE_USER_DATA_STORAGE_BACKEND_INFO_JSON_SCHEMA_CONSTANTS.isLocal.title}:</b> {userDataStorageBackendInfo.isLocal ? "Yes" : "No"}
      </Typography>
      <Typography>
        <b>{BASE_USER_DATA_STORAGE_BACKEND_INFO_JSON_SCHEMA_CONSTANTS.isOpen.title}:</b> {userDataStorageBackendInfo.isOpen ? "Yes" : "No"}
      </Typography>
    </>
  );
};

export default OptionBUserDataStorageBackendInfoTypography;
