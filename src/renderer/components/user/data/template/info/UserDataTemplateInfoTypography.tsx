import { Divider, Typography } from "@mui/material";
import { UserDataTemplateFieldInfo } from "@shared/user/data/template/field/info/UserDataTemplateFieldInfo";
import { IUserDataTemplateInfo, USER_DATA_TEMPLATE_INFO_JSON_SCHEMA_CONSTANTS } from "@shared/user/data/template/info/UserDataTemplateInfo";
import { FC, useMemo } from "react";
import UserDataTemplateFieldInfoTypography from "../field/info/UserDataTemplateFieldInfoTypography";

export interface IUserDataTemplateInfoTypographyProps {
  userDataTemplateInfo: IUserDataTemplateInfo;
  doShowId: boolean;
  doDisplayNullFieldProperties: boolean;
}

const UserDataTemplateInfoTypography: FC<IUserDataTemplateInfoTypographyProps> = (props: IUserDataTemplateInfoTypographyProps) => {
  const { userDataTemplateInfo, doShowId, doDisplayNullFieldProperties } = props;
  const userDataTemplateInfoFieldsLength = useMemo<number>((): number => {
    return userDataTemplateInfo.fields.length;
  }, [userDataTemplateInfo]);

  return (
    <>
      {doShowId && (
        <Typography>
          <b>{USER_DATA_TEMPLATE_INFO_JSON_SCHEMA_CONSTANTS.templateId.title}:</b> {userDataTemplateInfo.templateId}
        </Typography>
      )}
      {/* // TODO: Get name or entire info object dynamically */}
      <Typography>
        <b>{USER_DATA_TEMPLATE_INFO_JSON_SCHEMA_CONSTANTS.storageId.title}:</b> {userDataTemplateInfo.storageId}
      </Typography>
      {/* // TODO: Get name or entire info object dynamically */}
      <Typography>
        <b>{USER_DATA_TEMPLATE_INFO_JSON_SCHEMA_CONSTANTS.boxId.title}:</b> {userDataTemplateInfo.boxId}
      </Typography>
      <Typography>
        <b>{USER_DATA_TEMPLATE_INFO_JSON_SCHEMA_CONSTANTS.name.title}:</b> {userDataTemplateInfo.name}
      </Typography>
      <Typography>
        <b>{USER_DATA_TEMPLATE_INFO_JSON_SCHEMA_CONSTANTS.description.title}:</b> {userDataTemplateInfo.description ?? <em>None</em>}
      </Typography>
      <Typography>
        <b>{USER_DATA_TEMPLATE_INFO_JSON_SCHEMA_CONSTANTS.fields.title}:</b>
      </Typography>

      {userDataTemplateInfo.fields.map((userDataTemplateFieldInfo: UserDataTemplateFieldInfo, idx: number): React.JSX.Element => {
        const IDX_PLUS_1: number = idx + 1;
        return (
          <>
            <UserDataTemplateFieldInfoTypography
              key={idx}
              userDataTemplateFieldInfo={userDataTemplateFieldInfo}
              doDisplayNullFieldProperties={doDisplayNullFieldProperties}
              displayIndex={IDX_PLUS_1}
            />
            {IDX_PLUS_1 < userDataTemplateInfoFieldsLength ? <Divider sx={{ my: "5px" }} /> : null}
          </>
        );
      })}
    </>
  );
};

export default UserDataTemplateInfoTypography;
