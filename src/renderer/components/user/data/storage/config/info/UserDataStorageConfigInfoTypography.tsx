import { Box, Typography } from "@mui/material";
import { FC, useMemo } from "react";
import {
  IUserDataStorageConfigInfo,
  USER_DATA_STORAGE_CONFIG_INFO_JSON_SCHEMA_CONSTANTS
} from "@shared/user/data/storage/config/info/UserDataStorageConfigInfo";
import UserDataStorageBackendConfigInfoTypography from "../../backend/config/info/UserDataStorageBackendConfigInfoTypography";
import { ISignedInRootContext, useSignedInRootContext } from "@renderer/components/roots/signedInRoot/SignedInRootContext";
import { IUserDataStorageVisibilityGroupInfo } from "@shared/user/data/storage/visibilityGroup/info/UserDataStorageVisibilityGroupInfo";
import UserDataStorageVisibilityGroupInfoTypography from "../../visibilityGroup/info/UserDataStorageVisibilityGroupInfoTypography";
import { PUBLIC_USER_DATA_STORAGE_VISIBILITY_GROUP_CONSTANTS } from "@shared/user/data/storage/visibilityGroup/public/constants";

export interface IUserDataStorageConfigInfoTypographyProps {
  userDataStorageConfigInfo: IUserDataStorageConfigInfo;
  doShowId: boolean;
}

const UserDataStorageConfigInfoTypography: FC<IUserDataStorageConfigInfoTypographyProps> = (props: IUserDataStorageConfigInfoTypographyProps) => {
  const signedInRootContext: ISignedInRootContext = useSignedInRootContext();
  const { userDataStorageConfigInfo, doShowId } = props;
  const userDataStorageVisibilityGroupInfo = useMemo<IUserDataStorageVisibilityGroupInfo | null>((): IUserDataStorageVisibilityGroupInfo | null => {
    if (userDataStorageConfigInfo.visibilityGroupId === null) {
      return null;
    }
    return signedInRootContext.getOpenUserDataStorageVisibilityGroupInfoById(userDataStorageConfigInfo.visibilityGroupId); // TODO: Replace with Map.get
  }, [signedInRootContext, userDataStorageConfigInfo]);

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
        <b>{USER_DATA_STORAGE_CONFIG_INFO_JSON_SCHEMA_CONSTANTS.description.title}:</b> {userDataStorageConfigInfo.description}
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
        <b>{USER_DATA_STORAGE_CONFIG_INFO_JSON_SCHEMA_CONSTANTS.backend.title}:</b>
      </Typography>
      <Box sx={{ pl: "1rem" }}>
        <UserDataStorageBackendConfigInfoTypography userDataStorageBackendConfigInfo={userDataStorageConfigInfo.backend} />
      </Box>
    </>
  );
};

export default UserDataStorageConfigInfoTypography;
