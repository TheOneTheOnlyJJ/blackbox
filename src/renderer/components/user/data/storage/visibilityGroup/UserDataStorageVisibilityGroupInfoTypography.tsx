import { Typography } from "@mui/material";
import {
  IUserDataStorageVisibilityGroupInfo,
  USER_DATA_STORAGE_VISIBILITY_GROUP_INFO_JSON_SCHEMA_CONSTANTS
} from "@shared/user/data/storage/visibilityGroup/info/UserDataStorageVisibilityGroupInfo";
import { FC } from "react";

export interface IUserDataStorageVisibilityGroupInfoTypographyProps {
  userDataStorageVisibilityGroupInfo: IUserDataStorageVisibilityGroupInfo;
  doShowId: boolean;
}

const UserDataStorageVisibilityGroupInfoTypography: FC<IUserDataStorageVisibilityGroupInfoTypographyProps> = (
  props: IUserDataStorageVisibilityGroupInfoTypographyProps
) => {
  const { userDataStorageVisibilityGroupInfo, doShowId } = props;

  return (
    <>
      {doShowId && (
        <Typography>
          <b>{USER_DATA_STORAGE_VISIBILITY_GROUP_INFO_JSON_SCHEMA_CONSTANTS.visibilityGroupId.title}:</b>{" "}
          {userDataStorageVisibilityGroupInfo.visibilityGroupId}
        </Typography>
      )}
      <Typography>
        <b>{USER_DATA_STORAGE_VISIBILITY_GROUP_INFO_JSON_SCHEMA_CONSTANTS.name.title}:</b> {userDataStorageVisibilityGroupInfo.name}
      </Typography>
      <Typography>
        <b>{USER_DATA_STORAGE_VISIBILITY_GROUP_INFO_JSON_SCHEMA_CONSTANTS.description.title}:</b>{" "}
        {userDataStorageVisibilityGroupInfo.description ?? <em>None</em>}
      </Typography>
    </>
  );
};

export default UserDataStorageVisibilityGroupInfoTypography;
