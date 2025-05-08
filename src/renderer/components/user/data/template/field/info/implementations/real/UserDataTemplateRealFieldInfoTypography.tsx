import { FC } from "react";
import { IBaseUserDataTemplateFieldInfoTypographyProps } from "../../BaseUserDataTemplateFieldInfoTypography";
import {
  IUserDataTemplateRealFieldInfo,
  USER_DATA_TEMPLATE_REAL_FIELD_INFO_JSON_SCHEMA_CONSTANTS
} from "@shared/user/data/template/field/info/implementations/real/UserDataTemplateRealFieldInfo";
import NullableUserDataTemplateRealFieldNumericThresholdInfoTypography from "./NullableUserDataTemplateRealFieldNumericThresholdInfoTypography";
import UserDataTemplateFieldInfoPropertyTypography from "../../UserDataTemplateFieldInfoPropertyTypography";

export interface IUserDataTemplateRealFieldInfoTypographyProps extends IBaseUserDataTemplateFieldInfoTypographyProps {
  userDataTemplateFieldInfo: IUserDataTemplateRealFieldInfo;
}

const UserDataTemplateRealFieldInfoTypography: FC<IUserDataTemplateRealFieldInfoTypographyProps> = (
  props: IUserDataTemplateRealFieldInfoTypographyProps
) => {
  const { userDataTemplateFieldInfo, doDisplayNullFieldProperties } = props;

  return (
    <>
      <NullableUserDataTemplateRealFieldNumericThresholdInfoTypography
        title={USER_DATA_TEMPLATE_REAL_FIELD_INFO_JSON_SCHEMA_CONSTANTS.minimum.title}
        nullableThresholdInfo={userDataTemplateFieldInfo.minimum}
        nullThresholdValue="None"
        doDisplayNullProperties={doDisplayNullFieldProperties}
      />
      <NullableUserDataTemplateRealFieldNumericThresholdInfoTypography
        title={USER_DATA_TEMPLATE_REAL_FIELD_INFO_JSON_SCHEMA_CONSTANTS.maximum.title}
        nullableThresholdInfo={userDataTemplateFieldInfo.maximum}
        nullThresholdValue="None"
        doDisplayNullProperties={doDisplayNullFieldProperties}
      />
      <UserDataTemplateFieldInfoPropertyTypography
        propertyName={USER_DATA_TEMPLATE_REAL_FIELD_INFO_JSON_SCHEMA_CONSTANTS.multipleOf.title}
        propertyValue={userDataTemplateFieldInfo.multipleOf}
        doDisplayNullProperties={doDisplayNullFieldProperties}
      />
      <UserDataTemplateFieldInfoPropertyTypography
        propertyName={USER_DATA_TEMPLATE_REAL_FIELD_INFO_JSON_SCHEMA_CONSTANTS.default.title}
        propertyValue={userDataTemplateFieldInfo.default}
        doDisplayNullProperties={doDisplayNullFieldProperties}
      />
    </>
  );
};

export default UserDataTemplateRealFieldInfoTypography;
