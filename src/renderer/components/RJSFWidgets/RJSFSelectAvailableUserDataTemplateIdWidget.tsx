import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, Stack, Typography } from "@mui/material";
import { getUiOptions, WidgetProps } from "@rjsf/utils";
import { FC, FocusEvent, useCallback, useMemo } from "react";
import { ISignedInRootContext, useSignedInRootContext } from "../roots/signedInRoot/SignedInRootContext";
import {
  ISelectedUserDataStorageIdFormContextWidgetOptions,
  isValidSelectedUserDataStorageIdFormContext,
  SELECTED_USER_DATA_STORAGE_ID_FORM_CONTEXT_WIDGET_OPTIONS_JSON_SCHEMA
} from "../forms/contexts/SelectedUserDataStorageIdFormContext";
import { JSONSchemaType } from "ajv";
import { AJV } from "@shared/utils/AJVJSONValidator";
import {
  ISelectedUserDataBoxIdFormContextWidgetOptions,
  isValidSelectedUserDataBoxIdFormContext,
  SELECTED_USER_DATA_BOX_ID_FORM_CONTEXT_WIDGET_OPTIONS_JSON_SCHEMA
} from "../forms/contexts/SelectedUserDataBoxIdFormContext";
import { IUserDataTemplateInfo } from "@shared/user/data/template/info/UserDataTemplateInfo";
import { appLogger } from "@renderer/utils/loggers";
import { IUserDataBoxIdentifier } from "@shared/user/data/box/identifier/UserDataBoxIdentifier";

export interface IRJSFSelectAvailableUserDataTemplateIdWidgetOptions {
  showNoSelectionOption: boolean;
  formContextOptions: ISelectedUserDataStorageIdFormContextWidgetOptions & ISelectedUserDataBoxIdFormContextWidgetOptions;
}

export const RJSF_SELECT_AVAILABLE_USER_DATA_TEMPLATE_ID_WIDGET_OPTIONS_JSON_SCHEMA: JSONSchemaType<IRJSFSelectAvailableUserDataTemplateIdWidgetOptions> =
  {
    $schema: "http://json-schema.org/draft-07/schema#",
    type: "object",
    properties: {
      showNoSelectionOption: { type: "boolean", title: "Show no selection option" },
      formContextOptions: {
        type: "object",
        properties: {
          ...SELECTED_USER_DATA_STORAGE_ID_FORM_CONTEXT_WIDGET_OPTIONS_JSON_SCHEMA.properties,
          ...SELECTED_USER_DATA_BOX_ID_FORM_CONTEXT_WIDGET_OPTIONS_JSON_SCHEMA.properties
        },
        required: [
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          ...SELECTED_USER_DATA_STORAGE_ID_FORM_CONTEXT_WIDGET_OPTIONS_JSON_SCHEMA.required,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          ...SELECTED_USER_DATA_BOX_ID_FORM_CONTEXT_WIDGET_OPTIONS_JSON_SCHEMA.required
        ],
        additionalProperties: true
      }
    },
    required: ["showNoSelectionOption", "formContextOptions"],
    additionalProperties: true
  } as const;

export const isValidRJSFSelectAvailableUserDataTemplateIdWidgetOptions = AJV.compile<IRJSFSelectAvailableUserDataTemplateIdWidgetOptions>(
  RJSF_SELECT_AVAILABLE_USER_DATA_TEMPLATE_ID_WIDGET_OPTIONS_JSON_SCHEMA
);

const RJSFSelectAvailableUserDataTemplateIdWidget: FC<WidgetProps> = (props: WidgetProps) => {
  const signedInRootContext: ISignedInRootContext = useSignedInRootContext();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { id, value, uiSchema, required, disabled, readonly, rawErrors, options, formContext, onChange, onBlur, onFocus } = props;
  if (!isValidRJSFSelectAvailableUserDataTemplateIdWidgetOptions(options)) {
    throw new Error(`Invalid RJSF Select Available User Data Template ID Widget options`);
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

  const formContextSelectedUserDataBoxId: string | null | undefined = useMemo<string | null | undefined>((): string | null | undefined => {
    if (!options.formContextOptions.selectedUserDataBoxIdFormContext.use) {
      return undefined;
    }
    // if (!options.formContextOptions.selectedUserDataStorageIdFormContext.use) {
    //   throw new Error(
    //     `RJSF Select Available User Data Template ID Widget selected User Data Box ID form context must also use selected User Data Storage ID form context`
    //   );
    // }
    if (!isValidSelectedUserDataBoxIdFormContext(formContext)) {
      throw new Error(`Invalid Selected User Data Box ID Form Context provided`);
    }
    return formContext.selectedUserDataBoxId ?? null;
  }, [options, formContext]);

  const isDisabled: boolean = useMemo<boolean>((): boolean => {
    const DISABLED_PROP: boolean = disabled ?? false;
    if (
      (options.formContextOptions.selectedUserDataStorageIdFormContext.use &&
        options.formContextOptions.selectedUserDataStorageIdFormContext.disableWhenNoSelection &&
        (formContextSelectedUserDataStorageId === undefined || formContextSelectedUserDataStorageId === null)) ||
      (options.formContextOptions.selectedUserDataBoxIdFormContext.use &&
        options.formContextOptions.selectedUserDataBoxIdFormContext.disableWhenNoSelection &&
        (formContextSelectedUserDataBoxId === undefined || formContextSelectedUserDataBoxId === null))
    ) {
      return true;
    }
    return DISABLED_PROP;
  }, [options, formContextSelectedUserDataStorageId, formContextSelectedUserDataBoxId, disabled]);

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
    if (formContextSelectedUserDataStorageId === null || formContextSelectedUserDataBoxId === null) {
      return MENU_ITEMS;
    }
    let userDataTemplatesSelectOptions: IUserDataTemplateInfo[];
    let storageNameElement: React.JSX.Element | undefined;
    let boxNameElement: React.JSX.Element | undefined;
    if (formContextSelectedUserDataStorageId === undefined) {
      if (formContextSelectedUserDataBoxId !== undefined) {
        appLogger.warn(
          `RJSF Select Available User Data Template ID Widget ignoring form context selected User Data Box ID "${formContextSelectedUserDataBoxId}" because a selected User Data Storage ID was not provided!`
        );
      }
      userDataTemplatesSelectOptions = signedInRootContext.availableUserDataDataTemplatesInfo;
      storageNameElement = undefined;
      boxNameElement = undefined;
    } else {
      if (formContextSelectedUserDataBoxId !== undefined) {
        userDataTemplatesSelectOptions = signedInRootContext.availableUserDataDataTemplatesInfo.filter(
          (availableUserDataTemplateInfo: IUserDataTemplateInfo): boolean => {
            return (
              availableUserDataTemplateInfo.storageId === formContextSelectedUserDataStorageId &&
              availableUserDataTemplateInfo.boxId === formContextSelectedUserDataBoxId
            );
          }
        );
        const STORAGE_NAME: string | undefined =
          signedInRootContext.getInitialisedUserDataStorageInfoById(formContextSelectedUserDataStorageId)?.name;
        storageNameElement = STORAGE_NAME !== undefined ? <span>{STORAGE_NAME}</span> : <em>Unknown</em>;
        const BOX_NAME: string | undefined = signedInRootContext.getAvailableUserDataBoxInfoByIdentifier({
          boxId: formContextSelectedUserDataBoxId,
          storageId: formContextSelectedUserDataStorageId
        } satisfies IUserDataBoxIdentifier)?.name;
        boxNameElement = BOX_NAME !== undefined ? <span>{BOX_NAME}</span> : <em>Unknown</em>;
      } else {
        userDataTemplatesSelectOptions = signedInRootContext.availableUserDataDataTemplatesInfo.filter(
          (availableUserDataTemplateInfo: IUserDataTemplateInfo): boolean => {
            return availableUserDataTemplateInfo.storageId === formContextSelectedUserDataStorageId;
          }
        );
        const STORAGE_NAME: string | undefined =
          signedInRootContext.getInitialisedUserDataStorageInfoById(formContextSelectedUserDataStorageId)?.name;
        storageNameElement = STORAGE_NAME !== undefined ? <span>{STORAGE_NAME}</span> : <em>Unknown</em>;
        boxNameElement = undefined;
      }
    }
    if (userDataTemplatesSelectOptions.length === 0) {
      MENU_ITEMS.push(
        <MenuItem key="empty" disabled>
          <Typography>
            <em>No templates found</em>
          </Typography>
        </MenuItem>
      );
      return MENU_ITEMS;
    }
    const TEMPLATE_MENU_ITEMS: React.JSX.Element[] = userDataTemplatesSelectOptions.map(
      (availableUserDataTemplateInfo: IUserDataTemplateInfo): React.JSX.Element => {
        return (
          <MenuItem key={availableUserDataTemplateInfo.templateId} value={availableUserDataTemplateInfo.templateId}>
            <Stack>
              <Typography>{availableUserDataTemplateInfo.name}</Typography>
              <Typography variant="caption">
                {"From data storage "}
                <b>
                  {storageNameElement ?? signedInRootContext.getInitialisedUserDataStorageInfoById(availableUserDataTemplateInfo.storageId)?.name ?? (
                    <em>Unknown</em>
                  )}
                </b>
                {" and box "}
                <b>
                  {boxNameElement ??
                    signedInRootContext.getAvailableUserDataBoxInfoByIdentifier({
                      boxId: availableUserDataTemplateInfo.boxId,
                      storageId: availableUserDataTemplateInfo.storageId
                    } satisfies IUserDataBoxIdentifier)?.name ?? <em>Unknown</em>}
                </b>
              </Typography>
            </Stack>
          </MenuItem>
        );
      }
    );
    return MENU_ITEMS.concat(TEMPLATE_MENU_ITEMS);
  }, [options, formContextSelectedUserDataStorageId, formContextSelectedUserDataBoxId, signedInRootContext]);

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

export default RJSFSelectAvailableUserDataTemplateIdWidget;
