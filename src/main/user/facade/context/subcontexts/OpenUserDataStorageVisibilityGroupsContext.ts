import {
  isValidUserDataStorageVisibilityGroupArray,
  IUserDataStorageVisibilityGroup
} from "@main/user/data/storage/visibilityGroup/UserDataStorageVisibilityGroup";
import { isValidUUIDArray } from "@main/utils/dataValidation/isValidUUID";
import { IDataChangedDiff } from "@shared/utils/DataChangedDiff";
import { LogFunctions } from "electron-log";
import { UUID } from "node:crypto";

const INITIAL_OPEN_DATA_STORAGE_VISIBILITY_GROUPS: IUserDataStorageVisibilityGroup[] = [];

export class OpenUserDataStorageVisibilityGroupsContext {
  private readonly logger: LogFunctions;

  // TODO: Replace with Map
  private openDataStorageVisibilityGroups: IUserDataStorageVisibilityGroup[];

  public onOpenUserDataStorageVisibilityGroupsChangedCallback:
    | ((openDataStorageVisibilityGroupsChangedDiff: IDataChangedDiff<UUID, IUserDataStorageVisibilityGroup>) => void)
    | null;

  public constructor(logger: LogFunctions) {
    this.logger = logger;
    this.logger.info("Initialising new Open User Data Storage Visibility Groups Context.");
    this.openDataStorageVisibilityGroups = INITIAL_OPEN_DATA_STORAGE_VISIBILITY_GROUPS;
    this.onOpenUserDataStorageVisibilityGroupsChangedCallback = null;
  }

  public getOpenDataStorageVisibilityGroups(): IUserDataStorageVisibilityGroup[] {
    this.logger.info("Getting open User Data Storage Visibility Groups.");
    return this.openDataStorageVisibilityGroups;
  }

  public addOpenDataStorageVisibilityGroups(newVisibilityGroups: IUserDataStorageVisibilityGroup[]): number {
    this.logger.info(
      `Adding ${newVisibilityGroups.length.toString()} new open User Data Storage Visibility Group${newVisibilityGroups.length === 1 ? "" : "s"}.`
    );
    if (!isValidUserDataStorageVisibilityGroupArray(newVisibilityGroups)) {
      throw new Error("Invalid User Data Storage Visibility Group array!");
    }
    if (newVisibilityGroups.length === 0) {
      this.logger.warn("Given no new User Data Storage Visibility Groups to add.");
      return 0;
    }
    const NEW_VISIBILITY_GROUPS: IUserDataStorageVisibilityGroup[] = newVisibilityGroups.filter(
      (newVisibilityGroup: IUserDataStorageVisibilityGroup): boolean => {
        const IS_ALREADY_OPEN: boolean = this.openDataStorageVisibilityGroups.some(
          (openVisibilityGroup: IUserDataStorageVisibilityGroup): boolean => {
            return newVisibilityGroup.visibilityGroupId === openVisibilityGroup.visibilityGroupId;
          }
        );
        if (IS_ALREADY_OPEN) {
          this.logger.warn(`Skip adding already open User Data Storage Visibility Group "${newVisibilityGroup.visibilityGroupId}".`);
        }
        return !IS_ALREADY_OPEN; // Only keep new data storage visibility groups that are NOT already open
      }
    );
    this.openDataStorageVisibilityGroups.push(...NEW_VISIBILITY_GROUPS);
    this.logger.info(
      `Added ${NEW_VISIBILITY_GROUPS.length.toString()} new open User Data Storage Visibility Group${NEW_VISIBILITY_GROUPS.length === 1 ? "" : "s"}.`
    );
    if (NEW_VISIBILITY_GROUPS.length > 0) {
      this.onOpenUserDataStorageVisibilityGroupsChangedCallback?.({
        removed: [],
        added: NEW_VISIBILITY_GROUPS
      } satisfies IDataChangedDiff<UUID, IUserDataStorageVisibilityGroup>);
    }
    return NEW_VISIBILITY_GROUPS.length;
  }

  public removeOpenDataStorageVisibilityGroups(visibilityGroupIds: UUID[]): number {
    this.logger.info(
      `Removing ${visibilityGroupIds.length.toString()} open User Data Storage Visibility Group${visibilityGroupIds.length === 1 ? "" : "s"}.`
    );
    if (this.openDataStorageVisibilityGroups.length === 0) {
      this.logger.info("No open User Data Storage Visibility Groups to remove from.");
      return 0;
    }
    if (!isValidUUIDArray(visibilityGroupIds)) {
      throw new Error("Invalid User Data Storage Visibility Group ID array");
    }
    if (visibilityGroupIds.length === 0) {
      this.logger.warn("Given no User Data Storage Visibility Group IDs to remove.");
      return 0;
    }
    const VISIBILITY_GROUP_IDS: UUID[] = visibilityGroupIds.filter((visibilityGroupId: UUID): boolean => {
      const IS_OPEN: boolean = this.openDataStorageVisibilityGroups.some((openVisibilityGroup: IUserDataStorageVisibilityGroup): boolean => {
        return visibilityGroupId === openVisibilityGroup.visibilityGroupId;
      });
      if (!IS_OPEN) {
        this.logger.warn(`Skip removing missing given open User Data Storage Visibility Group "${visibilityGroupId}".`);
      }
      return IS_OPEN;
    });
    for (let i = this.openDataStorageVisibilityGroups.length - 1; i >= 0; i--) {
      const OPEN_VISIBILITY_GROUP: IUserDataStorageVisibilityGroup = this.openDataStorageVisibilityGroups[i];
      if (VISIBILITY_GROUP_IDS.includes(OPEN_VISIBILITY_GROUP.visibilityGroupId)) {
        crypto.getRandomValues(OPEN_VISIBILITY_GROUP.AESKey); // Corrupt AES key
        this.openDataStorageVisibilityGroups.splice(i, 1); // Remove from array in-place
      }
    }
    this.logger.info(
      `Removed ${VISIBILITY_GROUP_IDS.length.toString()} available User Data Storage Visibility Group${VISIBILITY_GROUP_IDS.length === 1 ? "" : "s"}.`
    );
    if (VISIBILITY_GROUP_IDS.length > 0) {
      this.onOpenUserDataStorageVisibilityGroupsChangedCallback?.({
        removed: VISIBILITY_GROUP_IDS,
        added: []
      } satisfies IDataChangedDiff<UUID, IUserDataStorageVisibilityGroup>);
    }
    return VISIBILITY_GROUP_IDS.length;
  }

  public clearOpenDataStorageVisibilityGroups(): number {
    this.logger.info("Clearing open User Data Storage Visibility Groups.");
    if (this.openDataStorageVisibilityGroups.length === 0) {
      this.logger.info("No open User Data Storage Visibility Groups to clear.");
      return 0;
    }
    const OPEN_VISIBILITY_GROUP_IDS: UUID[] = this.openDataStorageVisibilityGroups.map(
      (openVisibilityGroup: IUserDataStorageVisibilityGroup): UUID => {
        crypto.getRandomValues(openVisibilityGroup.AESKey);
        return openVisibilityGroup.visibilityGroupId;
      }
    );
    this.openDataStorageVisibilityGroups = [];
    this.logger.info(`Cleared open User Data Storage Visibility Groups (${OPEN_VISIBILITY_GROUP_IDS.length.toString()}).`);
    this.onOpenUserDataStorageVisibilityGroupsChangedCallback?.({
      removed: OPEN_VISIBILITY_GROUP_IDS,
      added: []
    } satisfies IDataChangedDiff<UUID, IUserDataStorageVisibilityGroup>);
    return OPEN_VISIBILITY_GROUP_IDS.length;
  }
}
