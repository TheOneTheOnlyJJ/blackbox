import { Box, Typography } from "@mui/material";
import { IUserAccountStorageInfo } from "@shared/user/account/storage/info/UserAccountStorageInfo";
import { FC } from "react";
import UserAccountStorageBackendInfoTypography from "../backend/info/UserAccountStorageBackendInfoTypography";

export interface IUserAccountStorageInfoTypographyProps {
  userAccountStorageInfo: IUserAccountStorageInfo;
}

const UserAccountStorageInfoTypography: FC<IUserAccountStorageInfoTypographyProps> = (props: IUserAccountStorageInfoTypographyProps) => {
  const { userAccountStorageInfo } = props;

  return (
    <>
      <Typography>
        <b>Name:</b> {userAccountStorageInfo.name}
      </Typography>
      <Typography>
        <b>Backend:</b>
      </Typography>
      <Box sx={{ textIndent: "1rem" }}>
        <UserAccountStorageBackendInfoTypography userAccountStorageBackendInfo={userAccountStorageInfo.backend} />
      </Box>
    </>
  );
};

export default UserAccountStorageInfoTypography;
