import { LogFunctions } from "electron-log";
import { timingSafeEqual, UUID } from "node:crypto";
import { ISecuredUserDataStorageVisibilityGroupConfig } from "@main/user/data/storage/visibilityGroup/config/SecuredUserDataStorageVisibilityGroupConfig";
import { IDataStorageVisibilityGroupFilter } from "@main/user/account/storage/backend/BaseUserAccountStorageBackend";
import { IStorageSecuredUserDataStorageVisibilityGroupConfig } from "@main/user/data/storage/visibilityGroup/config/StorageSecuredUserDataStorageVisibilityGroupConfig";
import { storageSecuredUserDataStorageVisibilityGroupConfigToSecuredUserDataStorageVisibilityGroupConfig } from "@main/user/data/storage/visibilityGroup/config/utils/storageSecuredUserDataStorageVisibilityGroupConfigToSecuredUserDataStorageVisibilityGroupConfig";
import { ISecuredUserDataStorageConfig } from "@main/user/data/storage/config/SecuredUserDataStorageConfig";
import { securedUserDataStorageConfigToUserDataStorageInfo } from "@main/user/data/storage/config/utils/securedUserDataStorageConfigToUserDataStorageInfo";
import { IUserDataStoragesInfoChangedDiff } from "@shared/user/data/storage/info/UserDataStoragesInfoChangedDiff";
import { IUserDataStorageVisibilityGroupConfig } from "@main/user/data/storage/visibilityGroup/config/UserDataStorageVisibilityGroupConfig";
import { userDataStorageVisibilityGroupConfigToSecuredUserDataStorageVisibilityGroupConfig } from "@main/user/data/storage/visibilityGroup/config/utils/userDataStorageVisibilityGroupConfigToSecuredUserDataStorageVisibilityGroupConfig";
import { PASSWORD_SALT_LENGTH_BYTES } from "@main/utils/encryption/constants";
import { securedUserDataStorageVisibilityGroupConfigToStorageSecuredUserDataStorageVisibilityGroupConfig } from "@main/user/data/storage/visibilityGroup/config/utils/securedUserDataStorageVisibilityGroupConfigToStorageSecuredUserDataStorageVisibilityGroupConfig";
import { IUserDataStorageVisibilityGroupsOpenRequest } from "@main/user/data/storage/visibilityGroup/openRequest/UserDataStorageVisibilityGroupsOpenRequest";
import { IUserDataStorageVisibilityGroupInfo } from "@shared/user/data/storage/visibilityGroup/info/UserDataStorageVisibilityGroupInfo";
import { hashPassword } from "@main/utils/encryption/hashPassword";
import { deriveAESKey } from "@main/utils/encryption/deriveAESKey";
import { securedUserDataStorageVisibilityGroupConfigToUserDataStorageVisibilityGroupInfo } from "@main/user/data/storage/visibilityGroup/config/utils/securedUserDataStorageVisibilityGroupConfigToUserDataStorageVisibilityGroupInfo";
import { IUserDataStorageVisibilityGroupsInfoChangedDiff } from "@shared/user/data/storage/visibilityGroup/info/UserDataStorageVisibilityGroupInfoChangedDiff";
import { IUserDataStorageInfo } from "@shared/user/data/storage/info/UserDataStorageInfo";
import { IUserAccountStorageProxy } from "../proxies/UserAccountStorageProxy";
import { ISignedInUserProxy } from "../proxies/SignedInUserProxy";
import { IOpenUserDataStorageVisibilityGroupsProxy } from "../proxies/OpenUserDataStorageVisibilityGroupsProxy";
import { IUserDataStorageVisibilityGroup } from "@main/user/data/storage/visibilityGroup/UserDataStorageVisibilityGroup";
import { ISignedInUser } from "@main/user/account/SignedInUser";
import { UserAccountStorage } from "@main/user/account/storage/UserAccountStorage";
import { userDataStorageVisibilityGroupToUserDataStorageVisibilityGroupInfo } from "@main/user/data/storage/visibilityGroup/utils/userDataStorageVisibilityGroupToUserDataStorageVisibilityGroupInfo";

export interface IUserDataStorageVisibilityGroupServiceContext {
  getAccountStorage: () => UserAccountStorage | null;
  getSignedInUser: () => ISignedInUser | null;
  getOpenDataStorageVisibilityGroups: () => IUserDataStorageVisibilityGroup[];
  addOpenDataStorageVisibilityGroups: (newVisibilityGroups: IUserDataStorageVisibilityGroup[]) => void;
  removeOpenDataStorageVisibilityGroups: (visibilityGroupIds: UUID[]) => number;
}

export class UserDataStorageVisibilityGroupService {
  private logger: LogFunctions;
  private readonly CONTEXT: IUserDataStorageVisibilityGroupServiceContext;

  public constructor(logger: LogFunctions, context: IUserDataStorageVisibilityGroupServiceContext) {
    this.logger = logger;
    this.logger.debug("Initialising new User Data Storage Visibility Group Service.");
    this.CONTEXT = context;
  }

  public generateRandomDataStorageVisibilityGroupId(): UUID {
    this.logger.debug("Generating random User Data Storage Visibility Group ID.");
    const ACCOUNT_STORAGE: UserAccountStorage | null = this.CONTEXT.getAccountStorage();
    if (ACCOUNT_STORAGE === null) {
      throw new Error("Null User Account Storage");
    }
    return ACCOUNT_STORAGE.generateRandomUserDataStorageVisibilityGroupId();
  }

  public isDataStorageVisibilityGroupNameAvailableForSignedInUser(name: string): boolean {
    this.logger.debug(`Getting User Data Storage Visibility Group name "${name}" availability for signed in user.`);
    const SIGNED_IN_USER: ISignedInUser | null = this.CONTEXT.getSignedInUser();
    if (SIGNED_IN_USER === null) {
      throw new Error("No signed in user");
    }
    return this.isDataStorageVisibilityGroupNameAvailableForUserId(name, SIGNED_IN_USER.userId, SIGNED_IN_USER.userDataAESKey);
  }

  public isDataStorageVisibilityGroupNameAvailableForUserId(name: string, userId: UUID, AESKey: Buffer): boolean {
    this.logger.debug(`Getting User Data Storage Visibility Group name "${name}" availability for user "${userId}".`);
    const ACCOUNT_STORAGE: UserAccountStorage | null = this.CONTEXT.getAccountStorage();
    if (ACCOUNT_STORAGE === null) {
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
    options: IDataStorageVisibilityGroupFilter,
    AESKey: Buffer
  ): ISecuredUserDataStorageVisibilityGroupConfig[] {
    if (options.includeIds === "all") {
      this.logger.debug(`Getting all Secured User Data Storage Visibility Group Configs for user "${options.userId}".`);
    } else {
      this.logger.debug(
        `Getting ${options.includeIds.length.toString()} Secured User Data Storage Visibility Group Configs for user "${options.userId}".`
      );
    }
    const ACCOUNT_STORAGE: UserAccountStorage | null = this.CONTEXT.getAccountStorage();
    if (ACCOUNT_STORAGE === null) {
      throw new Error("Null User Account Storage");
    }
    const STORAGE_SECURED_USER_DATA_STORAGE_VISIBILITY_GROUP_CONFIGS: IStorageSecuredUserDataStorageVisibilityGroupConfig[] =
      ACCOUNT_STORAGE.getStorageSecuredUserDataStorageVisibilityGroupConfigs(options);
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

  public addUserDataStorageVisibilityGroupConfig(dataStorageVisibilityGroupConfig: IUserDataStorageVisibilityGroupConfig): boolean {
    this.logger.debug(`Adding User Data Storage Visibility Group Config to user: "${dataStorageVisibilityGroupConfig.userId}".`);
    const ACCOUNT_STORAGE: UserAccountStorage | null = this.CONTEXT.getAccountStorage();
    if (ACCOUNT_STORAGE === null) {
      throw new Error("Null User Account Storage");
    }
    const SIGNED_IN_USER: ISignedInUser | null = this.CONTEXT.getSignedInUser();
    if (SIGNED_IN_USER === null) {
      throw new Error("Cannot encrypt Secured User Data Storage Visibility Group Config with no signed in user");
    }
    if (SIGNED_IN_USER.userId !== dataStorageVisibilityGroupConfig.userId) {
      throw new Error(
        `User Data Storage Visibility Group Config user ID "${dataStorageVisibilityGroupConfig.userId}" does not match signed in user ID "${SIGNED_IN_USER.userId}"`
      );
    }
    // TODO: Delete this check?
    if (ACCOUNT_STORAGE.isUserIdAvailable(dataStorageVisibilityGroupConfig.userId)) {
      throw new Error(
        `Cannot add User Data Storage Visibility Group Config to user "${dataStorageVisibilityGroupConfig.userId}" because it does not exist`
      );
    }
    const SECURED_USER_DATA_STORAGE_VISIBILITY_GROUP_CONFIG: ISecuredUserDataStorageVisibilityGroupConfig =
      userDataStorageVisibilityGroupConfigToSecuredUserDataStorageVisibilityGroupConfig(
        dataStorageVisibilityGroupConfig,
        PASSWORD_SALT_LENGTH_BYTES,
        (visibilityPassword: string, visibilityPasswordSalt: Buffer): string => {
          return hashPassword(visibilityPassword, visibilityPasswordSalt, this.logger, "User Data Storage Visibility Group Config").toString(
            "base64"
          );
        },
        this.logger
      );
    return ACCOUNT_STORAGE.addStorageSecuredUserDataStorageVisibilityGroupConfig(
      securedUserDataStorageVisibilityGroupConfigToStorageSecuredUserDataStorageVisibilityGroupConfig(
        SECURED_USER_DATA_STORAGE_VISIBILITY_GROUP_CONFIG,
        SIGNED_IN_USER.userDataAESKey,
        this.logger
      )
    );
  }

  public openUserDataStorageVisibilityGroups(openRequest: IUserDataStorageVisibilityGroupsOpenRequest): number {
    this.logger.debug(`Opening User Data Storage Visibility Groups for user: "${openRequest.userIdToOpenFor}".`);
    const ACCOUNT_STORAGE: UserAccountStorage | null = this.CONTEXT.getAccountStorage();
    if (ACCOUNT_STORAGE === null) {
      throw new Error("Null User Account Storage");
    }
    const SIGNED_IN_USER: ISignedInUser | null = this.CONTEXT.getSignedInUser();
    if (SIGNED_IN_USER === null) {
      throw new Error("No signed in user");
    }
    if (SIGNED_IN_USER.userId !== openRequest.userIdToOpenFor) {
      throw new Error(
        `User Data Storage Visibility Group Open Request user ID "${openRequest.userIdToOpenFor}" does not match signed in user ID "${SIGNED_IN_USER.userId}"`
      );
    }
    if (ACCOUNT_STORAGE.isUserIdAvailable(openRequest.userIdToOpenFor)) {
      throw new Error(`Cannot open User Data Storage Visibility Groups for user "${openRequest.userIdToOpenFor}" because it does not exist`);
    }
    const OPEN_DATA_STORAGE_VISIBILITY_GROUPS: IUserDataStorageVisibilityGroup[] = this.CONTEXT.getOpenDataStorageVisibilityGroups();
    const NOT_OPEN_SECURED_DATA_STORAGE_VISIBILITY_GROUP_CONFIGS: ISecuredUserDataStorageVisibilityGroupConfig[] =
      this.getSecuredDataStorageVisibilityGroupConfigs(
        {
          userId: SIGNED_IN_USER.userId,
          includeIds: "all",
          excludeIds:
            OPEN_DATA_STORAGE_VISIBILITY_GROUPS.length > 0
              ? OPEN_DATA_STORAGE_VISIBILITY_GROUPS.map((visibilityGroup: IUserDataStorageVisibilityGroup): UUID => {
                  return visibilityGroup.visibilityGroupId;
                })
              : null
        },
        SIGNED_IN_USER.userDataAESKey
      );
    // const NEWLY_OPENED_USER_DATA_STORAGE_VISIBILITY_GROUPS_INFO: IUserDataStorageVisibilityGroupInfo[] = [];
    const NEWLY_OPENED_USER_DATA_STORAGE_VISIBILITY_GROUPS: IUserDataStorageVisibilityGroup[] = [];
    // Try to match passwords for every secured user data storage visibility group
    NOT_OPEN_SECURED_DATA_STORAGE_VISIBILITY_GROUP_CONFIGS.map(
      (securedDataStorageVisibilityGroupConfig: ISecuredUserDataStorageVisibilityGroupConfig): void => {
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
          // this.OPEN_DATA_STORAGE_VISIBILITY_GROUPS.set(
          //   securedDataStorageVisibilityGroupConfig.visibilityGroupId,
          //   deriveAESKey(
          //     dataStorageVisibilityGroupOpenRequest.password,
          //     Buffer.from(securedDataStorageVisibilityGroupConfig.AESKeySalt, "base64"),
          //     null
          //   )
          // );
          // NEWLY_OPENED_USER_DATA_STORAGE_VISIBILITY_GROUPS_INFO.push(
          //   securedUserDataStorageVisibilityGroupConfigToUserDataStorageVisibilityGroupInfo(securedDataStorageVisibilityGroupConfig, null)
          // );
        }
      }
    );
    this.logger.debug(
      `Opened ${NEWLY_OPENED_USER_DATA_STORAGE_VISIBILITY_GROUPS.length.toString()} User Data Storage Visibility Group${
        NEWLY_OPENED_USER_DATA_STORAGE_VISIBILITY_GROUPS.length === 1 ? "" : "s"
      }.`
    );
    this.CONTEXT.addOpenDataStorageVisibilityGroups(NEWLY_OPENED_USER_DATA_STORAGE_VISIBILITY_GROUPS);
    // if (NEWLY_OPENED_USER_DATA_STORAGE_VISIBILITY_GROUPS_INFO.length > 0) {
    //   this.onOpenDataStorageVisibilityGroupsChangedCallback?.({
    //     removed: [],
    //     added: NEWLY_OPENED_USER_DATA_STORAGE_VISIBILITY_GROUPS_INFO
    //   } satisfies IUserDataStorageVisibilityGroupsInfoChangedDiff);
    //   this.onAvailableDataStoragesChangedCallback?.({
    //     removed: [],
    //     added: this.getSignedInUserSecuredUserDataStorageConfigs({
    //       includeIds: "all",
    //       excludeIds: null,
    //       visibilityGroups: {
    //         includeIds: NEWLY_OPENED_USER_DATA_STORAGE_VISIBILITY_GROUPS_INFO.map(
    //           (newlyOpenedVisibilityGroupInfo: IUserDataStorageVisibilityGroupInfo): UUID => {
    //             return newlyOpenedVisibilityGroupInfo.visibilityGroupId as UUID;
    //           }
    //         ),
    //         excludeIds: null
    //       }
    //     }).map((securedUserDataStorageConfig: ISecuredUserDataStorageConfig): IUserDataStorageInfo => {
    //       if (securedUserDataStorageConfig.visibilityGroupId === null) {
    //         throw new Error(
    //           `User Data Storage Config "${securedUserDataStorageConfig.storageId}" extracted from User Account Storage on User Data Storage Visibility Group opening must have non-null Visibility Group ID`
    //         );
    //       }
    //       let visibilityGroupName: string | null = null;
    //       for (const NEWLY_OPENED_VISIBILITY_GROUP of NEWLY_OPENED_USER_DATA_STORAGE_VISIBILITY_GROUPS_INFO) {
    //         if (NEWLY_OPENED_VISIBILITY_GROUP.visibilityGroupId === securedUserDataStorageConfig.visibilityGroupId) {
    //           visibilityGroupName = NEWLY_OPENED_VISIBILITY_GROUP.name;
    //           break;
    //         }
    //       }
    //       if (visibilityGroupName === null) {
    //         throw new Error(
    //           `User Data Storage Visibility Group "${securedUserDataStorageConfig.visibilityGroupId}" name missing from newly opened User Data Storage Visibility Group list.`
    //         );
    //       }
    //       return securedUserDataStorageConfigToUserDataStorageInfo(securedUserDataStorageConfig, visibilityGroupName, null);
    //     })
    //   } satisfies IUserDataStoragesInfoChangedDiff);
    // }
    return NEWLY_OPENED_USER_DATA_STORAGE_VISIBILITY_GROUPS.length;
  }

  public closeUserDataStorageVisibilityGroups(visibilityGroupIds: UUID[]): number {
    this.logger.debug(`Closing User Data Storage Visibility Groups. Count: ${visibilityGroupIds.length.toString()}.`);
    // const OPEN_DATA_STORAGE_VISIBILITY_GROUPS: IUserDataStorageVisibilityGroup[] = this.CONTEXT.getOpenDataStorageVisibilityGroups();
    // if (OPEN_DATA_STORAGE_VISIBILITY_GROUPS.length === 0) {
    //   this.logger.warn("No open User Data Storage Visibility Groups to close.");
    //   return 0;
    // }
    // if (visibilityGroupIds.length === 0) {
    //   this.logger.warn("Received empty list of User Data Storage Visibility Group IDs to close.");
    //   return 0;
    // }
    // // Filter any extra IDs
    // const VISIBILITY_GROUP_IDS_TO_CLOSE: UUID[] = [];
    // visibilityGroupIds.map((visibilityGroupId: UUID): void => {
    //   if (this.OPEN_DATA_STORAGE_VISIBILITY_GROUPS.has(visibilityGroupId)) {
    //     VISIBILITY_GROUP_IDS_TO_CLOSE.push(visibilityGroupId);
    //   } else {
    //     this.logger.warn(`User Data Storage Visibility Group "${visibilityGroupId}" not open. Skipping.`);
    //   }
    // });
    // const NOW_UNAVAILABLE_USER_DATA_STORAGE_CONFIG_IDS: UUID[] = this.getSignedInUserSecuredUserDataStorageConfigs({
    //   includeIds: "all",
    //   excludeIds: null,
    //   visibilityGroups: { includeIds: VISIBILITY_GROUP_IDS_TO_CLOSE, excludeIds: null }
    // }).map((securedUserDataStorageConfig: ISecuredUserDataStorageConfig): UUID => {
    //   return securedUserDataStorageConfig.storageId;
    // });
    // // Corrupt AES keys and remove from open visibility groups map
    // VISIBILITY_GROUP_IDS_TO_CLOSE.map((visibilityGroupId: UUID): void => {
    //   const DATA_ENCRYPTION_AES_KEY: Buffer | undefined = this.OPEN_DATA_STORAGE_VISIBILITY_GROUPS.get(visibilityGroupId);
    //   if (DATA_ENCRYPTION_AES_KEY === undefined) {
    //     this.logger.warn(`User Data Storage Visibility Group "${visibilityGroupId}" not open.`);
    //     return;
    //   }
    //   crypto.getRandomValues(DATA_ENCRYPTION_AES_KEY);
    //   this.OPEN_DATA_STORAGE_VISIBILITY_GROUPS.delete(visibilityGroupId);
    // });
    // this.logger.debug(
    //   `Closed ${VISIBILITY_GROUP_IDS_TO_CLOSE.length.toString()} User Data Storage Visibility Group${
    //     VISIBILITY_GROUP_IDS_TO_CLOSE.length === 1 ? "" : "s"
    //   }.`
    // );
    // // Execute on change functions
    // if (VISIBILITY_GROUP_IDS_TO_CLOSE.length > 0) {
    //   this.onOpenDataStorageVisibilityGroupsChangedCallback?.({
    //     removed: VISIBILITY_GROUP_IDS_TO_CLOSE,
    //     added: []
    //   } satisfies IUserDataStorageVisibilityGroupsInfoChangedDiff);
    //   this.onAvailableDataStoragesChangedCallback?.({
    //     removed: NOW_UNAVAILABLE_USER_DATA_STORAGE_CONFIG_IDS,
    //     added: []
    //   } satisfies IUserDataStoragesInfoChangedDiff);
    // }
    return this.CONTEXT.removeOpenDataStorageVisibilityGroups(visibilityGroupIds);
  }

  // public getSignedInUserSecuredUserDataStorageVisibilityGroupConfigs(options: {
  //   includeIds: UUID[] | "all";
  //   excludeIds: UUID[] | null;
  // }): ISecuredUserDataStorageVisibilityGroupConfig[] {
  //   const SIGNED_IN_USER: ISignedInUser | null = this.CONTEXT.getSignedInUser();
  //   if (SIGNED_IN_USER === null) {
  //     throw new Error("Cannot decrypt Storage Secured User Data Storage Visibility Group Configs with no signed in user");
  //   }
  //   return this.ACCOUNT_STORAGE_MANAGER.getSecuredDataStorageVisibilityGroupConfigs(
  //     { ...options, userId: this.CONTEXT.signedInUser.value.userId },
  //     this.CONTEXT.signedInUser.value.userDataAESKey
  //   );
  // }

  public getAllSignedInUserOpenUserDataStorageVisibilityGroupsInfo(): IUserDataStorageVisibilityGroupInfo[] {
    this.logger.debug("Getting all signed in user's open User Data Storage Visibility Groups Info.");
    const ACCOUNT_STORAGE: UserAccountStorage | null = this.CONTEXT.getAccountStorage();
    if (ACCOUNT_STORAGE === null) {
      throw new Error("Null User Account Storage");
    }
    const SIGNED_IN_USER: ISignedInUser | null = this.CONTEXT.getSignedInUser();
    if (SIGNED_IN_USER === null) {
      throw new Error("No signed in user");
    }
    const OPEN_DATA_STORAGE_VISIBILITY_GROUPS: IUserDataStorageVisibilityGroup[] = this.CONTEXT.getOpenDataStorageVisibilityGroups();
    if (OPEN_DATA_STORAGE_VISIBILITY_GROUPS.length === 0) {
      this.logger.debug("No open User Data Storage Visibility Groups.");
      return [];
    }
    return OPEN_DATA_STORAGE_VISIBILITY_GROUPS.map((visibilityGroup: IUserDataStorageVisibilityGroup): IUserDataStorageVisibilityGroupInfo => {
      return userDataStorageVisibilityGroupToUserDataStorageVisibilityGroupInfo(visibilityGroup, null);
    });
    // const SECURED_USER_DATA_STORAGE_VISIBILITY_GROUP_CONFIGS: ISecuredUserDataStorageVisibilityGroupConfig[] =
    //   this.getSignedInUserSecuredUserDataStorageVisibilityGroupConfigs({
    //     includeIds: Array.from(this.OPEN_DATA_STORAGE_VISIBILITY_GROUPS.keys()),
    //     excludeIds: null
    //   });
    // const USER_DATA_STORAGE_VISIBILITY_GROUPS_INFO: IUserDataStorageVisibilityGroupInfo[] = SECURED_USER_DATA_STORAGE_VISIBILITY_GROUP_CONFIGS.map(
    //   (securedUserDataStorageVisibilityGroupConfig: ISecuredUserDataStorageVisibilityGroupConfig): IUserDataStorageVisibilityGroupInfo => {
    //     return securedUserDataStorageVisibilityGroupConfigToUserDataStorageVisibilityGroupInfo(securedUserDataStorageVisibilityGroupConfig, null);
    //   }
    // );
    // this.logger.debug(
    //   `Got ${USER_DATA_STORAGE_VISIBILITY_GROUPS_INFO.length.toString()} open User Data Storage Visibility Group${
    //     USER_DATA_STORAGE_VISIBILITY_GROUPS_INFO.length === 1 ? "" : "s"
    //   } Info.`
    // );
    // return USER_DATA_STORAGE_VISIBILITY_GROUPS_INFO;
  }

  // private getSecuredUserDataStorageVisibilityGroupConfigForConfigId(
  //   userDataStorageConfigId: UUID
  // ): ISecuredUserDataStorageVisibilityGroupConfig | null {
  //   this.logger.debug(`Getting Secured User Data Storage Visibility Group Config for User Data Storage Config: "${userDataStorageConfigId}".`);
  //   const ACCOUNT_STORAGE: UserAccountStorage | null = this.CONTEXT.getAccountStorage();
  //   if (ACCOUNT_STORAGE === null) {
  //     throw new Error("Null User Account Storage");
  //   }
  //   const SIGNED_IN_USER: ISignedInUser | null = this.CONTEXT.getSignedInUser();
  //   if (this.CONTEXT.signedInUser.value === null) {
  //     throw new Error("No signed in user");
  //   }
  //   const STORAGE_SECURED_USER_DATA_STORAGE_VISIBILITY_GROU_CONFIGS: IStorageSecuredUserDataStorageVisibilityGroupConfig | null =
  //     this.CONTEXT.accountStorage.value.getStorageSecuredUserDataStorageVisibilityGroupConfigForConfigId(
  //       this.CONTEXT.signedInUser.value.userId,
  //       userDataStorageConfigId
  //     );
  //   if (STORAGE_SECURED_USER_DATA_STORAGE_VISIBILITY_GROU_CONFIGS === null) {
  //     return null;
  //   }
  //   return storageSecuredUserDataStorageVisibilityGroupConfigToSecuredUserDataStorageVisibilityGroupConfig(
  //     STORAGE_SECURED_USER_DATA_STORAGE_VISIBILITY_GROU_CONFIGS,
  //     this.CONTEXT.signedInUser.value.userDataAESKey,
  //     null
  //   );
  // }
}
