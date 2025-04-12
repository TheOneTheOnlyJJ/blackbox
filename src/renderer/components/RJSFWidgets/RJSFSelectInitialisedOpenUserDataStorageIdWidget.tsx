import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import { getUiOptions, WidgetProps } from "@rjsf/utils";
import { FC, FocusEvent, useCallback, useMemo } from "react";
import { ISignedInRootContext, useSignedInRootContext } from "../roots/signedInRoot/SignedInRootContext";
import { IUserDataStorageInfo } from "@shared/user/data/storage/info/UserDataStorageInfo";

const RJSFSelectInitialisedOpenUserDataStorageIdWidget: FC<WidgetProps> = (props: WidgetProps) => {
  const signedInRootContext: ISignedInRootContext = useSignedInRootContext();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { id, value, uiSchema, required, disabled, readonly, rawErrors, options, onChange, onBlur, onFocus } = props;
  if (typeof options.showNoSelectionOption !== "boolean") {
    throw new Error(`RJSF Select Initialised User Data Storage ID Widget must be provided a boolean "showNoSelectionOption" option`);
  }

  const label: string = useMemo<string>((): string => {
    return getUiOptions(uiSchema).title ?? id;
  }, [uiSchema, id]);

  const labelId: string = useMemo<string>((): string => {
    return `${id}-label`;
  }, [id]);

  const hasError: boolean = useMemo<boolean>((): boolean => {
    return rawErrors !== undefined && rawErrors.length > 0;
  }, [rawErrors]);

  const _onChange = useCallback(
    ({ target: { value } }: SelectChangeEvent): void => {
      onChange(value);
    },
    [onChange]
  );
  const _onBlur = useCallback(
    ({ target: { value } }: FocusEvent<HTMLInputElement>): void => {
      onBlur(id, value);
    },
    [onBlur, id]
  );
  const _onFocus = useCallback(
    ({ target: { value } }: FocusEvent<HTMLInputElement>): void => {
      onFocus(id, value);
    },
    [onFocus, id]
  );

  return (
    <FormControl fullWidth>
      <InputLabel id={labelId}>{label}</InputLabel>
      <Select
        id={id}
        label={label}
        labelId={labelId}
        value={value as string | undefined}
        required={required}
        disabled={disabled}
        onChange={_onChange}
        onBlur={_onBlur}
        onFocus={_onFocus}
        variant="outlined"
        error={hasError}
        inputProps={{ readOnly: readonly }}
        defaultValue={undefined}
      >
        {options.showNoSelectionOption ? (
          <MenuItem value={undefined} divider={true}>
            <em>None</em>
          </MenuItem>
        ) : null}
        {signedInRootContext.initialisedUserDataStoragesInfo
          .filter((initialisedUserDataStorageInfo: IUserDataStorageInfo): boolean => {
            return initialisedUserDataStorageInfo.backend.isOpen;
          })
          .map((initialisedOpenUserDataStorageInfo: IUserDataStorageInfo): React.JSX.Element => {
            return (
              <MenuItem key={initialisedOpenUserDataStorageInfo.storageId} value={initialisedOpenUserDataStorageInfo.storageId}>
                {initialisedOpenUserDataStorageInfo.name}
              </MenuItem>
            );
          })}
      </Select>
    </FormControl>
  );
};

export default RJSFSelectInitialisedOpenUserDataStorageIdWidget;
