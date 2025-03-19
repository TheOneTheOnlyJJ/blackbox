import { LogFunctions } from "electron-log";
import { UUID } from "node:crypto";
import { IUserDataStorageConfig } from "../data/storage/config/UserDataStorageConfig";
import { IUserSignInPayload } from "../account/UserSignInPayload";
import { IUserSignUpPayload } from "../account/UserSignUpPayload";
import { UserAccountStorage } from "../account/storage/UserAccountStorage";
import { IUserAccountStorageInfo } from "@shared/user/account/storage/info/UserAccountStorageInfo";
import { ISignedInUserInfo } from "@shared/user/account/SignedInUserInfo";
import { ISecuredUserDataStorageConfig } from "../data/storage/config/SecuredUserDataStorageConfig";
import { IUserDataStorageInfo } from "@shared/user/data/storage/info/UserDataStorageInfo";
import { IUserDataStorageVisibilityGroupConfig } from "../data/storage/visibilityGroup/config/UserDataStorageVisibilityGroupConfig";
import { IUserDataStorageVisibilityGroupsOpenRequest } from "../data/storage/visibilityGroup/openRequest/UserDataStorageVisibilityGroupsOpenRequest";
import { IUserDataStorageVisibilityGroupInfo } from "@shared/user/data/storage/visibilityGroup/info/UserDataStorageVisibilityGroupInfo";
import { hashPassword } from "@main/utils/encryption/hashPassword";
import { UserAuthenticationService } from "./services/UserAuthenticationService";
import { IUserContextHandlers, UserContext, UserContextProvider } from "./UserContext";
import { UserAccountStorageService } from "./services/UserAccountStorageService";
import { UserDataStorageConfigService } from "./services/UserDataStorageConfigService";
import { UserDataStorageVisibilityGroupService } from "./services/UserDataStorageVisibilityGroupService";
import { UserAccountService } from "./services/UserAccountService";

export interface IUserFacadeConstructorProps {
  logger: LogFunctions;
  contextLogger: LogFunctions;
  contextProviderLogger: LogFunctions;
  serviceLoggers: {
    auth: LogFunctions;
    account: LogFunctions;
    accountStorage: LogFunctions;
    dataStorageConfig: LogFunctions;
    dataStorageVisibilityGroup: LogFunctions;
  };
  contextHandlers: IUserContextHandlers;
}

export class UserFacade {
  private readonly logger: LogFunctions;
  private readonly CONTEXT: UserContext;
  // Services
  private readonly AUTH_SERVICE: UserAuthenticationService;
  private readonly ACCOUNT_SERVICE: UserAccountService;
  private readonly ACCOUNT_STORAGE_SERVICE: UserAccountStorageService;
  private readonly DATA_STORAGE_CONFIG_SERVICE: UserDataStorageConfigService;
  private readonly DATA_STORAGE_VISIBILITY_GROUP_SERVICE: UserDataStorageVisibilityGroupService;

  public constructor(props: IUserFacadeConstructorProps) {
    this.logger = props.logger;
    this.logger.debug("Initialising new User Controller.");
    this.CONTEXT = new UserContext(props.contextLogger, props.contextHandlers);
    const CONTEXT_PROVIDER = new UserContextProvider(props.contextProviderLogger, this.CONTEXT);
    // Services
    this.AUTH_SERVICE = new UserAuthenticationService(props.serviceLoggers.auth, CONTEXT_PROVIDER.getUserAuthenticationServiceContext());
    this.ACCOUNT_SERVICE = new UserAccountService(props.serviceLoggers.account, CONTEXT_PROVIDER.getUserAccountServiceContext());
    this.ACCOUNT_STORAGE_SERVICE = new UserAccountStorageService(
      props.serviceLoggers.accountStorage,
      CONTEXT_PROVIDER.getUserAccountStorageServiceContext()
    );
    this.DATA_STORAGE_CONFIG_SERVICE = new UserDataStorageConfigService(
      props.serviceLoggers.dataStorageConfig,
      CONTEXT_PROVIDER.getUserDataStorageConfigServiceContext()
    );
    this.DATA_STORAGE_VISIBILITY_GROUP_SERVICE = new UserDataStorageVisibilityGroupService(
      props.serviceLoggers.dataStorageVisibilityGroup,
      CONTEXT_PROVIDER.getUserDataStorageVisibilityGroupServiceContext()
    );
  }

  public isAccountStorageOpen(): boolean {
    return this.ACCOUNT_STORAGE_SERVICE.isAccountStorageOpen();
  }

  public isAccountStorageClosed(): boolean {
    return this.ACCOUNT_STORAGE_SERVICE.isAccountStorageClosed();
  }

  public isAccountStorageSet(): boolean {
    return this.ACCOUNT_STORAGE_SERVICE.isAccountStorageSet();
  }

  public setAccountStorage(newAccountStorage: UserAccountStorage): boolean {
    return this.ACCOUNT_STORAGE_SERVICE.setAccountStorage(newAccountStorage);
  }

  public unsetAccountStorage(): boolean {
    return this.ACCOUNT_STORAGE_SERVICE.unsetAccountStorage();
  }

  public openAccountStorage(): boolean {
    return this.ACCOUNT_STORAGE_SERVICE.openAccountStorage();
  }

  public closeAccountStorage(): boolean {
    return this.ACCOUNT_STORAGE_SERVICE.closeAccountStorage();
  }

  public isUsernameAvailable(username: string): boolean {
    return this.ACCOUNT_SERVICE.isUsernameAvailable(username);
  }

  public isDataStorageVisibilityGroupNameAvailableForSignedInUser(name: string): boolean {
    return this.DATA_STORAGE_VISIBILITY_GROUP_SERVICE.isDataStorageVisibilityGroupNameAvailableForSignedInUser(name);
  }

  public generateRandomUserId(): UUID {
    return this.ACCOUNT_SERVICE.generateRandomUserId();
  }

  public generateRandomDataStorageId(): UUID {
    return this.DATA_STORAGE_CONFIG_SERVICE.generateRandomDataStorageId();
  }

  public generateRandomDataStorageVisibilityGroupId(): UUID {
    return this.DATA_STORAGE_VISIBILITY_GROUP_SERVICE.generateRandomDataStorageVisibilityGroupId();
  }

  public getUserCount(): number {
    return this.ACCOUNT_SERVICE.getUserCount();
  }

  public getUsernameForUserId(userId: UUID): string | null {
    return this.ACCOUNT_SERVICE.getUsernameForUserId(userId);
  }

  public signUpUser(userSignUpPayload: IUserSignUpPayload): boolean {
    return this.AUTH_SERVICE.signUp(userSignUpPayload, (userPassword: string, userPasswordSalt: Buffer): string => {
      return hashPassword(userPassword, userPasswordSalt, this.logger, "user sign up").toString("base64");
    });
  }

  public signInUser(userSignInPayload: IUserSignInPayload): boolean {
    return this.AUTH_SERVICE.signIn(userSignInPayload);
  }

  public signOutUser(): ISignedInUserInfo | null {
    return this.AUTH_SERVICE.signOut();
  }

  public getSignedInUserInfo(): ISignedInUserInfo | null {
    return this.AUTH_SERVICE.getSignedInUserInfo();
  }

  public getAccountStorageInfo(): IUserAccountStorageInfo | null {
    return this.ACCOUNT_STORAGE_SERVICE.getAccountStorageInfo();
  }

  public addUserDataStorageConfig(userDataStorageConfig: IUserDataStorageConfig): boolean {
    return this.DATA_STORAGE_CONFIG_SERVICE.addUserDataStorageConfig(userDataStorageConfig);
  }

  public addUserDataStorageVisibilityGroupConfig(dataStorageVisibilityGroupConfig: IUserDataStorageVisibilityGroupConfig): boolean {
    return this.DATA_STORAGE_VISIBILITY_GROUP_SERVICE.addUserDataStorageVisibilityGroupConfig(dataStorageVisibilityGroupConfig);
  }

  public openUserDataStorageVisibilityGroups(userDataStorageVisibilityGroupOpenRequest: IUserDataStorageVisibilityGroupsOpenRequest): number {
    return this.DATA_STORAGE_VISIBILITY_GROUP_SERVICE.openUserDataStorageVisibilityGroups(userDataStorageVisibilityGroupOpenRequest);
  }

  public closeUserDataStorageVisibilityGroups(visibilityGroupIds: UUID[]): number {
    return this.DATA_STORAGE_VISIBILITY_GROUP_SERVICE.closeUserDataStorageVisibilityGroups(visibilityGroupIds);
  }

  public getSignedInUserSecuredUserDataStorageConfigs(options: {
    includeIds: UUID[] | "all";
    excludeIds: UUID[] | null;
    visibilityGroups: {
      includeIds: (UUID | null)[] | "all";
      excludeIds: UUID[] | null;
    };
  }): ISecuredUserDataStorageConfig[] {
    return this.DATA_STORAGE_CONFIG_SERVICE.getSignedInUserSecuredUserDataStorageConfigs(options);
  }

  // public getSignedInUserSecuredUserDataStorageVisibilityGroupConfigs(options: {
  //   includeIds: UUID[] | "all";
  //   excludeIds: UUID[] | null;
  // }): ISecuredUserDataStorageVisibilityGroupConfig[] {
  //   return this.DATA_STORAGE_VISIBILITY_GROUP_SERVICE.getSignedInUserSecuredUserDataStorageVisibilityGroupConfigs(options);
  // }

  public getAllSignedInUserAvailableDataStoragesInfo(): IUserDataStorageInfo[] {
    return this.DATA_STORAGE_CONFIG_SERVICE.getAllSignedInUserAvailableDataStoragesInfo();
  }

  public getAllSignedInUserOpenUserDataStorageVisibilityGroupsInfo(): IUserDataStorageVisibilityGroupInfo[] {
    return this.DATA_STORAGE_VISIBILITY_GROUP_SERVICE.getAllSignedInUserOpenUserDataStorageVisibilityGroupsInfo();
  }
}
