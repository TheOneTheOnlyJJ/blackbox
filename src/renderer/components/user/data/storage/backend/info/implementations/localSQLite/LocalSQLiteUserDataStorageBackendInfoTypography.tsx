import { FC } from "react";
import { Typography } from "@mui/material";
import { IBaseUserDataStorageBackendInfoTypographyProps } from "../../BaseUserDataStorageBackendInfoTypography";
import { ILocalSQLiteUserDataStorageBackendInfo } from "@shared/user/data/storage/backend/info/implementations/localSQLite/LocalSQLiteUserDataStorageBackendInfo";
import { BASE_USER_DATA_STORAGE_BACKEND_INFO_JSON_SCHEMA_CONSTANTS } from "@shared/user/data/storage/backend/info/BaseUserDataStorageBackendInfo";
import { USER_DATA_STORAGE_BACKEND_TYPE_NAMES } from "@shared/user/data/storage/backend/UserDataStorageBackendTypeName";
import { LOCAL_SQLITE_USER_DATA_STORAGE_BACKEND_JSON_SCHEMA_CONSTANTS } from "@shared/user/data/storage/backend/constants/implementations/localSQLite/LocalSQLiteUserDataStorageBackendConstants";

export interface ILocalSQLiteUserDataStorageBackendInfoTypographyProps extends IBaseUserDataStorageBackendInfoTypographyProps {
  userDataStorageBackendInfo: ILocalSQLiteUserDataStorageBackendInfo;
}

const LocalSQLiteUserDataStorageBackendInfoTypography: FC<ILocalSQLiteUserDataStorageBackendInfoTypographyProps> = (
  props: ILocalSQLiteUserDataStorageBackendInfoTypographyProps
) => {
  const { userDataStorageBackendInfo } = props;
  return (
    <>
      <Typography>
        <b>{BASE_USER_DATA_STORAGE_BACKEND_INFO_JSON_SCHEMA_CONSTANTS.type.title}:</b> {USER_DATA_STORAGE_BACKEND_TYPE_NAMES.localSQLite}
      </Typography>
      <Typography>
        <b>{LOCAL_SQLITE_USER_DATA_STORAGE_BACKEND_JSON_SCHEMA_CONSTANTS.dbDirPath.title}:</b> <em>{userDataStorageBackendInfo.dbDirPath}</em>
      </Typography>
      <Typography>
        <b>{LOCAL_SQLITE_USER_DATA_STORAGE_BACKEND_JSON_SCHEMA_CONSTANTS.dbFileName.title}:</b> <em>{userDataStorageBackendInfo.dbFileName}</em>
      </Typography>
      <Typography>
        <b>{BASE_USER_DATA_STORAGE_BACKEND_INFO_JSON_SCHEMA_CONSTANTS.isLocal.title}:</b> Yes
      </Typography>
      <Typography>
        <b>{BASE_USER_DATA_STORAGE_BACKEND_INFO_JSON_SCHEMA_CONSTANTS.isOpen.title}:</b> {userDataStorageBackendInfo.isOpen ? "Yes" : "No"}
      </Typography>
    </>
  );
};

export default LocalSQLiteUserDataStorageBackendInfoTypography;
