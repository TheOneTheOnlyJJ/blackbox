import { Typography } from "@mui/material";
import { FC } from "react";

export interface IUserDataTemplateFieldInfoPropertyTypographyProps {
  propertyName: string;
  propertyValue: string | number | null;
  doDisplayNullProperties: boolean;
}

const UserDataTemplateFieldInfoPropertyTypography: FC<IUserDataTemplateFieldInfoPropertyTypographyProps> = (
  props: IUserDataTemplateFieldInfoPropertyTypographyProps
) => {
  const { propertyName, propertyValue, doDisplayNullProperties } = props;

  if (!doDisplayNullProperties && propertyValue === null) {
    return null;
  }
  return (
    <Typography>
      <b>{propertyName}:</b> {propertyValue ?? <em>None</em>}
    </Typography>
  );
};

export default UserDataTemplateFieldInfoPropertyTypography;
