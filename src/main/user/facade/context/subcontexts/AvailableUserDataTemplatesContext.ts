import {
  isValidUserDataTemplateIdentifierArray,
  IUserDataTemplateIdentifier
} from "@shared/user/data/template/identifier/UserDataTemplateIdentifier";
import { isValidUserDataTemplateArray, IUserDataTemplate } from "@main/user/data/template/UserDataTemplate";
import { IDataChangedDiff } from "@shared/utils/DataChangedDiff";
import { LogFunctions } from "electron-log";
import { userDataTemplateToUserDataTemplateIdentifier } from "@main/user/data/template/utils/userDataTemplateToUserDataTemplateIdentifier";
import { isUserDataTemplateIdentifierMatchingUserDataTemplate } from "@main/user/data/template/utils/isUserDataTemplateIdentifierMatchingUserDataTemplate";
import { IUserDataBoxIdentifier } from "@shared/user/data/box/identifier/UserDataBoxIdentifier";

const INITIAL_AVAILABLE_DATA_TEMPLATES: IUserDataTemplate[] = [];

export class AvailableUserDataTemplatesContext {
  private readonly logger: LogFunctions;

  // TODO: Replace with Map
  private availableDataTemplates: IUserDataTemplate[];

  public onAvailableDataTemplatesChangedCallback:
    | ((availableDataTemplatesChangedDiff: IDataChangedDiff<IUserDataTemplateIdentifier, IUserDataTemplate>) => void)
    | null;

  public constructor(logger: LogFunctions) {
    this.logger = logger;
    this.logger.info("Initialising new Available User Data Templates Context.");
    this.availableDataTemplates = INITIAL_AVAILABLE_DATA_TEMPLATES;
    this.onAvailableDataTemplatesChangedCallback = null;
  }

  public getAvailableDataTemplates(): IUserDataTemplate[] {
    this.logger.info("Getting available User Data Templates.");
    return this.availableDataTemplates;
  }

  public addAvailableDataTemplates(newDataTemplates: IUserDataTemplate[]): number {
    this.logger.info(`Adding ${newDataTemplates.length.toString()} new available User Data Template${newDataTemplates.length === 1 ? "" : "s"}.`);
    if (!isValidUserDataTemplateArray(newDataTemplates)) {
      throw new Error("Invalid newly available User Data Templates array");
    }
    if (newDataTemplates.length === 0) {
      this.logger.warn("Given no new User Data Templates to add.");
      return 0;
    }
    const DATA_TEMPLATES_TO_ADD: IUserDataTemplate[] = newDataTemplates.filter((newDataTemplate: IUserDataTemplate): boolean => {
      const NEW_DATA_TEMPLATE_IDENTIFIER: IUserDataTemplateIdentifier = userDataTemplateToUserDataTemplateIdentifier(newDataTemplate, null);
      const IS_ALREADY_AVAILABLE: boolean = this.availableDataTemplates.some((availableDataTemplate: IUserDataTemplate): boolean => {
        return isUserDataTemplateIdentifierMatchingUserDataTemplate(NEW_DATA_TEMPLATE_IDENTIFIER, availableDataTemplate);
      });
      if (IS_ALREADY_AVAILABLE) {
        this.logger.warn(`Skip adding already available given User Data Template ${JSON.stringify(NEW_DATA_TEMPLATE_IDENTIFIER, null, 2)}.`);
      }
      return !IS_ALREADY_AVAILABLE; // Only keep new data templates that are NOT already available
    });
    this.availableDataTemplates.push(...DATA_TEMPLATES_TO_ADD);
    this.logger.info(
      `Added ${DATA_TEMPLATES_TO_ADD.length.toString()} new available User Data Template${DATA_TEMPLATES_TO_ADD.length === 1 ? "" : "s"}.`
    );
    if (DATA_TEMPLATES_TO_ADD.length > 0) {
      this.onAvailableDataTemplatesChangedCallback?.({
        removed: [],
        added: DATA_TEMPLATES_TO_ADD
      } satisfies IDataChangedDiff<IUserDataTemplateIdentifier, IUserDataTemplate>);
    }
    return DATA_TEMPLATES_TO_ADD.length;
  }

  public removeAvailableDataTemplates(dataTemplateIdentifiers: IUserDataTemplateIdentifier[]): number {
    this.logger.info(
      `Removing ${dataTemplateIdentifiers.length.toString()} available User Data Template${dataTemplateIdentifiers.length === 1 ? "" : "s"}.`
    );
    if (this.availableDataTemplates.length === 0) {
      this.logger.info("No available User Data Templates to remove from.");
      return 0;
    }
    if (!isValidUserDataTemplateIdentifierArray(dataTemplateIdentifiers)) {
      throw new Error("Invalid User Data Template Identifier array");
    }
    if (dataTemplateIdentifiers.length === 0) {
      this.logger.warn("Given no User Data Template Identifiers to remove.");
      return 0;
    }
    // TODO: Parse and remove in one pass?
    const DATA_TEMPLATE_IDENTIFIERS_TO_REMOVE: IUserDataTemplateIdentifier[] = dataTemplateIdentifiers.filter(
      (dataTemplateIdentifier: IUserDataTemplateIdentifier): boolean => {
        const MATCHING_DATA_TEMPLATES: IUserDataTemplate[] = this.availableDataTemplates.filter(
          (availableDataTemplate: IUserDataTemplate): boolean => {
            return isUserDataTemplateIdentifierMatchingUserDataTemplate(dataTemplateIdentifier, availableDataTemplate);
          }
        );
        if (MATCHING_DATA_TEMPLATES.length === 0) {
          this.logger.warn(`Skip removing unavailable given User Data Template ${JSON.stringify(dataTemplateIdentifier, null, 2)}.`);
          return false;
        }
        if (MATCHING_DATA_TEMPLATES.length > 1) {
          throw new Error(
            `User Data Template Identifier ${JSON.stringify(
              dataTemplateIdentifier,
              null,
              2
            )} matched multiple User Data Templates (${MATCHING_DATA_TEMPLATES.length.toString()})`
          );
        }
        return true;
      }
    );
    for (let idx = this.availableDataTemplates.length - 1; idx >= 0; idx--) {
      const AVAILABLE_DATA_TEMPLATE: IUserDataTemplate = this.availableDataTemplates[idx];
      for (const IDENTIFIER_TO_REMOVE of DATA_TEMPLATE_IDENTIFIERS_TO_REMOVE) {
        if (isUserDataTemplateIdentifierMatchingUserDataTemplate(IDENTIFIER_TO_REMOVE, AVAILABLE_DATA_TEMPLATE)) {
          this.availableDataTemplates.splice(idx, 1);
          break;
        }
      }
      // TODO: Delete this
      // if (DATA_TEMPLATE_IDENTIFIERS_TO_REMOVE.includes(AVAILABLE_DATA_TEMPLATE.boxId)) {
      //   this.availableDataTemplates.splice(idx, 1); // Remove from array in-place
      // }
    }
    this.logger.info(
      `Removed ${DATA_TEMPLATE_IDENTIFIERS_TO_REMOVE.length.toString()} available User Data Template${
        DATA_TEMPLATE_IDENTIFIERS_TO_REMOVE.length === 1 ? "" : "s"
      }.`
    );
    if (DATA_TEMPLATE_IDENTIFIERS_TO_REMOVE.length > 0) {
      this.onAvailableDataTemplatesChangedCallback?.({
        removed: DATA_TEMPLATE_IDENTIFIERS_TO_REMOVE,
        added: []
      } satisfies IDataChangedDiff<IUserDataTemplateIdentifier, IUserDataTemplate>);
    }
    return DATA_TEMPLATE_IDENTIFIERS_TO_REMOVE.length;
  }

  public clearAllAvailableDataTemplates(): number {
    this.logger.info("Clearing all available User Data Templates.");
    if (this.availableDataTemplates.length === 0) {
      this.logger.info("No available User Data Templates to clear.");
      return 0;
    }
    const DATA_TEMPLATE_IDENTIFIERS_TO_REMOVE: IUserDataTemplateIdentifier[] = this.availableDataTemplates.map(
      (availableDataTemplate: IUserDataTemplate): IUserDataTemplateIdentifier => {
        return userDataTemplateToUserDataTemplateIdentifier(availableDataTemplate, null);
      }
    );
    this.availableDataTemplates = [];
    this.logger.info(`Cleared all available User Data Templates (${DATA_TEMPLATE_IDENTIFIERS_TO_REMOVE.length.toString()}).`);
    this.onAvailableDataTemplatesChangedCallback?.({
      removed: DATA_TEMPLATE_IDENTIFIERS_TO_REMOVE,
      added: []
    } satisfies IDataChangedDiff<IUserDataTemplateIdentifier, IUserDataTemplate>);
    return DATA_TEMPLATE_IDENTIFIERS_TO_REMOVE.length;
  }

  public getAllAvailableUserDataTemplateIdentifiersForUserDataBoxIdentifiers(
    dataBoxIdentifiers: IUserDataBoxIdentifier[]
  ): IUserDataTemplateIdentifier[] {
    this.logger.info(
      `Getting all available User Data Template Identifiers for ${dataBoxIdentifiers.length.toString()} User Data Box Identifier${
        dataBoxIdentifiers.length === 1 ? "" : "s"
      }.`
    );
    if (this.availableDataTemplates.length === 0) {
      return [];
    }
    const DATA_TEMPLATE_IDENTIFIERS: IUserDataTemplateIdentifier[] = [];
    for (const DATA_BOX_IDENTIFIER of dataBoxIdentifiers) {
      for (const AVAILABLE_DATA_TEMPLATE of this.availableDataTemplates) {
        if (DATA_BOX_IDENTIFIER.boxId === AVAILABLE_DATA_TEMPLATE.boxId && DATA_BOX_IDENTIFIER.storageId === AVAILABLE_DATA_TEMPLATE.storageId) {
          DATA_TEMPLATE_IDENTIFIERS.push(userDataTemplateToUserDataTemplateIdentifier(AVAILABLE_DATA_TEMPLATE, null));
        }
      }
    }
    return DATA_TEMPLATE_IDENTIFIERS;
  }
}
