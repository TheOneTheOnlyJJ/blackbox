import { UiSchema } from "@rjsf/utils";
import { IUserDataTemplateInfo } from "@shared/user/data/template/info/UserDataTemplateInfo";
import { LogFunctions } from "electron-log";
import { IUserDataEntryCreateInput } from "../UserDataEntryCreateInput";
import { UserDataTemplateFieldInfo } from "@shared/user/data/template/field/info/UserDataTemplateFieldInfo";
import { getUserDataEntryFieldUISchemaFromTemplateFieldInfo } from "./field/getUserDataEntryFieldUISchemaFromTemplateFieldInfo";
import { UserDataEntryField } from "@shared/user/data/entry/field/UserDataEntryField";
import { getUserDataEntryFieldKey } from "@shared/user/data/entry/utils/getUserDataEntryFieldKey";
// import RJSFSelectInitialisedUserDataStorageIdWidget, {
//   IRJSFSelectInitialisedUserDataStorageIdWidgetOptions
// } from "@renderer/components/RJSFWidgets/RJSFSelectInitialisedUserDataStorageIdWidget";
// import RJSFSelectAvailableUserDataBoxIdWidget, {
//   IRJSFSelectAvailableUserDataBoxIdWidgetOptions
// } from "@renderer/components/RJSFWidgets/RJSFSelectAvailableUserDataBoxIdWidget";
// import RJSFSelectAvailableUserDataTemplateIdWidget, {
//   IRJSFSelectAvailableUserDataTemplateIdWidgetOptions
// } from "@renderer/components/RJSFWidgets/RJSFSelectAvailableUserDataTemplateIdWidget";

export const getUserDataEntryCreateInputUISchemaFromTemplateInfo = (
  userDataTemplateFieldInfo: IUserDataTemplateInfo,
  userDataBoxName: string,
  userDataStorageName: string,
  logger: LogFunctions | null
): UiSchema<IUserDataEntryCreateInput> => {
  logger?.debug("Getting User Data Entry Create Input UI Schema from User Data Template Info.");
  const DATA_UI_SCHEMA_FIELDS: UiSchema<UserDataEntryField> = userDataTemplateFieldInfo.fields.reduce(
    (acc: UiSchema<UserDataEntryField>, fieldInfo: UserDataTemplateFieldInfo, index: number) => {
      acc[getUserDataEntryFieldKey(index)] = getUserDataEntryFieldUISchemaFromTemplateFieldInfo(fieldInfo, logger);
      return acc;
    },
    {}
  );
  return {
    "ui:title": `New ${userDataTemplateFieldInfo.name} Data Entry`,
    "ui:description": `Adding new data entry to template ${userDataTemplateFieldInfo.name} from box ${userDataBoxName} in data storage ${userDataStorageName}.`,
    storageId: {
      // "ui:title": "Storage",
      "ui:widget": "hidden"
      // "ui:widget": RJSFSelectInitialisedUserDataStorageIdWidget,
      // "ui:options": {
      //   showNoSelectionOption: true,
      //   onlyAllowOpenSelection: true
      // } satisfies IRJSFSelectInitialisedUserDataStorageIdWidgetOptions
    },
    boxId: {
      // "ui:title": "Box",
      "ui:widget": "hidden"
      // "ui:widget": RJSFSelectAvailableUserDataBoxIdWidget,
      // "ui:options": {
      //   showNoSelectionOption: true,
      //   formContextOptions: {
      //     selectedUserDataStorageIdFormContext: { use: true, disableWhenNoSelection: true }
      //   }
      // } satisfies IRJSFSelectAvailableUserDataBoxIdWidgetOptions
    },
    templateId: {
      // "ui:title": "Template",
      "ui:widget": "hidden"
      // "ui:widget": RJSFSelectAvailableUserDataTemplateIdWidget,
      // "ui:options": {
      //   showNoSelectionOption: true,
      //   formContextOptions: {
      //     selectedUserDataStorageIdFormContext: { use: true, disableWhenNoSelection: true },
      //     selectedUserDataBoxIdFormContext: { use: true, disableWhenNoSelection: true }
      //   }
      // } satisfies IRJSFSelectAvailableUserDataTemplateIdWidgetOptions
    },
    data: {
      "ui:title": "Data",
      // "ui:label": false,
      ...DATA_UI_SCHEMA_FIELDS
    }
  } satisfies UiSchema<IUserDataEntryCreateInput>;
};
