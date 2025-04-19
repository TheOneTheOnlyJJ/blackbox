import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import { getUiOptions, WidgetProps } from "@rjsf/utils";
import { FC, FocusEvent, useCallback, useEffect, useMemo } from "react";
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
    if (!options.formContextOptions.useSelectedUserDataStorageIdFormContext) {
      return undefined;
    }
    if (!isValidSelectedUserDataStorageIdFormContext(formContext)) {
      throw new Error(`Invalid Selected User Data Storage ID Form Context provided.`);
    }
    return formContext.selectedUserDataStorageId ?? null;
  }, [options, formContext]);

  const isDisabled: boolean = useMemo<boolean>((): boolean => {
    const DISABLED_PROP: boolean = disabled ?? false;
    if (!options.formContextOptions.disableWhenNoSelectedUserDataStorageIdFormContext) {
      return DISABLED_PROP;
    }
    if (formContextSelectedUserDataStorageId === undefined || formContextSelectedUserDataStorageId === null) {
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
    if (formContextSelectedUserDataStorageId === undefined) {
      userDataBoxesSelectOptions = signedInRootContext.availableUserDataDataBoxesInfo;
    } else {
      userDataBoxesSelectOptions = signedInRootContext.availableUserDataDataBoxesInfo.filter(
        (availableUserDataBoxInfo: IUserDataBoxInfo): boolean => {
          return availableUserDataBoxInfo.storageId === formContextSelectedUserDataStorageId;
        }
      );
    }
    userDataBoxesSelectOptions.forEach((availableUserDataBoxInfo: IUserDataBoxInfo): void => {
      MENU_ITEMS.push(
        <MenuItem key={availableUserDataBoxInfo.boxId} value={availableUserDataBoxInfo.boxId}>
          {availableUserDataBoxInfo.name}
        </MenuItem>
      );
    });
    return MENU_ITEMS;
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

  useEffect((): void => {
    onChange(undefined);
  }, [formContextSelectedUserDataStorageId, onChange]);

  return (
    <FormControl fullWidth>
      <InputLabel id={labelId}>{label}</InputLabel>
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
