import { LogFunctions } from "electron-log";
import { UUID } from "crypto";
import { IUserDataStorageConfig } from "@main/user/data/storage/config/UserDataStorageConfig";
import { ISecuredUserDataStorageConfig } from "@main/user/data/storage/config/SecuredUserDataStorageConfig";
import { userDataStorageConfigToSecuredUserDataStorageConfig } from "@main/user/data/storage/config/utils/userDataStorageConfigToSecuredUserDataStorageConfig";
import { ISignedInUser } from "@main/user/account/SignedInUser";
import { IUserDataStorageVisibilityGroup } from "@main/user/data/storage/visibilityGroup/UserDataStorageVisibilityGroup";
import { securedUserDataStorageConfigToUserDataStorageConfigInfo } from "@main/user/data/storage/config/utils/securedUserDataStorageConfigToUserDataStorageConfigInfo";
import { IUserDataStorageConfigCreateDTO } from "@shared/user/data/storage/config/create/DTO/UserDataStorageConfigCreateDTO";
import { userDataStorageConfigCreateDTOToUserDataStorageConfig } from "@main/user/data/storage/config/utils/userDataStorageConfigCreateDTOToUserDataStorageConfig";
import { IUserDataStorageConfigInfo } from "@shared/user/data/storage/config/info/UserDataStorageConfigInfo";

export interface IUserDataStorageConfigServiceContext {
  isAccountStorageSet: () => boolean;
  generateRandomUserDataStorageId: () => UUID;
  isUserIdAvailable: (userId: UUID) => boolean;
  addSecuredUserDataStorageConfig: (secureduserDataStorageConfig: ISecuredUserDataStorageConfig, encryptionKey: Buffer) => boolean;
  isDataStorageInitialised: (storageId: UUID) => boolean;
  getSignedInUser: () => Readonly<ISignedInUser> | null;
  getAvailableSecuredDataStorageConfigs: () => ISecuredUserDataStorageConfig[];
  getOpenDataStorageVisibilityGroups: () => IUserDataStorageVisibilityGroup[];
}

export class UserDataStorageConfigService {
  private readonly logger: LogFunctions;
  private readonly CONTEXT: IUserDataStorageConfigServiceContext;

  public constructor(logger: LogFunctions, context: IUserDataStorageConfigServiceContext) {
    this.logger = logger;
    this.logger.debug("Initialising new User Data Storage Config Service.");
    this.CONTEXT = context;
  }

  public generateRandomDataStorageId(): UUID {
    this.logger.debug("Generating random User Data Storage ID.");
    return this.CONTEXT.generateRandomUserDataStorageId();
  }

  public addUserDataStorageConfigFromCreateDTO(userDataStorageConfigCreateDTO: IUserDataStorageConfigCreateDTO): boolean {
    return this.addUserDataStorageConfig(
      userDataStorageConfigCreateDTOToUserDataStorageConfig(userDataStorageConfigCreateDTO, this.generateRandomDataStorageId(), this.logger)
    );
  }

  public addUserDataStorageConfig(userDataStorageConfig: IUserDataStorageConfig): boolean {
    this.logger.debug(`Adding User Data Storage Config to user "${userDataStorageConfig.userId}".`);
    if (!this.CONTEXT.isAccountStorageSet()) {
      throw new Error("Null User Account Storage");
    }
    const SIGNED_IN_USER: Readonly<ISignedInUser> | null = this.CONTEXT.getSignedInUser();
    if (SIGNED_IN_USER === null) {
      throw new Error("Cannot encrypt Secured User Data Storage Config with no signed in user");
    }
    if (SIGNED_IN_USER.userId !== userDataStorageConfig.userId) {
      throw new Error(`Config user ID "${userDataStorageConfig.userId}" does not match signed in user ID "${SIGNED_IN_USER.userId}"`);
    }
    if (this.CONTEXT.isUserIdAvailable(userDataStorageConfig.userId)) {
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
    return this.CONTEXT.addSecuredUserDataStorageConfig(SECURED_USER_DATA_STORAGE_CONFIG, encryptionAESKey);
  }

  public getAllSignedInUserAvailableSecuredDataStorageConfigsInfo(): IUserDataStorageConfigInfo[] {
    this.logger.debug("Getting all signed in user's available User Data Storage Configs Info.");
    return this.CONTEXT.getAvailableSecuredDataStorageConfigs().map(
      (securedDataStorageConfig: ISecuredUserDataStorageConfig): IUserDataStorageConfigInfo => {
        return securedUserDataStorageConfigToUserDataStorageConfigInfo(
          securedDataStorageConfig,
          this.CONTEXT.isDataStorageInitialised(securedDataStorageConfig.storageId),
          null
        );
      }
    );
  }
}
