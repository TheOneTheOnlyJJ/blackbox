import { Box, Typography } from "@mui/material";
import { IUserDataTemplateRealFieldNumericThresholdInfo } from "@shared/user/data/template/field/info/implementations/real/UserDataTemplateRealFieldNumericThresholdInfo";
import { FC } from "react";
import UserDataTemplateRealFieldNumericThresholdInfoTypography from "./UserDataTemplateRealFieldNumericThresholdInfoTypography";

export interface INullableUserDataTemplateRealFieldNumericThresholdInfoTypographyProps {
  title: string;
  nullableThresholdInfo: IUserDataTemplateRealFieldNumericThresholdInfo | null;
  nullThresholdValue: string;
  doDisplayNullProperties: boolean;
}

const NullableUserDataTemplateRealFieldNumericThresholdInfoTypography: FC<INullableUserDataTemplateRealFieldNumericThresholdInfoTypographyProps> = (
  props: INullableUserDataTemplateRealFieldNumericThresholdInfoTypographyProps
) => {
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
        <UserDataTemplateRealFieldNumericThresholdInfoTypography thresholdInfo={nullableThresholdInfo} />
      </Box>
    </>
  );
};

export default NullableUserDataTemplateRealFieldNumericThresholdInfoTypography;
