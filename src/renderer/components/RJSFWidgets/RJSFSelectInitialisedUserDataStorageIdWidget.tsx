import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, Typography } from "@mui/material";
import { getUiOptions, WidgetProps } from "@rjsf/utils";
import { FC, FocusEvent, useCallback, useMemo } from "react";
import { ISignedInRootContext, useSignedInRootContext } from "../roots/signedInRoot/SignedInRootContext";
import { IUserDataStorageInfo } from "@shared/user/data/storage/info/UserDataStorageInfo";
import { AJV } from "@shared/utils/AJVJSONValidator";
import { JSONSchemaType } from "ajv";

export interface IRJSFSelectInitialisedUserDataStorageIdWidgetOptions {
  showNoSelectionOption: boolean;
  onlyAllowOpenSelection: boolean;
}

export const RJSF_SELECT_INITIALISED_USER_DATA_STORAGE_ID_WIDGET_OPTIONS_JSON_SCHEMA: JSONSchemaType<IRJSFSelectInitialisedUserDataStorageIdWidgetOptions> =
  {
    $schema: "http://json-schema.org/draft-07/schema#",
    type: "object",
    properties: {
      showNoSelectionOption: { type: "boolean", title: "Show no selection option" },
      onlyAllowOpenSelection: { type: "boolean", title: "Only allow open selection" }
    },
    required: ["showNoSelectionOption", "onlyAllowOpenSelection"],
    additionalProperties: true
  } as const;

export const isValidRJSFSelectInitialisedUserDataStoragedWidgetOptions = AJV.compile<IRJSFSelectInitialisedUserDataStorageIdWidgetOptions>(
  RJSF_SELECT_INITIALISED_USER_DATA_STORAGE_ID_WIDGET_OPTIONS_JSON_SCHEMA
);

const RJSFSelectInitialisedUserDataStorageIdWidget: FC<WidgetProps> = (props: WidgetProps) => {
  const signedInRootContext: ISignedInRootContext = useSignedInRootContext();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { id, value, uiSchema, required, disabled, readonly, rawErrors, options, onChange, onBlur, onFocus } = props;
  if (!isValidRJSFSelectInitialisedUserDataStoragedWidgetOptions(options)) {
    throw new Error(`Invalid RJSF Select Initialised User Data Storage ID Widget options`);
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

  const menuItems: React.JSX.Element[] = useMemo<React.JSX.Element[]>((): React.JSX.Element[] => {
    const MENU_ITEMS: React.JSX.Element[] = [];
    if (options.showNoSelectionOption) {
      MENU_ITEMS.push(
        <MenuItem key="undefined" value={undefined} divider={true}>
          <em>None</em>
        </MenuItem>
      );
    }
    let initialisedUserDataStoragesSelectOptions: IUserDataStorageInfo[];
    if (options.onlyAllowOpenSelection) {
      initialisedUserDataStoragesSelectOptions = signedInRootContext.initialisedUserDataStoragesInfo.filter(
        (initialisedUserDataStorageInfo: IUserDataStorageInfo): boolean => {
          return initialisedUserDataStorageInfo.backend.isOpen;
        }
      );
    } else {
      initialisedUserDataStoragesSelectOptions = signedInRootContext.initialisedUserDataStoragesInfo;
    }
    if (initialisedUserDataStoragesSelectOptions.length === 0) {
      MENU_ITEMS.push(
        <MenuItem key="empty" disabled>
          <Typography>
            <em>No data storages found</em>
          </Typography>
        </MenuItem>
      );
      return MENU_ITEMS;
    }
    const DATA_STORAGE_MENU_ITEMS: React.JSX.Element[] = initialisedUserDataStoragesSelectOptions.map(
      (initialisedOpenUserDataStorageInfo: IUserDataStorageInfo): React.JSX.Element => {
        return (
          <MenuItem key={initialisedOpenUserDataStorageInfo.storageId} value={initialisedOpenUserDataStorageInfo.storageId}>
            <Typography>{initialisedOpenUserDataStorageInfo.name}</Typography>
          </MenuItem>
        );
      }
    );
    return MENU_ITEMS.concat(DATA_STORAGE_MENU_ITEMS);
  }, [options, signedInRootContext]);

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
      <InputLabel id={labelId} required={required}>
        {label}
      </InputLabel>
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
        {menuItems}
      </Select>
    </FormControl>
  );
};

export default RJSFSelectInitialisedUserDataStorageIdWidget;
