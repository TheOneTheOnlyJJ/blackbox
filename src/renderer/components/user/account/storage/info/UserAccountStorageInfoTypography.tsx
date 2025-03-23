import { Box, Typography } from "@mui/material";
import { IUserAccountStorageInfo, USER_ACCOUNT_STORAGE_INFO_JSON_SCHEMA_CONSTANTS } from "@shared/user/account/storage/info/UserAccountStorageInfo";
import { FC } from "react";
import UserAccountStorageBackendInfoTypography from "../backend/info/UserAccountStorageBackendInfoTypography";

export interface IUserAccountStorageInfoTypographyProps {
  userAccountStorageInfo: IUserAccountStorageInfo;
  doShowId: boolean;
}

const UserAccountStorageInfoTypography: FC<IUserAccountStorageInfoTypographyProps> = (props: IUserAccountStorageInfoTypographyProps) => {
  const { userAccountStorageInfo, doShowId } = props;

  return (
    <>
      {doShowId && (
        <Typography>
          <b>{USER_ACCOUNT_STORAGE_INFO_JSON_SCHEMA_CONSTANTS.storageId.title}:</b> {userAccountStorageInfo.storageId}
        </Typography>
      )}
      <Typography>
        <b>{USER_ACCOUNT_STORAGE_INFO_JSON_SCHEMA_CONSTANTS.name.title}:</b> {userAccountStorageInfo.name}
      </Typography>
      <Typography>
        <b>{USER_ACCOUNT_STORAGE_INFO_JSON_SCHEMA_CONSTANTS.backend.title}:</b>
      </Typography>
      <Box sx={{ textIndent: "1rem" }}>
        <UserAccountStorageBackendInfoTypography userAccountStorageBackendInfo={userAccountStorageInfo.backend} />
      </Box>
    </>
  );
};

export default UserAccountStorageInfoTypography;
