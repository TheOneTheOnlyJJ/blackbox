import { Box, Typography } from "@mui/material";
import UserDataTemplateIntegerFieldNumericThresholdInfoTypography from "./UserDataTemplateIntegerFieldNumericThresholdInfoTypography";
import { IUserDataTemplateIntegerFieldNumericThresholdInfo } from "@shared/user/data/template/field/info/implementations/integer/UserDataTemplateIntegerFieldNumericThresholdInfo";
import { FC } from "react";

export interface INullableUserDataTemplateIntegerFieldNumericThresholdInfoTypographyProps {
  title: string;
  nullableThresholdInfo: IUserDataTemplateIntegerFieldNumericThresholdInfo | null;
  nullThresholdValue: string;
  doDisplayNullProperties: boolean;
}

const NullableUserDataTemplateIntegerFieldNumericThresholdInfoTypography: FC<
  INullableUserDataTemplateIntegerFieldNumericThresholdInfoTypographyProps
> = (props: INullableUserDataTemplateIntegerFieldNumericThresholdInfoTypographyProps) => {
  const { title, nullableThresholdInfo, nullThresholdValue, doDisplayNullProperties } = props;

  if (nullableThresholdInfo === null) {
    if (!doDisplayNullProperties) {
      return null;
    }
    return (
      <Typography>
        <b>{title}:</b> <em>{nullThresholdValue}</em>
      </Typography>
    );
  }
  return (
    <>
      <Typography>
        <b>{title}:</b>
      </Typography>
      <Box sx={{ pl: "1rem" }}>
        <UserDataTemplateIntegerFieldNumericThresholdInfoTypography thresholdInfo={nullableThresholdInfo} />
      </Box>
    </>
  );
};

export default NullableUserDataTemplateIntegerFieldNumericThresholdInfoTypography;
