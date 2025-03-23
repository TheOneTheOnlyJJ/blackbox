import { FC } from "react";
import { Typography } from "@mui/material";
import { IBaseUserDataStorageBackendInfoTypographyProps } from "../../BaseUserDataStorageBackendInfoTypography";
import { BASE_USER_DATA_STORAGE_BACKEND_INFO_JSON_SCHEMA_CONSTANTS } from "@shared/user/data/storage/backend/info/BaseUserDataStorageBackendInfo";
import { USER_DATA_STORAGE_BACKEND_TYPE_NAMES } from "@shared/user/data/storage/backend/UserDataStorageBackendTypeName";
import { IOptionCUserDataStorageBackendInfo } from "@shared/user/data/storage/backend/info/implementations/optionC/OptionCUserDataStorageBackendInfo";
import { OPTION_C_USER_DATA_STORAGE_BACKEND_JSON_SCHEMA_CONSTANTS } from "@shared/user/data/storage/backend/constants/implementations/optionC/OptionCUserDataStorageBackendConstants";

export interface IOptionCUserDataStorageBackendInfoTypographyProps extends IBaseUserDataStorageBackendInfoTypographyProps {
  userDataStorageBackendInfo: IOptionCUserDataStorageBackendInfo;
}

const OptionCUserDataStorageBackendInfoTypography: FC<IOptionCUserDataStorageBackendInfoTypographyProps> = (
  props: IOptionCUserDataStorageBackendInfoTypographyProps
) => {
  const { userDataStorageBackendInfo } = props;
  return (
    <>
      <Typography>
        <b>{BASE_USER_DATA_STORAGE_BACKEND_INFO_JSON_SCHEMA_CONSTANTS.type.title}:</b> {USER_DATA_STORAGE_BACKEND_TYPE_NAMES.optionC}
      </Typography>
      <Typography>
        <b>{OPTION_C_USER_DATA_STORAGE_BACKEND_JSON_SCHEMA_CONSTANTS.optionC.title}:</b> {userDataStorageBackendInfo.optionC}
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

export default OptionCUserDataStorageBackendInfoTypography;
