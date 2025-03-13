import { IconButton, InputAdornment, TextField, Theme, Tooltip } from "@mui/material";
import useTheme from "@mui/material/styles/useTheme";
import { getUiOptions, WidgetProps } from "@rjsf/utils";
import { ChangeEvent, FC, FocusEvent, useCallback, useMemo } from "react";
import FolderOpenOutlinedIcon from "@mui/icons-material/FolderOpenOutlined";
import { appLogger } from "@renderer/utils/loggers";
import { IPCAPIResponse } from "@shared/IPC/IPCAPIResponse";
import { IEncryptedData } from "@shared/utils/EncryptedData";
import { IPC_API_RESPONSE_STATUSES } from "@shared/IPC/IPCAPIResponseStatus";
import { JSONSchemaType, ValidateFunction } from "ajv";
import { AJV } from "@shared/utils/AJVJSONValidator";
import { enqueueSnackbar } from "notistack";

const LIST_OF_STRINGS_JSON_VALIDATE_FUNCTION: ValidateFunction<string[]> = AJV.compile({
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "array",
  items: { type: "string" }
} satisfies JSONSchemaType<string[]>);

const RJSFDirectoryPickerWidget: FC<WidgetProps> = (props: WidgetProps) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { id, value, uiSchema, required, disabled, readonly, options, rawErrors, onChange, onBlur, onFocus } = props;
  const theme: Theme = useTheme();

  const hasError: boolean = useMemo<boolean>((): boolean => {
    return rawErrors !== undefined && rawErrors.length > 0;
  }, [rawErrors]);

  const openDirectoryPickerIconColor: string = useMemo<string>((): string => {
    return hasError ? theme.palette.error.main : theme.palette.text.secondary;
  }, [theme, hasError]);

  const pickerTitle: string = useMemo<string>((): string => {
    if (options.pickerTitle !== null && options.pickerTitle !== undefined) {
      if (typeof options.pickerTitle === "string") {
        return options.pickerTitle;
      } else {
        appLogger.warn(
          `RJSF Directory Picker Widget picker title must be string if provided. Got "${typeof options.pickerTitle}". Using default title.`
        );
      }
    }
    return "Choose Directory";
  }, [options]);

  const openDirectoryPickerIconButtonOnClick = useCallback((): void => {
    appLogger.debug("Open directory picker icon button clicked.");
    window.utilsAPI
      .getDirectoryPathWithPicker({ pickerTitle: pickerTitle, multiple: false })
      .then(
        async (getDirectoryPathWithPickerResponse: IPCAPIResponse<IEncryptedData<string[]> | null>): Promise<void> => {
          if (getDirectoryPathWithPickerResponse.status !== IPC_API_RESPONSE_STATUSES.SUCCESS) {
            enqueueSnackbar({ message: "Directory picker error.", variant: "error" });
            return;
          }
          if (getDirectoryPathWithPickerResponse.data === null) {
            return;
          }
          try {
            const CHOSEN_DIRECTORY_PATH: string = (
              await window.IPCTLSAPI.decryptAndValidateJSON<string[]>(
                getDirectoryPathWithPickerResponse.data,
                LIST_OF_STRINGS_JSON_VALIDATE_FUNCTION,
                "picked directory path"
              )
            )[0];
            onChange(CHOSEN_DIRECTORY_PATH);
          } catch (error: unknown) {
            const ERROR_MESSAGE: string = error instanceof Error ? error.message : String(error);
            appLogger.error(`Picked directory path decryption error: ${ERROR_MESSAGE}!`);
          }
        },
        (reason: unknown): void => {
          const REASON_MESSAGE: string = reason instanceof Error ? reason.message : String(reason);
          appLogger.error(`Get directory path with picker error: ${REASON_MESSAGE}!`);
        }
      )
      .catch((error: unknown): void => {
        const ERROR_MESSAGE: string = error instanceof Error ? error.message : String(error);
        appLogger.error(`Get directory path with picker error: ${ERROR_MESSAGE}!`);
      });
  }, [onChange, pickerTitle]);

  const _onChange = useCallback(
    ({ target: { value } }: ChangeEvent<HTMLInputElement>): void => {
      onChange(value === "" ? options.emptyValue : value);
    },
    [onChange, options.emptyValue]
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
    <TextField
      id={id}
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
              <Tooltip title="Open Directory Picker">
                <IconButton aria-label="open directory picker" onClick={openDirectoryPickerIconButtonOnClick}>
                  <FolderOpenOutlinedIcon style={{ color: openDirectoryPickerIconColor }} />
                </IconButton>
              </Tooltip>
            </InputAdornment>
          )
        }
      }}
    />
  );
};

export default RJSFDirectoryPickerWidget;
