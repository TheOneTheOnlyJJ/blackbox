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
        <b>{LOCAL_SQLITE_USER_ACCOUNT_STORAGE_BACKEND_JSON_SCHEMA_CONSTANTS.dbDirPath.title}:</b> <em>{userAccountStorageBackendInfo.dbDirPath}</em>
      </Typography>
      <Typography>
        <b>{LOCAL_SQLITE_USER_ACCOUNT_STORAGE_BACKEND_JSON_SCHEMA_CONSTANTS.dbFileName.title}:</b> <em>{userAccountStorageBackendInfo.dbFileName}</em>
      </Typography>
      <Typography>
        <b>Local:</b> {userAccountStorageBackendInfo.isLocal ? "Yes" : "No"}
      </Typography>
      <Typography>
        <b>Open:</b>{" "}
        {userAccountStorageBackendInfo.isOpen ? (
          <Typography color="success" component="span">
            Yes
          </Typography>
        ) : (
          <Typography color="error" component="span">
            No
          </Typography>
        )}
      </Typography>
    </>
  );
};

export default LocalSQLiteUserAccountStorageBackendInfoTypography;
