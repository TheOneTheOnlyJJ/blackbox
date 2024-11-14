import IconButton from "@mui/material/IconButton/IconButton";
import InputAdornment from "@mui/material/InputAdornment/InputAdornment";
import useTheme from "@mui/material/styles/useTheme";
import TextField from "@mui/material/TextField/TextField";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { getUiOptions, WidgetProps } from "@rjsf/utils";
import { FocusEvent, ChangeEvent, FC, useState, useMemo, useCallback } from "react";
import { Theme } from "@mui/material";

const PasswordWidget: FC<WidgetProps> = (props: WidgetProps) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { id, value, uiSchema, required, disabled, readonly, options, rawErrors, onChange, onBlur, onFocus } = props;
  const theme: Theme = useTheme();
  const [doShowPassword, setDoShowPassword] = useState<boolean>(false);

  const _onChange = useCallback(
    ({ target: { value } }: ChangeEvent<HTMLInputElement>): void => {
      onChange(value === "" ? options.emptyValue : value);
    },
    [onChange, options.emptyValue]
  );
  const _onBlur = useCallback(
    ({ target }: FocusEvent<HTMLInputElement>): void => {
      onBlur(id, target.value);
    },
    [onBlur, id]
  );
  const _onFocus = useCallback(
    ({ target }: FocusEvent<HTMLInputElement>): void => {
      onFocus(id, target.value);
    },
    [onFocus, id]
  );

  const hasError: boolean = useMemo((): boolean => {
    return rawErrors !== undefined && rawErrors.length > 0;
  }, [rawErrors]);

  const iconColor: string = useMemo((): string => {
    return hasError ? theme.palette.error.main : theme.palette.text.secondary;
  }, [theme, hasError]);

  return (
    <TextField
      id={id}
      type={doShowPassword ? "text" : "password"}
      label={getUiOptions(uiSchema).title ?? id}
      value={(value as string) || ""}
      required={required}
      disabled={disabled}
      onChange={_onChange}
      onBlur={_onBlur}
      onFocus={_onFocus}
      variant="outlined"
      fullWidth
      error={hasError}
      slotProps={{
        input: {
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
        }
      }}
    />
  );
};

export default PasswordWidget;
