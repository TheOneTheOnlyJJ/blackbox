import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, Stack, Typography } from "@mui/material";
import { getUiOptions, WidgetProps } from "@rjsf/utils";
import { FC, FocusEvent, useCallback, useMemo } from "react";
import { ISignedInRootContext, useSignedInRootContext } from "../roots/signedInRoot/SignedInRootContext";
import { IUserDataBoxInfo } from "@shared/user/data/box/info/UserDataBoxInfo";
import {
  ISelectedUserDataStorageIdFormContextWidgetOptions,
  isValidSelectedUserDataStorageIdFormContext,
  SELECTED_USER_DATA_STORAGE_ID_FORM_CONTEXT_WIDGET_OPTIONS_JSON_SCHEMA
} from "../forms/contexts/SelectedUserDataStorageIdFormContext";
import { JSONSchemaType } from "ajv";
import { AJV } from "@shared/utils/AJVJSONValidator";

export interface IRJSFSelectAvailableUserDataBoxIdWidgetOptions {
  showNoSelectionOption: boolean;
  formContextOptions: ISelectedUserDataStorageIdFormContextWidgetOptions;
}

export const RJSF_SELECT_AVAILABLE_USER_DATA_BOX_ID_WIDGET_OPTIONS_JSON_SCHEMA: JSONSchemaType<IRJSFSelectAvailableUserDataBoxIdWidgetOptions> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    showNoSelectionOption: { type: "boolean", title: "Show no selection option" },
    formContextOptions: SELECTED_USER_DATA_STORAGE_ID_FORM_CONTEXT_WIDGET_OPTIONS_JSON_SCHEMA
  },
  required: ["showNoSelectionOption", "formContextOptions"],
  additionalProperties: true
} as const;

export const isValidRJSFSelectAvailableUserDataBoxIdWidgetOptions = AJV.compile<IRJSFSelectAvailableUserDataBoxIdWidgetOptions>(
  RJSF_SELECT_AVAILABLE_USER_DATA_BOX_ID_WIDGET_OPTIONS_JSON_SCHEMA
);

const RJSFSelectAvailableUserDataBoxIdWidget: FC<WidgetProps> = (props: WidgetProps) => {
  const signedInRootContext: ISignedInRootContext = useSignedInRootContext();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { id, value, uiSchema, required, disabled, readonly, rawErrors, options, formContext, onChange, onBlur, onFocus } = props;
  if (!isValidRJSFSelectAvailableUserDataBoxIdWidgetOptions(options)) {
    throw new Error(`Invalid RJSF Select Available User Data Box ID Widget options`);
  }

  const formContextSelectedUserDataStorageId: string | null | undefined = useMemo<string | null | undefined>((): string | null | undefined => {
    if (!options.formContextOptions.selectedUserDataStorageIdFormContext.use) {
      return undefined;
    }
    if (!isValidSelectedUserDataStorageIdFormContext(formContext)) {
      throw new Error(`Invalid Selected User Data Storage ID Form Context provided`);
    }
    return formContext.selectedUserDataStorageId ?? null;
  }, [options, formContext]);

  const isDisabled: boolean = useMemo<boolean>((): boolean => {
    const DISABLED_PROP: boolean = disabled ?? false;
    if (
      options.formContextOptions.selectedUserDataStorageIdFormContext.use &&
      options.formContextOptions.selectedUserDataStorageIdFormContext.disableWhenNoSelection &&
      (formContextSelectedUserDataStorageId === undefined || formContextSelectedUserDataStorageId === null)
    ) {
      return true;
    }
    return DISABLED_PROP;
  }, [options, formContextSelectedUserDataStorageId, disabled]);

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
    if (formContextSelectedUserDataStorageId === null) {
      return MENU_ITEMS;
    }
    let userDataBoxesSelectOptions: IUserDataBoxInfo[];
    let storageNameElement: React.JSX.Element | undefined;
    if (formContextSelectedUserDataStorageId === undefined) {
      userDataBoxesSelectOptions = signedInRootContext.availableUserDataDataBoxesInfo;
      storageNameElement = undefined;
    } else {
      userDataBoxesSelectOptions = signedInRootContext.availableUserDataDataBoxesInfo.filter(
        (availableUserDataBoxInfo: IUserDataBoxInfo): boolean => {
          return availableUserDataBoxInfo.storageId === formContextSelectedUserDataStorageId;
        }
      );
      const STORAGE_NAME: string | undefined = signedInRootContext.getInitialisedUserDataStorageInfoById(formContextSelectedUserDataStorageId)?.name;
      storageNameElement = STORAGE_NAME !== undefined ? <span>{STORAGE_NAME}</span> : <em>Unknown</em>;
    }
    if (userDataBoxesSelectOptions.length === 0) {
      MENU_ITEMS.push(
        <MenuItem key="empty" disabled>
          <Typography>
            <em>No boxes found</em>
          </Typography>
        </MenuItem>
      );
      return MENU_ITEMS;
    }
    const BOX_MENU_ITEMS: React.JSX.Element[] = userDataBoxesSelectOptions.map((availableUserDataBoxInfo: IUserDataBoxInfo): React.JSX.Element => {
      return (
        // TODO: Check uniqueness of all keys (give them index?) in all RJSF components
        <MenuItem key={availableUserDataBoxInfo.boxId} value={availableUserDataBoxInfo.boxId}>
          <Stack>
            <Typography>{availableUserDataBoxInfo.name}</Typography>
            <Typography variant="caption">
              {"From data storage "}
              <b>
                {storageNameElement ?? signedInRootContext.getInitialisedUserDataStorageInfoById(availableUserDataBoxInfo.storageId)?.name ?? (
                  <em>Unknown</em>
                )}
              </b>
            </Typography>
          </Stack>
        </MenuItem>
      );
    });
    return MENU_ITEMS.concat(BOX_MENU_ITEMS);
  }, [options, formContextSelectedUserDataStorageId, signedInRootContext]);

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

  // TODO: Find a way to fix this. Set the value to undefined when the conext selected value changes
  // useEffect((): void => {
  // appLogger.warn(`CLEANUP HOOK. Value ${String(value)} and ctx strg id ${String(formContextSelectedUserDataStorageId)}`);
  // if (formContextSelectedUserDataStorageId === null) {
  // appLogger.warn("RUNNING ON CHANGE HOOK");
  // onChange(undefined);
  // }
  // }, [formContextSelectedUserDataStorageId]);

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
        disabled={isDisabled}
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

export default RJSFSelectAvailableUserDataBoxIdWidget;
