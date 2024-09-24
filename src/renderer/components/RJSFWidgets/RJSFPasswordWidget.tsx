import IconButton from "@mui/material/IconButton/IconButton";
import InputAdornment from "@mui/material/InputAdornment/InputAdornment";
import useTheme from "@mui/material/styles/useTheme";
import TextField from "@mui/material/TextField/TextField";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { WidgetProps } from "@rjsf/utils";
import { FocusEvent, ChangeEvent, FC, useState, useMemo } from "react";

const PasswordWidget: FC<WidgetProps> = (props: WidgetProps) => {
  const { id, required, disabled, readonly, options, rawErrors, onChange, onBlur, onFocus } = props;
  const _onChange = ({ target: { value } }: ChangeEvent<HTMLInputElement>): void => {
    onChange(value === "" ? options.emptyValue : value);
  };
  const _onBlur = ({ target }: FocusEvent<HTMLInputElement>): void => {
    onBlur(id, target.value);
  };
  const _onFocus = ({ target }: FocusEvent<HTMLInputElement>): void => {
    onFocus(id, target.value);
  };
  const [doShowPassword, setDoShowPassword] = useState<boolean>(false);

  const hasError: boolean = useMemo((): boolean => {
    return rawErrors !== undefined && rawErrors.length > 0;
  }, [rawErrors]);

  const theme = useTheme();

  const iconColor: string = useMemo((): string => {
    return hasError ? theme.palette.error.main : theme.palette.text.secondary;
  }, [theme, hasError]);

  return (
    <TextField
      id={id}
      type={doShowPassword ? "text" : "password"}
      label={props.schema.title ?? props.id}
      value={(props.value as string) || ""}
      required={required}
      disabled={disabled}
      onChange={_onChange}
      onBlur={_onBlur}
      onFocus={_onFocus}
      variant="outlined"
      fullWidth
      error={hasError}
      InputProps={{
        readOnly: readonly,
        endAdornment: (
          <InputAdornment position="end">
            <IconButton
              aria-label="toggle password visibility"
              onClick={(): void => {
                setDoShowPassword((prevShowPassword) => !prevShowPassword);
              }}
            >
              {doShowPassword ? <VisibilityIcon style={{ color: iconColor }} /> : <VisibilityOffIcon style={{ color: iconColor }} />}
            </IconButton>
          </InputAdornment>
        )
      }}
    />
  );
};

export default PasswordWidget;
