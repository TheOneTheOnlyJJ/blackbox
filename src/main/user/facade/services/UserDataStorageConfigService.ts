import { LogFunctions } from "electron-log";
import { UUID } from "crypto";
import { IUserDataStorageConfig } from "@main/user/data/storage/config/UserDataStorageConfig";
import { ISecuredUserDataStorageConfig } from "@main/user/data/storage/config/SecuredUserDataStorageConfig";
import { userDataStorageConfigToSecuredUserDataStorageConfig } from "@main/user/data/storage/config/utils/userDataStorageConfigToSecuredUserDataStorageConfig";
import { IUserDataStorageInfo } from "@shared/user/data/storage/info/UserDataStorageInfo";
import { ISignedInUser } from "@main/user/account/SignedInUser";
import { UserAccountStorage } from "@main/user/account/storage/UserAccountStorage";
import { IUserDataStorageVisibilityGroup } from "@main/user/data/storage/visibilityGroup/UserDataStorageVisibilityGroup";
import { securedUserDataStorageConfigToUserDataStorageInfo } from "@main/user/data/storage/config/utils/securedUserDataStorageConfigToUserDataStorageInfo";
import { IUserDataStorageConfigCreateDTO } from "@shared/user/data/storage/config/create/DTO/UserDataStorageConfigCreateDTO";
import { userDataStorageConfigCreateDTOToUserDataStorageConfig } from "@main/user/data/storage/config/utils/userDataStorageConfigCreateDTOToUserDataStorageConfig";

export interface IUserDataStorageConfigServiceContext {
  getAccountStorage: () => UserAccountStorage | null;
  getSignedInUser: () => Readonly<ISignedInUser> | null;
  getAvailableDataStorageConfigs: () => ISecuredUserDataStorageConfig[];
  getOpenDataStorageVisibilityGroups: () => IUserDataStorageVisibilityGroup[];
}

export class UserDataStorageConfigService {
  private logger: LogFunctions;
  private readonly CONTEXT: IUserDataStorageConfigServiceContext;

  public constructor(logger: LogFunctions, context: IUserDataStorageConfigServiceContext) {
    this.logger = logger;
    this.logger.debug("Initialising new User Data Storage Config Service.");
    this.CONTEXT = context;
  }

  public generateRandomDataStorageId(): UUID {
    this.logger.debug("Generating random User Data Storage ID.");
    const ACCOUNT_STORAGE: UserAccountStorage | null = this.CONTEXT.getAccountStorage();
    if (ACCOUNT_STORAGE === null) {
      throw new Error("Null User Account Storage");
    }
    return ACCOUNT_STORAGE.generateRandomUserDataStorageId();
  }

  public addUserDataStorageConfigFromCreateDTO(userDataStorageConfigCreateDTO: IUserDataStorageConfigCreateDTO): boolean {
    return this.addUserDataStorageConfig(
      userDataStorageConfigCreateDTOToUserDataStorageConfig(userDataStorageConfigCreateDTO, this.generateRandomDataStorageId(), this.logger)
    );
  }

  public addUserDataStorageConfig(userDataStorageConfig: IUserDataStorageConfig): boolean {
    this.logger.debug(`Adding User Data Storage Config to user "${userDataStorageConfig.userId}".`);
    const ACCOUNT_STORAGE: UserAccountStorage | null = this.CONTEXT.getAccountStorage();
    if (ACCOUNT_STORAGE === null) {
      throw new Error("Null User Account Storage");
    }
    const SIGNED_IN_USER: Readonly<ISignedInUser> | null = this.CONTEXT.getSignedInUser();
    if (SIGNED_IN_USER === null) {
      throw new Error("Cannot encrypt Secured User Data Storage Config with no signed in user");
    }
    if (SIGNED_IN_USER.userId !== userDataStorageConfig.userId) {
      throw new Error(`Config user ID "${userDataStorageConfig.userId}" does not match signed in user ID "${SIGNED_IN_USER.userId}"`);
    }
    if (ACCOUNT_STORAGE.isUserIdAvailable(userDataStorageConfig.userId)) {
      throw new Error(`Cannot add User Data Storage Config to user "${userDataStorageConfig.userId}" because it does not exist`);
    }
    const SECURED_USER_DATA_STORAGE_CONFIG: ISecuredUserDataStorageConfig = userDataStorageConfigToSecuredUserDataStorageConfig(
      userDataStorageConfig,
      this.logger
    );
    let encryptionAESKey: Buffer;
    let visibilityGroupName: string | null | undefined = undefined;
    if (userDataStorageConfig.visibilityGroupId === null) {
      encryptionAESKey = SIGNED_IN_USER.userDataAESKey;
      visibilityGroupName = null;
    } else {
      let visibilityGroupAESKey: Buffer | undefined = undefined;
      for (const OPEN_VISIBILITY_GROUP of this.CONTEXT.getOpenDataStorageVisibilityGroups()) {
        if (OPEN_VISIBILITY_GROUP.visibilityGroupId === userDataStorageConfig.visibilityGroupId) {
          visibilityGroupAESKey = OPEN_VISIBILITY_GROUP.AESKey;
          visibilityGroupName = OPEN_VISIBILITY_GROUP.name;
          break;
        }
      }
      if (visibilityGroupAESKey === undefined || visibilityGroupName === undefined) {
        throw new Error(
          `User Data Storage Visibility Group "${userDataStorageConfig.visibilityGroupId}" not open! Cannot encrypt new User Data Storage Config`
        );
      }
      encryptionAESKey = visibilityGroupAESKey;
    }
    return ACCOUNT_STORAGE.addSecuredUserDataStorageConfig(SECURED_USER_DATA_STORAGE_CONFIG, encryptionAESKey);
  }

  public getAllSignedInUserAvailableDataStoragesInfo(): IUserDataStorageInfo[] {
    this.logger.debug("Getting all signed in user's available User Data Storages Info.");
    return this.CONTEXT.getAvailableDataStorageConfigs().map((dataStorageConfig: IUserDataStorageConfig): IUserDataStorageInfo => {
      return securedUserDataStorageConfigToUserDataStorageInfo(dataStorageConfig, "VISGROUPNAME", null); // TODO: Remove name and have ID instead
    });
  }
}
