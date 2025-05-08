import { FC } from "react";
import { IBaseUserDataTemplateFieldInfoTypographyProps } from "../../BaseUserDataTemplateFieldInfoTypography";
import {
  IUserDataTemplateTextFieldInfo,
  USER_DATA_TEMPLATE_TEXT_FIELD_INFO_JSON_SCHEMA_CONSTANTS
} from "@shared/user/data/template/field/info/implementations/text/UserDataTemplateTextFieldInfo";
import UserDataTemplateFieldInfoPropertyTypography from "../../UserDataTemplateFieldInfoPropertyTypography";

export interface IUserDataTemplateTextFieldInfoTypographyProps extends IBaseUserDataTemplateFieldInfoTypographyProps {
  userDataTemplateFieldInfo: IUserDataTemplateTextFieldInfo;
}

const UserDataTemplateTextFieldInfoTypography: FC<IUserDataTemplateTextFieldInfoTypographyProps> = (
  props: IUserDataTemplateTextFieldInfoTypographyProps
) => {
  const { userDataTemplateFieldInfo, doDisplayNullFieldProperties } = props;

  return (
    <>
      <UserDataTemplateFieldInfoPropertyTypography
        propertyName={USER_DATA_TEMPLATE_TEXT_FIELD_INFO_JSON_SCHEMA_CONSTANTS.useTextBox.title}
        propertyValue={userDataTemplateFieldInfo.useTextBox ? "Yes" : "No"}
        doDisplayNullProperties={doDisplayNullFieldProperties}
      />
      <UserDataTemplateFieldInfoPropertyTypography
        propertyName={USER_DATA_TEMPLATE_TEXT_FIELD_INFO_JSON_SCHEMA_CONSTANTS.default.title}
        propertyValue={userDataTemplateFieldInfo.default}
        doDisplayNullProperties={doDisplayNullFieldProperties}
      />
    </>
  );
};

export default UserDataTemplateTextFieldInfoTypography;
