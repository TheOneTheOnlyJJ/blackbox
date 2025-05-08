import { Typography } from "@mui/material";
import {
  IUserDataTemplateIntegerFieldNumericThresholdInfo,
  USER_DATA_TEMPLATE_INTEGER_FIELD_NUMERIC_THRESHOLD_INFO_JSON_SCHEMA_CONSTANTS
} from "@shared/user/data/template/field/info/implementations/integer/UserDataTemplateIntegerFieldNumericThresholdInfo";
import { FC } from "react";

export interface IUserDataTemplateIntegerFieldNumericThresholdInfoTypographyProps {
  thresholdInfo: IUserDataTemplateIntegerFieldNumericThresholdInfo;
}

const UserDataTemplateIntegerFieldNumericThresholdInfoTypography: FC<IUserDataTemplateIntegerFieldNumericThresholdInfoTypographyProps> = (
  props: IUserDataTemplateIntegerFieldNumericThresholdInfoTypographyProps
) => {
  const { thresholdInfo } = props;

  return (
    <>
      <Typography>
        <b>{USER_DATA_TEMPLATE_INTEGER_FIELD_NUMERIC_THRESHOLD_INFO_JSON_SCHEMA_CONSTANTS.value.title}:</b> {thresholdInfo.value}
      </Typography>
      <Typography>
        <b>{USER_DATA_TEMPLATE_INTEGER_FIELD_NUMERIC_THRESHOLD_INFO_JSON_SCHEMA_CONSTANTS.exclusive.title}:</b>{" "}
        {thresholdInfo.exclusive ? "Yes" : "No"}
      </Typography>
    </>
  );
};

export default UserDataTemplateIntegerFieldNumericThresholdInfoTypography;
