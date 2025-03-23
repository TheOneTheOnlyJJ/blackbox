import { FC } from "react";
import { Typography } from "@mui/material";
import { USER_DATA_STORAGE_BACKEND_TYPE_NAMES } from "@shared/user/data/storage/backend/UserDataStorageBackendTypeName";
import { IBaseUserDataStorageBackendConfigInfoTypographyProps } from "../../BaseUserDataStorageBackendConfigInfoTypography";
import { BASE_USER_DATA_STORAGE_BACKEND_CONFIG_INFO_JSON_SCHEMA_CONSTANTS } from "@shared/user/data/storage/backend/config/info/BaseUserDataStorageBackendConfigInfo";
import { IOptionCUserDataStorageBackendConfigInfo } from "@shared/user/data/storage/backend/config/info/implementations/optionC/OptionCUserDataStorageBackendConfigInfo";
import { OPTION_C_USER_DATA_STORAGE_BACKEND_JSON_SCHEMA_CONSTANTS } from "@shared/user/data/storage/backend/constants/implementations/optionC/OptionCUserDataStorageBackendConstants";

export interface IOptionCUserDataStorageBackendConfigInfoTypographyProps extends IBaseUserDataStorageBackendConfigInfoTypographyProps {
  userDataStorageBackendConfigInfo: IOptionCUserDataStorageBackendConfigInfo;
}

const OptionCUserDataStorageBackendConfigInfoTypography: FC<IOptionCUserDataStorageBackendConfigInfoTypographyProps> = (
  props: IOptionCUserDataStorageBackendConfigInfoTypographyProps
) => {
  const { userDataStorageBackendConfigInfo } = props;
  return (
    <>
      <Typography>
        <b>{BASE_USER_DATA_STORAGE_BACKEND_CONFIG_INFO_JSON_SCHEMA_CONSTANTS.type.title}:</b> {USER_DATA_STORAGE_BACKEND_TYPE_NAMES.optionC}
      </Typography>
      <Typography>
        <b>{OPTION_C_USER_DATA_STORAGE_BACKEND_JSON_SCHEMA_CONSTANTS.optionC.title}:</b> {userDataStorageBackendConfigInfo.optionC}
      </Typography>
      <Typography>
        <b>{BASE_USER_DATA_STORAGE_BACKEND_CONFIG_INFO_JSON_SCHEMA_CONSTANTS.isLocal.title}:</b>{" "}
        {userDataStorageBackendConfigInfo.isLocal ? "Yes" : "No"}
      </Typography>
    </>
  );
};

export default OptionCUserDataStorageBackendConfigInfoTypography;
