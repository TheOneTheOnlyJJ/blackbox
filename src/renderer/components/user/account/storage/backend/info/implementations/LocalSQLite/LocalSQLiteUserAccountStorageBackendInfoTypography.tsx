import { FC } from "react";
import { IBaseUserAccountStorageBackendInfoTypographyProps } from "../../BaseUserAccountStorageBackendInfoTypography";
import { ILocalSQLiteUserAccountStorageBackendInfo } from "@shared/user/account/storage/backend/info/implementations/LocalSQLite/LocalSQLiteUserAccountStorageBackendInfo";
import { Typography } from "@mui/material";
import { BASE_USER_ACCOUNT_STORAGE_BACKEND_INFO_JSON_SCHEMA_CONSTANTS } from "@shared/user/account/storage/backend/info/BaseUserAccountStorageBackendInfo";
import { USER_ACCOUNT_STORAGE_BACKEND_TYPE_NAMES } from "@shared/user/account/storage/backend/UserAccountStorageBackendTypeName";
import { LOCAL_SQLITE_USER_ACCOUNT_STORAGE_BACKEND_JSON_SCHEMA_CONSTANTS } from "@shared/user/account/storage/backend/constants/implementations/LocalSQLite/LocalSQLiteUserAccountStorageBackendConstants";

export interface LocalSQLiteUserAccountStorageBackendInfoTypographyProps extends IBaseUserAccountStorageBackendInfoTypographyProps {
  userAccountStorageBackendInfo: ILocalSQLiteUserAccountStorageBackendInfo;
}

const LocalSQLiteUserAccountStorageBackendInfoTypography: FC<LocalSQLiteUserAccountStorageBackendInfoTypographyProps> = (
  props: LocalSQLiteUserAccountStorageBackendInfoTypographyProps
) => {
  const { userAccountStorageBackendInfo } = props;
  return (
    <>
      <Typography>
        <b>{BASE_USER_ACCOUNT_STORAGE_BACKEND_INFO_JSON_SCHEMA_CONSTANTS.type.title}:</b> {USER_ACCOUNT_STORAGE_BACKEND_TYPE_NAMES.localSQLite}
      </Typography>
      <Typography>
        <b>{LOCAL_SQLITE_USER_ACCOUNT_STORAGE_BACKEND_JSON_SCHEMA_CONSTANTS.dbDirPath.title}:</b> {userAccountStorageBackendInfo.dbDirPath}
      </Typography>
      <Typography>
        <b>{LOCAL_SQLITE_USER_ACCOUNT_STORAGE_BACKEND_JSON_SCHEMA_CONSTANTS.dbFileName.title}:</b> {userAccountStorageBackendInfo.dbFileName}
      </Typography>
      <Typography>
        <b>{BASE_USER_ACCOUNT_STORAGE_BACKEND_INFO_JSON_SCHEMA_CONSTANTS.isLocal.title}:</b> {userAccountStorageBackendInfo.isLocal ? "Yes" : "No"}
      </Typography>
      <Typography>
        <b>{BASE_USER_ACCOUNT_STORAGE_BACKEND_INFO_JSON_SCHEMA_CONSTANTS.isOpen.title}:</b> {userAccountStorageBackendInfo.isOpen ? "Yes" : "No"}
      </Typography>
    </>
  );
};

export default LocalSQLiteUserAccountStorageBackendInfoTypography;
