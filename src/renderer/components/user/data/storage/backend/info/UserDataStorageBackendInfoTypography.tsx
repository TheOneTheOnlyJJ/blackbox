import { FC } from "react";
import { UserDataStorageBackendInfo } from "@shared/user/data/storage/backend/info/UserDataStorageBackendInfo";
import { USER_DATA_STORAGE_BACKEND_TYPES } from "@shared/user/data/storage/backend/UserDataStorageBackendType";
import LocalSQLiteUserDataStorageBackendInfoTypography from "./implementations/localSQLite/LocalSQLiteUserDataStorageBackendInfoTypography";
import OptionBUserDataStorageBackendInfoTypography from "./implementations/optionB/OptionBUserDataStorageBackendInfoTypography";
import OptionCUserDataStorageBackendInfoTypography from "./implementations/optionC/OptionCUserDataStorageBackendInfoTypography";

export interface IUserDataStorageBackendInfoTypographyProps {
  userDataStorageBackendInfo: UserDataStorageBackendInfo;
}

const UserDataStorageBackendInfoTypography: FC<IUserDataStorageBackendInfoTypographyProps> = (props: IUserDataStorageBackendInfoTypographyProps) => {
  const { userDataStorageBackendInfo } = props;
  switch (userDataStorageBackendInfo.type) {
    case USER_DATA_STORAGE_BACKEND_TYPES.localSQLite:
      return <LocalSQLiteUserDataStorageBackendInfoTypography userDataStorageBackendInfo={userDataStorageBackendInfo} />;
    case USER_DATA_STORAGE_BACKEND_TYPES.optionB:
      return <OptionBUserDataStorageBackendInfoTypography userDataStorageBackendInfo={userDataStorageBackendInfo} />;
    case USER_DATA_STORAGE_BACKEND_TYPES.optionC:
      return <OptionCUserDataStorageBackendInfoTypography userDataStorageBackendInfo={userDataStorageBackendInfo} />;
    default:
      throw new Error(`Invalid User Data Storage Backend type received: ${String(userDataStorageBackendInfo)}`);
  }
};

export default UserDataStorageBackendInfoTypography;
