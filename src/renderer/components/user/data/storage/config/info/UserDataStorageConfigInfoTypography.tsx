import { Box, Typography } from "@mui/material";
import { FC } from "react";
import {
  IUserDataStorageConfigInfo,
  USER_DATA_STORAGE_CONFIG_INFO_JSON_SCHEMA_CONSTANTS
} from "@shared/user/data/storage/config/info/UserDataStorageConfigInfo";
import UserDataStorageBackendConfigInfoTypography from "../../backend/config/info/UserDataStorageBackendConfigInfoTypography";

export interface IUserDataStorageConfigInfoTypographyProps {
  userDataStorageConfigInfo: IUserDataStorageConfigInfo;
  doShowId: boolean;
}

const UserDataStorageConfigInfoTypography: FC<IUserDataStorageConfigInfoTypographyProps> = (props: IUserDataStorageConfigInfoTypographyProps) => {
  const { userDataStorageConfigInfo, doShowId } = props;

  return (
    <>
      {doShowId && (
        <Typography>
          <b>{USER_DATA_STORAGE_CONFIG_INFO_JSON_SCHEMA_CONSTANTS.storageId.title}:</b> {userDataStorageConfigInfo.storageId}
        </Typography>
      )}
      <Typography>
        <b>{USER_DATA_STORAGE_CONFIG_INFO_JSON_SCHEMA_CONSTANTS.name.title}:</b> {userDataStorageConfigInfo.name}
      </Typography>
      <Typography>
        <b>{USER_DATA_STORAGE_CONFIG_INFO_JSON_SCHEMA_CONSTANTS.backend.title}:</b>
      </Typography>
      <Box sx={{ textIndent: "1rem" }}>
        <UserDataStorageBackendConfigInfoTypography userDataStorageBackendConfigInfo={userDataStorageConfigInfo.backend} />
      </Box>
    </>
  );
};

export default UserDataStorageConfigInfoTypography;
