import { FC } from "react";
import { Typography } from "@mui/material";
import { USER_DATA_STORAGE_BACKEND_TYPE_NAMES } from "@shared/user/data/storage/backend/UserDataStorageBackendTypeName";
import { OPTION_B_USER_DATA_STORAGE_BACKEND_JSON_SCHEMA_CONSTANTS } from "@shared/user/data/storage/backend/constants/implementations/optionB/OptionBUserDataStorageBackendConstants";
import { IOptionBUserDataStorageBackendConfigInfo } from "@shared/user/data/storage/backend/config/info/implementations/optionB/OptionBUserDataStorageBackendConfigInfo";
import { IBaseUserDataStorageBackendConfigInfoTypographyProps } from "../../BaseUserDataStorageBackendConfigInfoTypography";
import { BASE_USER_DATA_STORAGE_BACKEND_CONFIG_INFO_JSON_SCHEMA_CONSTANTS } from "@shared/user/data/storage/backend/config/info/BaseUserDataStorageBackendConfigInfo";

export interface IOptionBUserDataStorageBackendConfigInfoTypographyProps extends IBaseUserDataStorageBackendConfigInfoTypographyProps {
  userDataStorageBackendConfigInfo: IOptionBUserDataStorageBackendConfigInfo;
}

const OptionBUserDataStorageBackendConfigInfoTypography: FC<IOptionBUserDataStorageBackendConfigInfoTypographyProps> = (
  props: IOptionBUserDataStorageBackendConfigInfoTypographyProps
) => {
  const { userDataStorageBackendConfigInfo } = props;
  return (
    <>
      <Typography>
        <b>{BASE_USER_DATA_STORAGE_BACKEND_CONFIG_INFO_JSON_SCHEMA_CONSTANTS.type.title}:</b> {USER_DATA_STORAGE_BACKEND_TYPE_NAMES.optionB}
      </Typography>
      <Typography>
        <b>{OPTION_B_USER_DATA_STORAGE_BACKEND_JSON_SCHEMA_CONSTANTS.optionB.title}:</b> {userDataStorageBackendConfigInfo.optionB}
      </Typography>
      <Typography>
        <b>{BASE_USER_DATA_STORAGE_BACKEND_CONFIG_INFO_JSON_SCHEMA_CONSTANTS.isLocal.title}:</b>{" "}
        {userDataStorageBackendConfigInfo.isLocal ? "Yes" : "No"}
      </Typography>
    </>
  );
};

export default OptionBUserDataStorageBackendConfigInfoTypography;
