import { Box, Typography } from "@mui/material";
import { IUserDataStorageInfo, USER_DATA_STORAGE_INFO_JSON_SCHEMA_CONSTANTS } from "@shared/user/data/storage/info/UserDataStorageInfo";
import { FC, useMemo } from "react";
import UserDataStorageBackendInfoTypography from "../backend/info/UserDataStorageBackendInfoTypography";
import { ISignedInRootContext, useSignedInRootContext } from "@renderer/components/roots/signedInRoot/SignedInRootContext";
import { USER_DATA_STORAGE_CONFIG_INFO_JSON_SCHEMA_CONSTANTS } from "@shared/user/data/storage/config/info/UserDataStorageConfigInfo";
import { IUserDataStorageVisibilityGroupInfo } from "@shared/user/data/storage/visibilityGroup/info/UserDataStorageVisibilityGroupInfo";
import UserDataStorageVisibilityGroupInfoTypography from "../visibilityGroup/info/UserDataStorageVisibilityGroupInfoTypography";
import { PUBLIC_USER_DATA_STORAGE_VISIBILITY_GROUP_CONSTANTS } from "@shared/user/data/storage/visibilityGroup/public/constants";

export interface IUserDataStorageInfoTypographyProps {
  userDataStorageInfo: IUserDataStorageInfo;
  doShowId: boolean;
}

const UserDataStorageInfoTypography: FC<IUserDataStorageInfoTypographyProps> = (props: IUserDataStorageInfoTypographyProps) => {
  const signedInRootContext: ISignedInRootContext = useSignedInRootContext();
  const { userDataStorageInfo, doShowId } = props;
  const userDataStorageVisibilityGroupInfo = useMemo<IUserDataStorageVisibilityGroupInfo | null>((): IUserDataStorageVisibilityGroupInfo | null => {
    if (userDataStorageInfo.visibilityGroupId === null) {
      return null;
    }
    return signedInRootContext.getOpenUserDataStorageVisibilityGroupInfoById(userDataStorageInfo.visibilityGroupId); // TODO: Replace with Map.get
  }, [signedInRootContext, userDataStorageInfo]);

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
        <b>{USER_DATA_STORAGE_INFO_JSON_SCHEMA_CONSTANTS.description.title}:</b> {userDataStorageInfo.description}
      </Typography>
      {userDataStorageVisibilityGroupInfo === null ? (
        <Typography>
          <b>{USER_DATA_STORAGE_CONFIG_INFO_JSON_SCHEMA_CONSTANTS.visibilityGroupId.title}:</b>{" "}
          <em>{PUBLIC_USER_DATA_STORAGE_VISIBILITY_GROUP_CONSTANTS.name}</em>
        </Typography>
      ) : (
        <>
          <Typography>
            <b>{USER_DATA_STORAGE_CONFIG_INFO_JSON_SCHEMA_CONSTANTS.visibilityGroupId.title}:</b>
          </Typography>
          <Box sx={{ pl: "1rem" }}>
            <UserDataStorageVisibilityGroupInfoTypography userDataStorageVisibilityGroupInfo={userDataStorageVisibilityGroupInfo} doShowId={true} />
          </Box>
        </>
      )}
      <Typography>
        <b>{USER_DATA_STORAGE_INFO_JSON_SCHEMA_CONSTANTS.backend.title}:</b>
      </Typography>
      <Box sx={{ pl: "1rem" }}>
        <UserDataStorageBackendInfoTypography userDataStorageBackendInfo={userDataStorageInfo.backend} />
      </Box>
    </>
  );
};

export default UserDataStorageInfoTypography;
