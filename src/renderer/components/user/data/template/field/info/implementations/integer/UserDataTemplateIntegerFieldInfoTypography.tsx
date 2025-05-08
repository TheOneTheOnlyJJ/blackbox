import { FC } from "react";
import { IBaseUserDataTemplateFieldInfoTypographyProps } from "../../BaseUserDataTemplateFieldInfoTypography";
import {
  IUserDataTemplateIntegerFieldInfo,
  USER_DATA_TEMPLATE_INTEGER_FIELD_INFO_JSON_SCHEMA_CONSTANTS
} from "@shared/user/data/template/field/info/implementations/integer/UserDataTemplateIntegerFieldInfo";
import NullableUserDataTemplateIntegerFieldNumericThresholdInfoTypography from "./NullableUserDataTemplateIntegerFieldNumericThresholdInfoTypography";
import UserDataTemplateFieldInfoPropertyTypography from "../../UserDataTemplateFieldInfoPropertyTypography";

export interface IUserDataTemplateIntegerFieldInfoTypographyProps extends IBaseUserDataTemplateFieldInfoTypographyProps {
  userDataTemplateFieldInfo: IUserDataTemplateIntegerFieldInfo;
}

const UserDataTemplateIntegerFieldInfoTypography: FC<IUserDataTemplateIntegerFieldInfoTypographyProps> = (
  props: IUserDataTemplateIntegerFieldInfoTypographyProps
) => {
  const { userDataTemplateFieldInfo, doDisplayNullFieldProperties } = props;

  return (
    <>
      <NullableUserDataTemplateIntegerFieldNumericThresholdInfoTypography
        title={USER_DATA_TEMPLATE_INTEGER_FIELD_INFO_JSON_SCHEMA_CONSTANTS.minimum.title}
        nullableThresholdInfo={userDataTemplateFieldInfo.minimum}
        nullThresholdValue="None"
        doDisplayNullProperties={doDisplayNullFieldProperties}
      />
      <NullableUserDataTemplateIntegerFieldNumericThresholdInfoTypography
        title={USER_DATA_TEMPLATE_INTEGER_FIELD_INFO_JSON_SCHEMA_CONSTANTS.maximum.title}
        nullableThresholdInfo={userDataTemplateFieldInfo.maximum}
        nullThresholdValue="None"
        doDisplayNullProperties={doDisplayNullFieldProperties}
      />
      <UserDataTemplateFieldInfoPropertyTypography
        propertyName={USER_DATA_TEMPLATE_INTEGER_FIELD_INFO_JSON_SCHEMA_CONSTANTS.multipleOf.title}
        propertyValue={userDataTemplateFieldInfo.multipleOf}
        doDisplayNullProperties={doDisplayNullFieldProperties}
      />
      <UserDataTemplateFieldInfoPropertyTypography
        propertyName={USER_DATA_TEMPLATE_INTEGER_FIELD_INFO_JSON_SCHEMA_CONSTANTS.default.title}
        propertyValue={userDataTemplateFieldInfo.default}
        doDisplayNullProperties={doDisplayNullFieldProperties}
      />
    </>
  );
};

export default UserDataTemplateIntegerFieldInfoTypography;
