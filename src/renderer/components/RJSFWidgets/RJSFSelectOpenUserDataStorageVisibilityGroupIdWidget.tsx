import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import { getUiOptions, WidgetProps } from "@rjsf/utils";
import { FC, FocusEvent, useCallback, useMemo } from "react";
import { ISignedInRootContext, useSignedInRootContext } from "../roots/signedInRoot/SignedInRootContext";
import { IUserDataStorageVisibilityGroupInfo } from "@shared/user/data/storage/visibilityGroup/info/UserDataStorageVisibilityGroupInfo";
import { PUBLIC_USER_DATA_STORAGE_VISIBILITY_GROUP_CONSTANTS } from "@shared/user/data/storage/visibilityGroup/public/constants";
import { JSONSchemaType } from "ajv";
import { AJV } from "@shared/utils/AJVJSONValidator";

export interface IRJSFSelectOpenUserDataStorageVisibilityGroupIdWidgetOptions {
  showNoSelectionOption: boolean;
}

export const RJSF_SELECT_OPEN_USER_DATA_STORAGE_VISIBILITY_GROUP_ID_WIDGET_OPTIONS_JSON_SCHEMA: JSONSchemaType<IRJSFSelectOpenUserDataStorageVisibilityGroupIdWidgetOptions> =
  {
    $schema: "http://json-schema.org/draft-07/schema#",
    type: "object",
    properties: {
      showNoSelectionOption: { type: "boolean", title: "Show no selection option" }
    },
    required: ["showNoSelectionOption"],
    additionalProperties: true
  } as const;

export const isValidRJSFSelectOpenUserDataStorageVisibilityGroupIdWidgetOptions =
  AJV.compile<IRJSFSelectOpenUserDataStorageVisibilityGroupIdWidgetOptions>(
    RJSF_SELECT_OPEN_USER_DATA_STORAGE_VISIBILITY_GROUP_ID_WIDGET_OPTIONS_JSON_SCHEMA
  );

const RJSFSelectOpenUserDataStorageVisibilityGroupIdWidget: FC<WidgetProps> = (props: WidgetProps) => {
  const signedInRootContext: ISignedInRootContext = useSignedInRootContext();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { id, value, uiSchema, required, disabled, readonly, rawErrors, options, onChange, onBlur, onFocus } = props;
  if (!isValidRJSFSelectOpenUserDataStorageVisibilityGroupIdWidgetOptions(options)) {
    throw new Error(`Invalid RJSF Select Open User Data Storage Visibility Group ID Widget options`);
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
        <MenuItem value={undefined} divider={true}>
          <em>{PUBLIC_USER_DATA_STORAGE_VISIBILITY_GROUP_CONSTANTS.name}</em>
        </MenuItem>
      );
    }
    const DATA_STORAGE_VISIBILITY_GROUP_MENU_ITEMS: React.JSX.Element[] = signedInRootContext.openUserDataStorageVisibilityGroupsInfo.map(
      (visibilityGroupInfo: IUserDataStorageVisibilityGroupInfo): React.JSX.Element => {
        return (
          <MenuItem key={visibilityGroupInfo.visibilityGroupId} value={visibilityGroupInfo.visibilityGroupId}>
            {visibilityGroupInfo.name}
          </MenuItem>
        );
      }
    );
    return MENU_ITEMS.concat(DATA_STORAGE_VISIBILITY_GROUP_MENU_ITEMS);
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

export default RJSFSelectOpenUserDataStorageVisibilityGroupIdWidget;
