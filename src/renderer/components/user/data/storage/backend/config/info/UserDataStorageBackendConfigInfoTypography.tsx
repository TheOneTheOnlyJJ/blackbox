import { FC } from "react";
import { USER_DATA_STORAGE_BACKEND_TYPES } from "@shared/user/data/storage/backend/UserDataStorageBackendType";
import { UserDataStorageBackendConfigInfo } from "@shared/user/data/storage/backend/config/info/UserDataStorageBackendConfigInfo";
import LocalSQLiteUserDataStorageBackendConfigInfoTypography from "./implementations/localSQLite/LocalSQLiteUserDataStorageBackendConfigInfoTypography";
import OptionBUserDataStorageBackendConfigInfoTypography from "./implementations/optionB/OptionBUserDataStorageBackendConfigInfoTypography";
import OptionCUserDataStorageBackendConfigInfoTypography from "./implementations/optionC/OptionCUserDataStorageBackendConfigInfoTypography";

export interface IUserDataStorageBackendConfigInfoTypographyProps {
  userDataStorageBackendConfigInfo: UserDataStorageBackendConfigInfo;
}

const UserDataStorageBackendConfigInfoTypography: FC<IUserDataStorageBackendConfigInfoTypographyProps> = (
  props: IUserDataStorageBackendConfigInfoTypographyProps
) => {
  const { userDataStorageBackendConfigInfo } = props;
  switch (userDataStorageBackendConfigInfo.type) {
    case USER_DATA_STORAGE_BACKEND_TYPES.localSQLite:
      return <LocalSQLiteUserDataStorageBackendConfigInfoTypography userDataStorageBackendConfigInfo={userDataStorageBackendConfigInfo} />;
    case USER_DATA_STORAGE_BACKEND_TYPES.optionB:
      return <OptionBUserDataStorageBackendConfigInfoTypography userDataStorageBackendConfigInfo={userDataStorageBackendConfigInfo} />;
    case USER_DATA_STORAGE_BACKEND_TYPES.optionC:
      return <OptionCUserDataStorageBackendConfigInfoTypography userDataStorageBackendConfigInfo={userDataStorageBackendConfigInfo} />;
    default:
      throw new Error(`Invalid User Data Storage Backend Config type received: ${String(userDataStorageBackendConfigInfo)}`);
  }
};

export default UserDataStorageBackendConfigInfoTypography;
