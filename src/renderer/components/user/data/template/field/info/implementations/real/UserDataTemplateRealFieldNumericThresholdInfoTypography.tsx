import { Typography } from "@mui/material";
import {
  IUserDataTemplateRealFieldNumericThresholdInfo,
  USER_DATA_TEMPLATE_REAL_FIELD_NUMERIC_THRESHOLD_INFO_JSON_SCHEMA_CONSTANTS
} from "@shared/user/data/template/field/info/implementations/real/UserDataTemplateRealFieldNumericThresholdInfo";
import { FC } from "react";

export interface IUserDataTemplateRealFieldNumericThresholdInfoTypographyProps {
  thresholdInfo: IUserDataTemplateRealFieldNumericThresholdInfo;
}

const UserDataTemplateRealFieldNumericThresholdInfoTypography: FC<IUserDataTemplateRealFieldNumericThresholdInfoTypographyProps> = (
  props: IUserDataTemplateRealFieldNumericThresholdInfoTypographyProps
) => {
  const { thresholdInfo } = props;

  return (
    <>
      <Typography>
        <b>{USER_DATA_TEMPLATE_REAL_FIELD_NUMERIC_THRESHOLD_INFO_JSON_SCHEMA_CONSTANTS.value.title}:</b> {thresholdInfo.value}
      </Typography>
      <Typography>
        <b>{USER_DATA_TEMPLATE_REAL_FIELD_NUMERIC_THRESHOLD_INFO_JSON_SCHEMA_CONSTANTS.exclusive.title}:</b> {thresholdInfo.exclusive ? "Yes" : "No"}
      </Typography>
    </>
  );
};

export default UserDataTemplateRealFieldNumericThresholdInfoTypography;
