import { isValidUserDataEntryArray, IUserDataEntry } from "@main/user/data/entry/UserDataEntry";
import { isUserDataEntryIdentifierMatchingUserDataEntry } from "@main/user/data/entry/utils/isUserDataEntryIdentifierMatchingUserDataEntry";
import { userDataEntryToUserDataEntryIdentifier } from "@main/user/data/entry/utils/userDataEntryToUserDataEntryIdentifier";
import { isValidUserDataEntryIdentifierArray, IUserDataEntryIdentifier } from "@shared/user/data/entry/identifier/UserDataEntryIdentifier";
import { IUserDataTemplateIdentifier } from "@shared/user/data/template/identifier/UserDataTemplateIdentifier";
import { IDataChangedDiff } from "@shared/utils/DataChangedDiff";
import { LogFunctions } from "electron-log";

const INITIAL_AVAILABLE_DATA_ENTRIES: IUserDataEntry[] = [];

export class AvailableUserDataEntriesContext {
  private readonly logger: LogFunctions;

  // TODO: Replace with Map
  private availableDataEntries: IUserDataEntry[];

  public onAvailableDataEntriesChangedCallback:
    | ((availableDataEntriesChangedDiff: IDataChangedDiff<IUserDataEntryIdentifier, IUserDataEntry>) => void)
    | null;

  public constructor(logger: LogFunctions) {
    this.logger = logger;
    this.logger.info("Initialising new Available User Data Entries Context.");
    this.availableDataEntries = INITIAL_AVAILABLE_DATA_ENTRIES;
    this.onAvailableDataEntriesChangedCallback = null;
  }

  public getAvailableDataEntries(): IUserDataEntry[] {
    this.logger.info("Getting available User Data Entries.");
    return this.availableDataEntries;
  }

  public addAvailableDataEntries(newDataEntries: IUserDataEntry[]): number {
    this.logger.info(`Adding ${newDataEntries.length.toString()} new available User Data ${newDataEntries.length === 1 ? "Entry" : "Entries"}.`);
    if (!isValidUserDataEntryArray(newDataEntries)) {
      throw new Error("Invalid newly available User Data Entries array");
    }
    if (newDataEntries.length === 0) {
      this.logger.warn("Given no new User Data Entries to add.");
      return 0;
    }
    const DATA_ENTRIES_TO_ADD: IUserDataEntry[] = newDataEntries.filter((newDataEntry: IUserDataEntry): boolean => {
      const NEW_DATA_ENTRY_IDENTIFIER: IUserDataEntryIdentifier = userDataEntryToUserDataEntryIdentifier(newDataEntry, null);
      const IS_ALREADY_AVAILABLE: boolean = this.availableDataEntries.some((availableDataEntry: IUserDataEntry): boolean => {
        return isUserDataEntryIdentifierMatchingUserDataEntry(NEW_DATA_ENTRY_IDENTIFIER, availableDataEntry);
      });
      if (IS_ALREADY_AVAILABLE) {
        this.logger.warn(`Skip adding already available given User Data Entry ${JSON.stringify(NEW_DATA_ENTRY_IDENTIFIER, null, 2)}.`);
      }
      return !IS_ALREADY_AVAILABLE; // Only keep new data entries that are NOT already available
    });
    this.availableDataEntries.push(...DATA_ENTRIES_TO_ADD);
    this.logger.info(
      `Added ${DATA_ENTRIES_TO_ADD.length.toString()} new available User Data ${DATA_ENTRIES_TO_ADD.length === 1 ? "Entry" : "Entries"}.`
    );
    if (DATA_ENTRIES_TO_ADD.length > 0) {
      this.onAvailableDataEntriesChangedCallback?.({
        removed: [],
        added: DATA_ENTRIES_TO_ADD
      } satisfies IDataChangedDiff<IUserDataEntryIdentifier, IUserDataEntry>);
    }
    return DATA_ENTRIES_TO_ADD.length;
  }

  public removeAvailableDataEntries(dataEntryIdentifiers: IUserDataEntryIdentifier[]): number {
    this.logger.info(
      `Removing ${dataEntryIdentifiers.length.toString()} available User Data ${dataEntryIdentifiers.length === 1 ? "Entry" : "Entries"}.`
    );
    if (this.availableDataEntries.length === 0) {
      this.logger.info("No available User Data Entries to remove from.");
      return 0;
    }
    if (!isValidUserDataEntryIdentifierArray(dataEntryIdentifiers)) {
      throw new Error("Invalid User Data Entry Identifier array");
    }
    if (dataEntryIdentifiers.length === 0) {
      this.logger.warn("Given no User Data Entry Identifiers to remove.");
      return 0;
    }
    const DATA_ENTRY_IDENTIFIERS_TO_REMOVE: IUserDataEntryIdentifier[] = dataEntryIdentifiers.filter(
      (dataEntryIdentifier: IUserDataEntryIdentifier): boolean => {
        const MATCHING_DATA_ENTRIES: IUserDataEntryIdentifier[] = this.availableDataEntries.filter((availableDataEntry: IUserDataEntry): boolean => {
          return isUserDataEntryIdentifierMatchingUserDataEntry(dataEntryIdentifier, availableDataEntry);
        });
        if (MATCHING_DATA_ENTRIES.length === 0) {
          this.logger.warn(`Skip removing unavailable given User Data Entry ${JSON.stringify(dataEntryIdentifier, null, 2)}.`);
          return false;
        }
        if (MATCHING_DATA_ENTRIES.length > 1) {
          throw new Error(
            `User Data Entry Identifier ${JSON.stringify(
              dataEntryIdentifier,
              null,
              2
            )} matched multiple User Data Entries (${MATCHING_DATA_ENTRIES.length.toString()})`
          );
        }
        return true;
      }
    );
    for (let idx = this.availableDataEntries.length - 1; idx >= 0; idx--) {
      const AVAILABLE_DATA_ENTRY: IUserDataEntry = this.availableDataEntries[idx];
      for (const IDENTIFIER_TO_REMOVE of DATA_ENTRY_IDENTIFIERS_TO_REMOVE) {
        if (isUserDataEntryIdentifierMatchingUserDataEntry(IDENTIFIER_TO_REMOVE, AVAILABLE_DATA_ENTRY)) {
          this.availableDataEntries.splice(idx, 1);
          break;
        }
      }
    }
    this.logger.info(
      `Removed ${DATA_ENTRY_IDENTIFIERS_TO_REMOVE.length.toString()} available User Data ${
        DATA_ENTRY_IDENTIFIERS_TO_REMOVE.length === 1 ? "Entry" : "Entries"
      }.`
    );
    if (DATA_ENTRY_IDENTIFIERS_TO_REMOVE.length > 0) {
      this.onAvailableDataEntriesChangedCallback?.({
        removed: DATA_ENTRY_IDENTIFIERS_TO_REMOVE,
        added: []
      } satisfies IDataChangedDiff<IUserDataEntryIdentifier, IUserDataEntry>);
    }
    return DATA_ENTRY_IDENTIFIERS_TO_REMOVE.length;
  }

  public clearAllAvailableDataEntries(): number {
    this.logger.info("Clearing all available User Data Entries.");
    if (this.availableDataEntries.length === 0) {
      this.logger.info("No available User Data Entries to clear.");
      return 0;
    }
    const DATA_ENTRY_IDENTIFIERS_TO_REMOVE: IUserDataEntryIdentifier[] = this.availableDataEntries.map(
      (availableDataEntry: IUserDataEntry): IUserDataEntryIdentifier => {
        return userDataEntryToUserDataEntryIdentifier(availableDataEntry, null);
      }
    );
    this.availableDataEntries = [];
    this.logger.info(`Cleared all available User Data Entries (${DATA_ENTRY_IDENTIFIERS_TO_REMOVE.length.toString()}).`);
    this.onAvailableDataEntriesChangedCallback?.({
      removed: DATA_ENTRY_IDENTIFIERS_TO_REMOVE,
      added: []
    } satisfies IDataChangedDiff<IUserDataEntryIdentifier, IUserDataEntry>);
    return DATA_ENTRY_IDENTIFIERS_TO_REMOVE.length;
  }

  public getAllAvailableUserDataEntryIdentifiersForUserDataTemplateIdentifiers(
    dataTemplateIdentifiers: IUserDataTemplateIdentifier[]
  ): IUserDataEntryIdentifier[] {
    this.logger.info(
      `Getting all available User Data Entry Identifiers for ${dataTemplateIdentifiers.length.toString()} User Data Template Identifier${
        dataTemplateIdentifiers.length === 1 ? "" : "s"
      }.`
    );
    if (this.availableDataEntries.length === 0) {
      return [];
    }
    const DATA_ENTRY_IDENTIFIERS: IUserDataEntryIdentifier[] = [];
    for (const DATA_TEMPLATE_IDENTIFIER of dataTemplateIdentifiers) {
      for (const AVAILABLE_DATA_ENTRY of this.availableDataEntries) {
        // TODO: Is matching identifier function?
        if (
          DATA_TEMPLATE_IDENTIFIER.boxId === AVAILABLE_DATA_ENTRY.boxId &&
          DATA_TEMPLATE_IDENTIFIER.storageId === AVAILABLE_DATA_ENTRY.storageId &&
          DATA_TEMPLATE_IDENTIFIER.templateId === AVAILABLE_DATA_ENTRY.templateId
        ) {
          DATA_ENTRY_IDENTIFIERS.push(userDataEntryToUserDataEntryIdentifier(AVAILABLE_DATA_ENTRY, null));
        }
      }
    }
    return DATA_ENTRY_IDENTIFIERS;
  }
}
