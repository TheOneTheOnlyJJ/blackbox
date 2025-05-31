import { Box, Typography } from "@mui/material";
import { BASE_USER_DATA_TEMPLATE_FIELD_INFO_JSON_SCHEMA_PROPERTIES } from "@shared/user/data/template/field/info/BaseUserDataTemplateFieldInfo";
import { UserDataTemplateFieldInfo } from "@shared/user/data/template/field/info/UserDataTemplateFieldInfo";
import { USER_DATA_TEMPLATE_FIELD_TYPES } from "@shared/user/data/template/field/UserDataTemplateFieldType";
import { USER_DATA_TEMPLATE_FIELD_TYPE_NAMES } from "@shared/user/data/template/field/UserDataTemplateFieldTypeName";
import { FC, useMemo } from "react";
import UserDataTemplateIntegerFieldInfoTypography from "./implementations/integer/UserDataTemplateIntegerFieldInfoTypography";
import UserDataTemplateRealFieldInfoTypography from "./implementations/real/UserDataTemplateRealFieldInfoTypography";
import UserDataTemplateTextFieldInfoTypography from "./implementations/text/UserDataTemplateTextFieldInfoTypography";
import UserDataTemplateFieldInfoPropertyTypography from "./UserDataTemplateFieldInfoPropertyTypography";

export interface IUserDataTemplateFieldInfoTypographyProps {
  userDataTemplateFieldInfo: UserDataTemplateFieldInfo;
  doDisplayNullFieldProperties: boolean;
  displayIndex: number;
}

const UserDataTemplateFieldInfoTypography: FC<IUserDataTemplateFieldInfoTypographyProps> = (props: IUserDataTemplateFieldInfoTypographyProps) => {
  const { userDataTemplateFieldInfo, doDisplayNullFieldProperties, displayIndex } = props;

  const fieldImplementationInfoTypography = useMemo<React.JSX.Element>((): React.JSX.Element => {
    switch (userDataTemplateFieldInfo.type) {
      case USER_DATA_TEMPLATE_FIELD_TYPES.integer:
        return (
          <UserDataTemplateIntegerFieldInfoTypography
            userDataTemplateFieldInfo={userDataTemplateFieldInfo}
            doDisplayNullFieldProperties={doDisplayNullFieldProperties}
          />
        );
      case USER_DATA_TEMPLATE_FIELD_TYPES.real:
        return (
          <UserDataTemplateRealFieldInfoTypography
            userDataTemplateFieldInfo={userDataTemplateFieldInfo}
            doDisplayNullFieldProperties={doDisplayNullFieldProperties}
          />
        );
      case USER_DATA_TEMPLATE_FIELD_TYPES.text:
        return (
          <UserDataTemplateTextFieldInfoTypography
            userDataTemplateFieldInfo={userDataTemplateFieldInfo}
            doDisplayNullFieldProperties={doDisplayNullFieldProperties}
          />
        );
      default:
        throw new Error(`Invalid User Data Template Field Info type received: ${String(userDataTemplateFieldInfo)}`);
    }
  }, [userDataTemplateFieldInfo, doDisplayNullFieldProperties]);

  return (
    <>
      {/* <Typography>
        <b>{BASE_USER_DATA_TEMPLATE_FIELD_INFO_JSON_SCHEMA_PROPERTIES.name.title}:</b> {userDataTemplateFieldInfo.name}
      </Typography>
      <Typography>
        <b>{BASE_USER_DATA_TEMPLATE_FIELD_INFO_JSON_SCHEMA_PROPERTIES.type.title}:</b>{" "}
        {USER_DATA_TEMPLATE_FIELD_TYPE_NAMES[userDataTemplateFieldInfo.type]}
      </Typography> */}
      <Typography>
        <b>
          {displayIndex}. {userDataTemplateFieldInfo.name}
          {userDataTemplateFieldInfo.isRequired ? "*" : null} ({USER_DATA_TEMPLATE_FIELD_TYPE_NAMES[userDataTemplateFieldInfo.type]})
        </b>
      </Typography>
      <Box sx={{ pl: "1rem" }}>
        <UserDataTemplateFieldInfoPropertyTypography
          propertyName={BASE_USER_DATA_TEMPLATE_FIELD_INFO_JSON_SCHEMA_PROPERTIES.description.title}
          propertyValue={userDataTemplateFieldInfo.description}
          doDisplayNullProperties={doDisplayNullFieldProperties}
        />
        {fieldImplementationInfoTypography}
      </Box>
    </>
  );
};

export default UserDataTemplateFieldInfoTypography;
