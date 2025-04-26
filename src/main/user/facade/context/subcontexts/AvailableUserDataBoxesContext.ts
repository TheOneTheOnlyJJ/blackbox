import { isValidUserDataBoxArray, IUserDataBox } from "@main/user/data/box/UserDataBox";
import { isUserDataBoxIdentifierMatchingUserDataBox } from "@main/user/data/box/utils/isUserDataBoxIdentifierMatchingUserDataBox";
import { userDataBoxToUserDataBoxIdentifier } from "@main/user/data/box/utils/userDataBoxToUserDataBoxIdentifier";
import { isValidUserDataBoxIdentifierArray, IUserDataBoxIdentifier } from "@shared/user/data/box/identifier/UserDataBoxIdentifier";
import { IDataChangedDiff } from "@shared/utils/DataChangedDiff";
import { LogFunctions } from "electron-log";

const INITIAL_AVAILABLE_DATA_BOXES: IUserDataBox[] = [];

export class AvailableUserDataBoxesContext {
  private readonly logger: LogFunctions;

  // TODO: Replace with Map
  private availableDataBoxes: IUserDataBox[];

  public onAvailableDataBoxesChangedCallback:
    | ((availableDataBoxesChangedDiff: IDataChangedDiff<IUserDataBoxIdentifier, IUserDataBox>) => void)
    | null;

  public constructor(logger: LogFunctions) {
    this.logger = logger;
    this.logger.info("Initialising new Available User Data Boxes Context.");
    this.availableDataBoxes = INITIAL_AVAILABLE_DATA_BOXES;
    this.onAvailableDataBoxesChangedCallback = null;
  }

  public getAvailableDataBoxes(): IUserDataBox[] {
    this.logger.info("Getting available User Data Boxes.");
    return this.availableDataBoxes;
  }

  public addAvailableDataBoxes(newDataBoxes: IUserDataBox[]): number {
    this.logger.info(`Adding ${newDataBoxes.length.toString()} new available User Data Box${newDataBoxes.length === 1 ? "" : "es"}.`);
    if (!isValidUserDataBoxArray(newDataBoxes)) {
      throw new Error("Invalid newly available User Data Boxes array");
    }
    if (newDataBoxes.length === 0) {
      this.logger.warn("Given no new User Data Boxes to add.");
      return 0;
    }
    const DATA_BOXES_TO_ADD: IUserDataBox[] = newDataBoxes.filter((newDataBox: IUserDataBox): boolean => {
      const NEW_DATA_BOX_IDENTIFIER: IUserDataBoxIdentifier = userDataBoxToUserDataBoxIdentifier(newDataBox, null);
      const IS_ALREADY_AVAILABLE: boolean = this.availableDataBoxes.some((availableDataBox: IUserDataBox): boolean => {
        return isUserDataBoxIdentifierMatchingUserDataBox(NEW_DATA_BOX_IDENTIFIER, availableDataBox);
      });
      if (IS_ALREADY_AVAILABLE) {
        this.logger.warn(`Skip adding already available given User Data Box ${JSON.stringify(NEW_DATA_BOX_IDENTIFIER, null, 2)}.`);
      }
      return !IS_ALREADY_AVAILABLE; // Only keep new data boxes that are NOT already available
    });
    this.availableDataBoxes.push(...DATA_BOXES_TO_ADD);
    this.logger.info(`Added ${DATA_BOXES_TO_ADD.length.toString()} new available User Data Box${DATA_BOXES_TO_ADD.length === 1 ? "" : "es"}.`);
    if (DATA_BOXES_TO_ADD.length > 0) {
      this.onAvailableDataBoxesChangedCallback?.({
        removed: [],
        added: DATA_BOXES_TO_ADD
      } satisfies IDataChangedDiff<IUserDataBoxIdentifier, IUserDataBox>);
    }
    return DATA_BOXES_TO_ADD.length;
  }

  public removeAvailableDataBoxes(dataBoxIdentifiers: IUserDataBoxIdentifier[]): number {
    this.logger.info(`Removing ${dataBoxIdentifiers.length.toString()} available User Data Box${dataBoxIdentifiers.length === 1 ? "" : "es"}.`);
    if (this.availableDataBoxes.length === 0) {
      this.logger.info("No available User Data Boxes to remove from.");
      return 0;
    }
    if (!isValidUserDataBoxIdentifierArray(dataBoxIdentifiers)) {
      throw new Error("Invalid User Data Box Identifier array");
    }
    if (dataBoxIdentifiers.length === 0) {
      this.logger.warn("Given no User Data Box Identifiers to remove.");
      return 0;
    }
    const DATA_BOX_IDENTIFIERS_TO_REMOVE: IUserDataBoxIdentifier[] = dataBoxIdentifiers.filter(
      (dataBoxIdentifier: IUserDataBoxIdentifier): boolean => {
        const MATCHING_DATA_BOXES: IUserDataBoxIdentifier[] = this.availableDataBoxes.filter((availableDataBox: IUserDataBox): boolean => {
          return isUserDataBoxIdentifierMatchingUserDataBox(dataBoxIdentifier, availableDataBox);
        });
        if (MATCHING_DATA_BOXES.length === 0) {
          this.logger.warn(`Skip removing unavailable given User Data Box ${JSON.stringify(dataBoxIdentifier, null, 2)}.`);
          return false;
        }
        if (MATCHING_DATA_BOXES.length > 1) {
          throw new Error(
            `User Data Box Identifier ${JSON.stringify(
              dataBoxIdentifier,
              null,
              2
            )} matched multiple User Data Boxes (${MATCHING_DATA_BOXES.length.toString()})`
          );
        }
        return true;
      }
    );
    for (let idx = this.availableDataBoxes.length - 1; idx >= 0; idx--) {
      const AVAILABLE_DATA_BOX: IUserDataBox = this.availableDataBoxes[idx];
      for (const IDENTIFIER_TO_REMOVE of DATA_BOX_IDENTIFIERS_TO_REMOVE) {
        if (isUserDataBoxIdentifierMatchingUserDataBox(IDENTIFIER_TO_REMOVE, AVAILABLE_DATA_BOX)) {
          this.availableDataBoxes.splice(idx, 1);
          break;
        }
      }
    }
    this.logger.info(
      `Removed ${DATA_BOX_IDENTIFIERS_TO_REMOVE.length.toString()} available User Data Box${DATA_BOX_IDENTIFIERS_TO_REMOVE.length === 1 ? "" : "es"}.`
    );
    if (DATA_BOX_IDENTIFIERS_TO_REMOVE.length > 0) {
      this.onAvailableDataBoxesChangedCallback?.({
        removed: DATA_BOX_IDENTIFIERS_TO_REMOVE,
        added: []
      } satisfies IDataChangedDiff<IUserDataBoxIdentifier, IUserDataBox>);
    }
    return DATA_BOX_IDENTIFIERS_TO_REMOVE.length;
  }

  public clearAllAvailableDataBoxes(): number {
    this.logger.info("Clearing all available User Data Boxes.");
    if (this.availableDataBoxes.length === 0) {
      this.logger.info("No available User Data Boxes to clear.");
      return 0;
    }
    const DATA_BOX_IDENTIFIERS_TO_REMOVE: IUserDataBoxIdentifier[] = this.availableDataBoxes.map(
      (availableDataBox: IUserDataBox): IUserDataBoxIdentifier => {
        return userDataBoxToUserDataBoxIdentifier(availableDataBox, null);
      }
    );
    this.availableDataBoxes = [];
    this.logger.info(`Cleared all available User Data Boxes (${DATA_BOX_IDENTIFIERS_TO_REMOVE.length.toString()}).`);
    this.onAvailableDataBoxesChangedCallback?.({
      removed: DATA_BOX_IDENTIFIERS_TO_REMOVE,
      added: []
    } satisfies IDataChangedDiff<IUserDataBoxIdentifier, IUserDataBox>);
    return DATA_BOX_IDENTIFIERS_TO_REMOVE.length;
  }
}
