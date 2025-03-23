import { UserAccountStorageBackendInfo } from "@shared/user/account/storage/backend/info/UserAccountStorageBackendInfo";
import { USER_ACCOUNT_STORAGE_BACKEND_TYPES } from "@shared/user/account/storage/backend/UserAccountStorageBackendType";
import { FC } from "react";
import LocalSQLiteUserAccountStorageBackendInfoTypography from "./implementations/localSQLite/LocalSQLiteUserAccountStorageBackendInfoTypography";

export interface IUserAccountStorageBackendInfoTypographyProps {
  userAccountStorageBackendInfo: UserAccountStorageBackendInfo;
}

const UserAccountStorageBackendInfoTypography: FC<IUserAccountStorageBackendInfoTypographyProps> = (
  props: IUserAccountStorageBackendInfoTypographyProps
) => {
  const { userAccountStorageBackendInfo } = props;
  switch (userAccountStorageBackendInfo.type) {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    case USER_ACCOUNT_STORAGE_BACKEND_TYPES.localSQLite:
      return <LocalSQLiteUserAccountStorageBackendInfoTypography userAccountStorageBackendInfo={userAccountStorageBackendInfo} />;
    default:
      throw new Error(`Invalid User Account Storage backend type received: ${String(userAccountStorageBackendInfo.type)}`);
  }
};

export default UserAccountStorageBackendInfoTypography;
