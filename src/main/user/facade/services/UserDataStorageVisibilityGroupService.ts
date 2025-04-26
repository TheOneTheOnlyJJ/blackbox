import { LogFunctions } from "electron-log";
import { timingSafeEqual, UUID } from "node:crypto";
import { ISecuredUserDataStorageVisibilityGroupConfig } from "@main/user/data/storage/visibilityGroup/config/SecuredUserDataStorageVisibilityGroupConfig";
import { IUserAccountStorageUserDataStorageVisibilityGroupFilter } from "@main/user/account/storage/backend/BaseUserAccountStorageBackend";
import { IStorageSecuredUserDataStorageVisibilityGroupConfig } from "@main/user/data/storage/visibilityGroup/config/StorageSecuredUserDataStorageVisibilityGroupConfig";
import { storageSecuredUserDataStorageVisibilityGroupConfigToSecuredUserDataStorageVisibilityGroupConfig } from "@main/user/data/storage/visibilityGroup/config/utils/storageSecuredUserDataStorageVisibilityGroupConfigToSecuredUserDataStorageVisibilityGroupConfig";
import {
  IUserDataStorageVisibilityGroupConfig,
  USER_DATA_STORAGE_VISIBILITY_GROUP_CONFIG_CONSTANTS
} from "@main/user/data/storage/visibilityGroup/config/UserDataStorageVisibilityGroupConfig";
import { userDataStorageVisibilityGroupConfigToSecuredUserDataStorageVisibilityGroupConfig } from "@main/user/data/storage/visibilityGroup/config/utils/userDataStorageVisibilityGroupConfigToSecuredUserDataStorageVisibilityGroupConfig";
import { SALT_LENGTH_BYTES } from "@main/utils/encryption/constants";
import { IUserDataStorageVisibilityGroupsOpenRequest } from "@main/user/data/storage/visibilityGroup/openRequest/UserDataStorageVisibilityGroupsOpenRequest";
import { IUserDataStorageVisibilityGroupInfo } from "@shared/user/data/storage/visibilityGroup/info/UserDataStorageVisibilityGroupInfo";
import { hashPassword } from "@main/utils/encryption/hashPassword";
import { deriveAESKey } from "@main/utils/encryption/deriveAESKey";
import { IUserDataStorageVisibilityGroup } from "@main/user/data/storage/visibilityGroup/UserDataStorageVisibilityGroup";
import { ISignedInUser } from "@main/user/account/SignedInUser";
import { userDataStorageVisibilityGroupToUserDataStorageVisibilityGroupInfo } from "@main/user/data/storage/visibilityGroup/utils/userDataStorageVisibilityGroupToUserDataStorageVisibilityGroupInfo";
import { IUserDataStorageVisibilityGroupConfigCreateDTO } from "@shared/user/data/storage/visibilityGroup/config/create/DTO/UserDataStorageVisibilityGroupConfigCreateDTO";
import { userDataStorageVisibilityGroupConfigCreateDTOToUserDataStorageVisibilityGroupConfig } from "@main/user/data/storage/visibilityGroup/config/utils/userDataStorageVisibilityGroupConfigCreateDTOToUserDataStorageVisibilityGroupConfig";
import { IUserDataStorageVisibilityGroupsOpenRequestDTO } from "@shared/user/data/storage/visibilityGroup/openRequest/DTO/UserDataStorageVisibilityGroupsOpenRequestDTO";
import { userDataStorageVisibilityGroupsOpenRequestDTOToUserDataStorageVisibilityGroupsOpenRequest } from "@main/user/data/storage/visibilityGroup/openRequest/utils/userDataStorageVisibilityGroupsOpenRequestDTOToUserDataStorageVisibilityGroupsOpenRequest";

export interface IUserDataStorageVisibilityGroupServiceContext {
  isAccountStorageSet: () => boolean;
  generateRandomUserDataStorageVisibilityGroupId: () => UUID;
  getStorageSecuredUserDataStorageVisibilityGroupConfigs: (
    filter: IUserAccountStorageUserDataStorageVisibilityGroupFilter
  ) => IStorageSecuredUserDataStorageVisibilityGroupConfig[];
  isUserIdAvailable: (userId: UUID) => boolean;
  addSecuredUserDataStorageVisibilityGroupConfig: (
    securedUserDataStorageVisibilityGroupConfig: ISecuredUserDataStorageVisibilityGroupConfig,
    encryptionKey: Buffer
  ) => boolean;
  getSignedInUser: () => Readonly<ISignedInUser> | null;
  getOpenDataStorageVisibilityGroups: () => IUserDataStorageVisibilityGroup[];
  addOpenDataStorageVisibilityGroups: (newVisibilityGroups: IUserDataStorageVisibilityGroup[]) => number;
  removeOpenDataStorageVisibilityGroups: (visibilityGroupIds: UUID[]) => number;
}

export class UserDataStorageVisibilityGroupService {
  private readonly logger: LogFunctions;
  private readonly CONTEXT: IUserDataStorageVisibilityGroupServiceContext;

  public constructor(logger: LogFunctions, context: IUserDataStorageVisibilityGroupServiceContext) {
    this.logger = logger;
    this.logger.debug("Initialising new User Data Storage Visibility Group Service.");
    this.CONTEXT = context;
  }

  public generateRandomDataStorageVisibilityGroupId(): UUID {
    this.logger.debug("Generating random User Data Storage Visibility Group ID.");
    return this.CONTEXT.generateRandomUserDataStorageVisibilityGroupId();
  }

  public isDataStorageVisibilityGroupNameAvailableForSignedInUser(name: string): boolean {
    this.logger.debug(`Getting User Data Storage Visibility Group name "${name}" availability for signed in user.`);
    const SIGNED_IN_USER: Readonly<ISignedInUser> | null = this.CONTEXT.getSignedInUser();
    if (SIGNED_IN_USER === null) {
      throw new Error("No signed in user");
    }
    return this.isDataStorageVisibilityGroupNameAvailableForUserId(name, SIGNED_IN_USER.userId, SIGNED_IN_USER.userDataAESKey);
  }

  public isDataStorageVisibilityGroupNameAvailableForUserId(name: string, userId: UUID, AESKey: Buffer): boolean {
    this.logger.debug(`Getting User Data Storage Visibility Group name "${name}" availability for user "${userId}".`);
    if (!this.CONTEXT.isAccountStorageSet()) {
      throw new Error("Null User Account Storage");
    }
    // There is no method to directly get this from the account storage because it is encrypted
    const SECURED_VISIBILITY_GROUP_CONFIGS: ISecuredUserDataStorageVisibilityGroupConfig[] = this.getSecuredDataStorageVisibilityGroupConfigs(
      {
        userId: userId,
        includeIds: "all",
        excludeIds: null
      },
      AESKey
    );
    for (const SECURED_VISIBILITY_GROUP of SECURED_VISIBILITY_GROUP_CONFIGS) {
      if (SECURED_VISIBILITY_GROUP.name === name) {
        return false;
      }
    }
    return true;
  }

  public getSecuredDataStorageVisibilityGroupConfigs(
    filter: IUserAccountStorageUserDataStorageVisibilityGroupFilter,
    AESKey: Buffer
  ): ISecuredUserDataStorageVisibilityGroupConfig[] {
    if (filter.includeIds === "all") {
      this.logger.debug(`Getting all Secured User Data Storage Visibility Group Configs for user "${filter.userId}".`);
    } else {
      this.logger.debug(
        `Getting ${filter.includeIds.length.toString()} Secured User Data Storage Visibility Group Configs for user "${filter.userId}".`
      );
    }
    if (!this.CONTEXT.isAccountStorageSet()) {
      throw new Error("Null User Account Storage");
    }
    const STORAGE_SECURED_USER_DATA_STORAGE_VISIBILITY_GROUP_CONFIGS: IStorageSecuredUserDataStorageVisibilityGroupConfig[] =
      this.CONTEXT.getStorageSecuredUserDataStorageVisibilityGroupConfigs(filter);
    return STORAGE_SECURED_USER_DATA_STORAGE_VISIBILITY_GROUP_CONFIGS.map(
      (
        storageSecuredUserDataStorageVisibilityGroupConfig: IStorageSecuredUserDataStorageVisibilityGroupConfig
      ): ISecuredUserDataStorageVisibilityGroupConfig => {
        return storageSecuredUserDataStorageVisibilityGroupConfigToSecuredUserDataStorageVisibilityGroupConfig(
          storageSecuredUserDataStorageVisibilityGroupConfig,
          AESKey,
          null
        );
      }
    );
  }

  public addUserDataStorageVisibilityGroupConfigFromCreateDTO(
    dataStorageVisibilityGroupConfigCreateDTO: IUserDataStorageVisibilityGroupConfigCreateDTO
  ): boolean {
    return this.addUserDataStorageVisibilityGroupConfig(
      userDataStorageVisibilityGroupConfigCreateDTOToUserDataStorageVisibilityGroupConfig(
        dataStorageVisibilityGroupConfigCreateDTO,
        this.generateRandomDataStorageVisibilityGroupId(),
        USER_DATA_STORAGE_VISIBILITY_GROUP_CONFIG_CONSTANTS.AESKeySalt.lengthBytes,
        this.logger
      )
    );
  }

  public addUserDataStorageVisibilityGroupConfig(dataStorageVisibilityGroupConfig: IUserDataStorageVisibilityGroupConfig): boolean {
    this.logger.debug(`Adding User Data Storage Visibility Group Config to user: "${dataStorageVisibilityGroupConfig.userId}".`);
    if (!this.CONTEXT.isAccountStorageSet()) {
      throw new Error("Null User Account Storage");
    }
    const SIGNED_IN_USER: Readonly<ISignedInUser> | null = this.CONTEXT.getSignedInUser();
    if (SIGNED_IN_USER === null) {
      throw new Error("Cannot encrypt Secured User Data Storage Visibility Group Config with no signed in user");
    }
    if (SIGNED_IN_USER.userId !== dataStorageVisibilityGroupConfig.userId) {
      throw new Error(
        `User Data Storage Visibility Group Config user ID "${dataStorageVisibilityGroupConfig.userId}" does not match signed in user ID "${SIGNED_IN_USER.userId}"`
      );
    }
    // TODO: Delete this check?
    if (this.CONTEXT.isUserIdAvailable(dataStorageVisibilityGroupConfig.userId)) {
      throw new Error(
        `Cannot add User Data Storage Visibility Group Config to user "${dataStorageVisibilityGroupConfig.userId}" because it does not exist`
      );
    }
    const SECURED_USER_DATA_STORAGE_VISIBILITY_GROUP_CONFIG: ISecuredUserDataStorageVisibilityGroupConfig =
      userDataStorageVisibilityGroupConfigToSecuredUserDataStorageVisibilityGroupConfig(
        dataStorageVisibilityGroupConfig,
        SALT_LENGTH_BYTES,
        (visibilityPassword: string, visibilityPasswordSalt: Buffer): string => {
          return hashPassword(visibilityPassword, visibilityPasswordSalt, this.logger, "User Data Storage Visibility Group Config").toString(
            "base64"
          );
        },
        this.logger
      );
    return this.CONTEXT.addSecuredUserDataStorageVisibilityGroupConfig(
      SECURED_USER_DATA_STORAGE_VISIBILITY_GROUP_CONFIG,
      SIGNED_IN_USER.userDataAESKey
    );
  }

  public openUserDataStorageVisibilityGroupsFromOpenRequestDTO(
    userDataStorageVisibilityGroupOpenRequestDTO: IUserDataStorageVisibilityGroupsOpenRequestDTO
  ): number {
    return this.openUserDataStorageVisibilityGroups(
      userDataStorageVisibilityGroupsOpenRequestDTOToUserDataStorageVisibilityGroupsOpenRequest(
        userDataStorageVisibilityGroupOpenRequestDTO,
        this.logger
      )
    );
  }

  public openUserDataStorageVisibilityGroups(openRequest: IUserDataStorageVisibilityGroupsOpenRequest): number {
    this.logger.debug(`Opening User Data Storage Visibility Groups for user: "${openRequest.userIdToOpenFor}".`);
    if (!this.CONTEXT.isAccountStorageSet()) {
      throw new Error("Null User Account Storage");
    }
    const SIGNED_IN_USER: Readonly<ISignedInUser> | null = this.CONTEXT.getSignedInUser();
    if (SIGNED_IN_USER === null) {
      throw new Error("No signed in user");
    }
    if (SIGNED_IN_USER.userId !== openRequest.userIdToOpenFor) {
      throw new Error(
        `User Data Storage Visibility Group Open Request user ID "${openRequest.userIdToOpenFor}" does not match signed in user ID "${SIGNED_IN_USER.userId}"`
      );
    }
    // TODO: Delete this?
    if (this.CONTEXT.isUserIdAvailable(openRequest.userIdToOpenFor)) {
      throw new Error(`Cannot open User Data Storage Visibility Groups for user "${openRequest.userIdToOpenFor}" because it does not exist`);
    }
    const EXCLUDE_VISIBILITY_GROUP_IDS: UUID[] = this.CONTEXT.getOpenDataStorageVisibilityGroups().map(
      (visibilityGroup: IUserDataStorageVisibilityGroup): UUID => {
        return visibilityGroup.visibilityGroupId;
      }
    );
    const NOT_OPEN_SECURED_VISIBILITY_GROUP_CONFIGS: ISecuredUserDataStorageVisibilityGroupConfig[] =
      this.getSecuredDataStorageVisibilityGroupConfigs(
        {
          userId: SIGNED_IN_USER.userId,
          includeIds: "all",
          excludeIds: EXCLUDE_VISIBILITY_GROUP_IDS.length > 0 ? EXCLUDE_VISIBILITY_GROUP_IDS : null
        },
        SIGNED_IN_USER.userDataAESKey
      );
    const NEWLY_OPENED_USER_DATA_STORAGE_VISIBILITY_GROUPS: IUserDataStorageVisibilityGroup[] = [];
    // Try to match passwords for every secured user data storage visibility group
    NOT_OPEN_SECURED_VISIBILITY_GROUP_CONFIGS.map((securedDataStorageVisibilityGroupConfig: ISecuredUserDataStorageVisibilityGroupConfig): void => {
      const ATTEMPTED_PASSWORD_HASH: Buffer = hashPassword(
        openRequest.password,
        Buffer.from(securedDataStorageVisibilityGroupConfig.securedPassword.salt, "base64"),
        null
      );
      if (timingSafeEqual(ATTEMPTED_PASSWORD_HASH, Buffer.from(securedDataStorageVisibilityGroupConfig.securedPassword.hash, "base64"))) {
        // Add to open user data storage visibility groups
        NEWLY_OPENED_USER_DATA_STORAGE_VISIBILITY_GROUPS.push({
          // TODO: Make a conversion function here
          visibilityGroupId: securedDataStorageVisibilityGroupConfig.visibilityGroupId,
          userId: securedDataStorageVisibilityGroupConfig.userId,
          name: securedDataStorageVisibilityGroupConfig.name,
          description: securedDataStorageVisibilityGroupConfig.description,
          AESKey: deriveAESKey(openRequest.password, Buffer.from(securedDataStorageVisibilityGroupConfig.AESKeySalt, "base64"), null)
        });
      }
    });
    this.logger.debug(
      `Opened ${NEWLY_OPENED_USER_DATA_STORAGE_VISIBILITY_GROUPS.length.toString()} User Data Storage Visibility Group${
        NEWLY_OPENED_USER_DATA_STORAGE_VISIBILITY_GROUPS.length === 1 ? "" : "s"
      }.`
    );
    return this.CONTEXT.addOpenDataStorageVisibilityGroups(NEWLY_OPENED_USER_DATA_STORAGE_VISIBILITY_GROUPS);
  }

  public closeUserDataStorageVisibilityGroups(visibilityGroupIds: UUID[]): number {
    this.logger.debug(`Closing User Data Storage Visibility Groups. Count: ${visibilityGroupIds.length.toString()}.`);
    return this.CONTEXT.removeOpenDataStorageVisibilityGroups(visibilityGroupIds);
  }

  public getAllSignedInUserOpenUserDataStorageVisibilityGroupsInfo(): IUserDataStorageVisibilityGroupInfo[] {
    this.logger.debug("Getting all signed in user's open User Data Storage Visibility Groups Info.");
    const OPEN_DATA_STORAGE_VISIBILITY_GROUPS: IUserDataStorageVisibilityGroup[] = this.CONTEXT.getOpenDataStorageVisibilityGroups();
    if (OPEN_DATA_STORAGE_VISIBILITY_GROUPS.length === 0) {
      this.logger.debug("No open User Data Storage Visibility Groups.");
      return [];
    }
    return OPEN_DATA_STORAGE_VISIBILITY_GROUPS.map((visibilityGroup: IUserDataStorageVisibilityGroup): IUserDataStorageVisibilityGroupInfo => {
      return userDataStorageVisibilityGroupToUserDataStorageVisibilityGroupInfo(visibilityGroup, null);
    });
  }
}
