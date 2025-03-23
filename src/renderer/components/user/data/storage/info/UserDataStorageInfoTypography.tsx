import { Box, Typography } from "@mui/material";
import { IUserDataStorageInfo, USER_DATA_STORAGE_INFO_JSON_SCHEMA_CONSTANTS } from "@shared/user/data/storage/info/UserDataStorageInfo";
import { FC } from "react";
import UserDataStorageBackendInfoTypography from "../backend/info/UserDataStorageBackendInfoTypography";

export interface IUserDataStorageInfoTypographyProps {
  userDataStorageInfo: IUserDataStorageInfo;
  doShowId: boolean;
}

const UserDataStorageInfoTypography: FC<IUserDataStorageInfoTypographyProps> = (props: IUserDataStorageInfoTypographyProps) => {
  const { userDataStorageInfo, doShowId } = props;

  return (
    <>
      {doShowId && (
        <Typography>
          <b>{USER_DATA_STORAGE_INFO_JSON_SCHEMA_CONSTANTS.storageId.title}:</b> {userDataStorageInfo.storageId}
        </Typography>
      )}
      <Typography>
        <b>{USER_DATA_STORAGE_INFO_JSON_SCHEMA_CONSTANTS.name.title}:</b> {userDataStorageInfo.name}
      </Typography>
      <Typography>
        <b>{USER_DATA_STORAGE_INFO_JSON_SCHEMA_CONSTANTS.backend.title}:</b>
      </Typography>
      <Box sx={{ textIndent: "1rem" }}>
        <UserDataStorageBackendInfoTypography userDataStorageBackendInfo={userDataStorageInfo.backend} />
      </Box>
    </>
  );
};

export default UserDataStorageInfoTypography;
