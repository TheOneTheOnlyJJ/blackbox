import { Visibility, VisibilityOff } from "@mui/icons-material";
import { IconButton, InputAdornment, TextField } from "@mui/material";
import { WidgetProps } from "@rjsf/utils";
import { FocusEvent, ChangeEvent, FC, useState } from "react";

const PasswordWidget: FC<WidgetProps> = (props: WidgetProps) => {
  const { id, required, disabled, readonly, options, onChange, onBlur, onFocus } = props;
  const _onChange = ({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
    onChange(value === "" ? options.emptyValue : value);
  };
  const _onBlur = ({ target }: FocusEvent<HTMLInputElement>) => {
    onBlur(id, target.value);
  };
  const _onFocus = ({ target }: FocusEvent<HTMLInputElement>) => {
    onFocus(id, target.value);
  };
  const [doShowPassword, setDoShowPassword] = useState<boolean>(false);

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
      InputProps={{
        readOnly: readonly,
        endAdornment: (
          <InputAdornment position="end">
            <IconButton
              aria-label="toggle password visibility"
              onClick={() => {
                setDoShowPassword((prevShowPassword) => !prevShowPassword);
              }}
            >
              {doShowPassword ? <Visibility /> : <VisibilityOff />}
            </IconButton>
          </InputAdornment>
        )
      }}
    />
  );
};

export default PasswordWidget;
