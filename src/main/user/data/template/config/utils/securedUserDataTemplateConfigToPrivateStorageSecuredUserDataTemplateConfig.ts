import { LogFunctions } from "electron-log";
import { ISecuredUserDataTemplateConfig } from "../SecuredUserDataTemplateConfig";
import { IPrivateStorageSecuredUserDataTemplateConfig } from "../PrivateStorageSecuredUserDataTemplateConfig";

export const securedUserDataTemplateConfigToPrivateStorageSecuredUserDataTemplateConfig = (
  securedUserDataTemplateConfig: ISecuredUserDataTemplateConfig,
  logger: LogFunctions | null
): IPrivateStorageSecuredUserDataTemplateConfig => {
  logger?.debug("Converting Secured User Data Template Config to Private Storage Secured User Data Template Config.");
  return {
    name: securedUserDataTemplateConfig.name,
    description: securedUserDataTemplateConfig.description,
    fields: securedUserDataTemplateConfig.fields
  } satisfies IPrivateStorageSecuredUserDataTemplateConfig;
};
