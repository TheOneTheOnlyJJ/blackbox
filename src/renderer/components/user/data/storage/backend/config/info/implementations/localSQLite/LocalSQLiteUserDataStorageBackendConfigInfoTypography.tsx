import { FC } from "react";
import { Typography } from "@mui/material";
import { IBaseUserDataStorageBackendConfigInfoTypographyProps } from "../../BaseUserDataStorageBackendConfigInfoTypography";
import { ILocalSQLiteUserDataStorageBackendConfigInfo } from "@shared/user/data/storage/backend/config/info/implementations/localSQLite/LocalSQLiteUserDataStorageBackendConfigInfo";
import { USER_DATA_STORAGE_BACKEND_TYPE_NAMES } from "@shared/user/data/storage/backend/UserDataStorageBackendTypeName";
import { BASE_USER_DATA_STORAGE_BACKEND_CONFIG_INFO_JSON_SCHEMA_CONSTANTS } from "@shared/user/data/storage/backend/config/info/BaseUserDataStorageBackendConfigInfo";
import { LOCAL_SQLITE_USER_DATA_STORAGE_BACKEND_JSON_SCHEMA_CONSTANTS } from "@shared/user/data/storage/backend/constants/implementations/localSQLite/LocalSQLiteUserDataStorageBackendConstants";

export interface ILocalSQLiteUserDataStorageBackendConfigInfoTypographyProps extends IBaseUserDataStorageBackendConfigInfoTypographyProps {
  userDataStorageBackendConfigInfo: ILocalSQLiteUserDataStorageBackendConfigInfo;
}

const LocalSQLiteUserDataStorageBackendConfigInfoTypography: FC<ILocalSQLiteUserDataStorageBackendConfigInfoTypographyProps> = (
  props: ILocalSQLiteUserDataStorageBackendConfigInfoTypographyProps
) => {
  const { userDataStorageBackendConfigInfo } = props;
  return (
    <>
      <Typography>
        <b>{BASE_USER_DATA_STORAGE_BACKEND_CONFIG_INFO_JSON_SCHEMA_CONSTANTS.type.title}:</b> {USER_DATA_STORAGE_BACKEND_TYPE_NAMES.localSQLite}
      </Typography>
      <Typography>
        <b>{LOCAL_SQLITE_USER_DATA_STORAGE_BACKEND_JSON_SCHEMA_CONSTANTS.dbDirPath.title}:</b> <em>{userDataStorageBackendConfigInfo.dbDirPath}</em>
      </Typography>
      <Typography>
        <b>{LOCAL_SQLITE_USER_DATA_STORAGE_BACKEND_JSON_SCHEMA_CONSTANTS.dbFileName.title}:</b> <em>{userDataStorageBackendConfigInfo.dbFileName}</em>
      </Typography>
      <Typography>
        <b>{BASE_USER_DATA_STORAGE_BACKEND_CONFIG_INFO_JSON_SCHEMA_CONSTANTS.isLocal.title}:</b> Yes
      </Typography>
    </>
  );
};

export default LocalSQLiteUserDataStorageBackendConfigInfoTypography;
