import { isValidUserDataBoxArray, IUserDataBox } from "@main/user/data/box/UserDataBox";
import { isValidUUIDArray } from "@main/utils/dataValidation/isValidUUID";
import { IUserDataBoxInfo } from "@shared/user/data/box/info/UserDataBoxInfo";
import { IDataChangedDiff } from "@shared/utils/DataChangedDiff";
import { LogFunctions } from "electron-log";
import { UUID } from "node:crypto";

const INITIAL_AVAILABLE_DATA_BOXES: IUserDataBox[] = [];

export class AvailableUserDataBoxesContext {
  private readonly logger: LogFunctions;

  // TODO: Replace with Map
  private availableDataBoxes: IUserDataBox[];

  public onAvailableDataBoxesChangedCallback: ((availableDataBoxesChangedDiff: IDataChangedDiff<UUID, IUserDataBoxInfo>) => void) | null;

  public constructor(logger: LogFunctions) {
    this.logger = logger;
    this.logger.info("Initialising new Available User Data Boxes Context.");
    this.availableDataBoxes = INITIAL_AVAILABLE_DATA_BOXES;
    this.onAvailableDataBoxesChangedCallback = null;
  }

  // TODO: Implement this further; add, remove, clear, in delete function of Facade, add when new box is added to storage
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
      const IS_ALREADY_AVAILABLE: boolean = this.availableDataBoxes.some((availableDataBox: IUserDataBox): boolean => {
        return newDataBox.boxId === availableDataBox.boxId;
      });
      if (IS_ALREADY_AVAILABLE) {
        this.logger.warn(`Skip adding already available given User Data Box "${newDataBox.boxId}".`);
      }
      return !IS_ALREADY_AVAILABLE; // Only keep new data boxes that are NOT already available
    });
    this.availableDataBoxes.push(...DATA_BOXES_TO_ADD);
    this.logger.info(`Added ${DATA_BOXES_TO_ADD.length.toString()} new available User Data Box${DATA_BOXES_TO_ADD.length === 1 ? "" : "es"}.`);
    if (DATA_BOXES_TO_ADD.length > 0) {
      this.onAvailableDataBoxesChangedCallback?.({
        removed: [],
        added: DATA_BOXES_TO_ADD
      } satisfies IDataChangedDiff<UUID, IUserDataBox>);
    }
    return DATA_BOXES_TO_ADD.length;
  }

  public removeAvailableDataBoxes(dataBoxIds: UUID[]): number {
    this.logger.info(`Removing ${dataBoxIds.length.toString()} available User Data Box${dataBoxIds.length === 1 ? "" : "es"}.`);
    if (this.availableDataBoxes.length === 0) {
      this.logger.info("No available User Data Boxes to remove from.");
      return 0;
    }
    if (!isValidUUIDArray(dataBoxIds)) {
      throw new Error("Invalid User Data Box ID array");
    }
    if (dataBoxIds.length === 0) {
      this.logger.warn("Given no User Data Box IDs to remove.");
      return 0;
    }
    const DATA_BOX_IDS_TO_REMOVE: UUID[] = dataBoxIds.filter((dataBoxId: UUID): boolean => {
      const IS_AVAILABLE: boolean = this.availableDataBoxes.some((availableDataBox: IUserDataBox): boolean => {
        return dataBoxId === availableDataBox.boxId;
      });
      if (!IS_AVAILABLE) {
        this.logger.warn(`Skip removing unavailable given User Data Box "${dataBoxId}".`);
      }
      return IS_AVAILABLE;
    });
    for (let idx = this.availableDataBoxes.length - 1; idx >= 0; idx--) {
      const AVAILABLE_DATA_BOX: IUserDataBox = this.availableDataBoxes[idx];
      if (DATA_BOX_IDS_TO_REMOVE.includes(AVAILABLE_DATA_BOX.boxId)) {
        this.availableDataBoxes.splice(idx, 1); // Remove from array in-place
      }
    }
    this.logger.info(
      `Removed ${DATA_BOX_IDS_TO_REMOVE.length.toString()} available User Data Box${DATA_BOX_IDS_TO_REMOVE.length === 1 ? "" : "es"}.`
    );
    if (DATA_BOX_IDS_TO_REMOVE.length > 0) {
      this.onAvailableDataBoxesChangedCallback?.({
        removed: DATA_BOX_IDS_TO_REMOVE,
        added: []
      } satisfies IDataChangedDiff<UUID, IUserDataBox>);
    }
    return DATA_BOX_IDS_TO_REMOVE.length;
  }

  public clearAllAvailableDataBoxes(): number {
    this.logger.info("Clearing all available User Data Boxes.");
    if (this.availableDataBoxes.length === 0) {
      this.logger.info("No available User Data Boxes to clear.");
      return 0;
    }
    const DATA_BOX_IDS_TO_REMOVE: UUID[] = this.availableDataBoxes.map((availableDataBox: IUserDataBox): UUID => {
      return availableDataBox.boxId;
    });
    this.availableDataBoxes = [];
    this.logger.info(`Cleared all available User Data Boxes (${DATA_BOX_IDS_TO_REMOVE.length.toString()}).`);
    this.onAvailableDataBoxesChangedCallback?.({
      removed: DATA_BOX_IDS_TO_REMOVE,
      added: []
    } satisfies IDataChangedDiff<UUID, IUserDataBox>);
    return DATA_BOX_IDS_TO_REMOVE.length;
  }
}
