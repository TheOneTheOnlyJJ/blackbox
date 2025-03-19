import { LogFunctions } from "electron-log";
import { IOpenUserDataStorageVisibilityGroupsProxy } from "./proxies/OpenUserDataStorageVisibilityGroupsProxy";
import { ISignedInUserProxy } from "./proxies/SignedInUserProxy";
import { IUserAccountStorageProxy } from "./proxies/UserAccountStorageProxy";
import { IUserAccountServiceContext } from "./services/UserAccountService";
import { IUserAccountStorageServiceContext } from "./services/UserAccountStorageService";
import { IUserAuthenticationServiceContext } from "./services/UserAuthenticationService";
import { IUserDataStorageConfigServiceContext } from "./services/UserDataStorageConfigService";
import { IUserDataStorageVisibilityGroupServiceContext } from "./services/UserDataStorageVisibilityGroupService";

export class UserContext {
  public readonly accountStorage: IUserAccountStorageProxy;
  public readonly signedInUser: ISignedInUserProxy;
  public readonly openDataStorageVisibilityGroups: IOpenUserDataStorageVisibilityGroupsProxy;

  public constructor(
    accountStorage: IUserAccountStorageProxy,
    signedInUser: ISignedInUserProxy,
    openDataStorageVisibilityGroups: IOpenUserDataStorageVisibilityGroupsProxy
  ) {
    this.accountStorage = accountStorage;
    this.signedInUser = signedInUser;
    this.openDataStorageVisibilityGroups = openDataStorageVisibilityGroups;
  }
}

export class UserContextProvider {
  private readonly logger: LogFunctions;
  private readonly CONTEXT: UserContext;

  public constructor(logger: LogFunctions, context: UserContext) {
    this.logger = logger;
    this.logger.info("Initialising new User Context Provider.");
    this.CONTEXT = context;
  }

  public getUserAccountServiceContext(): IUserAccountServiceContext {
    this.logger.debug("Providing User Account Service Context.");
    return {
      accountStorage: this.CONTEXT.accountStorage
    } satisfies IUserAccountServiceContext;
  }

  public getUserAccountStorageServiceContext(): IUserAccountStorageServiceContext {
    this.logger.debug("Providing User Account Storage Service Context.");
    return {
      accountStorage: this.CONTEXT.accountStorage
    } satisfies IUserAccountStorageServiceContext;
  }

  public getUserAuthenticationServiceContext(): IUserAuthenticationServiceContext {
    this.logger.debug("Providing User Authentication Service Context.");
    return {
      accountStorage: this.CONTEXT.accountStorage,
      signedInUser: this.CONTEXT.signedInUser
    } satisfies IUserAuthenticationServiceContext;
  }

  public getUserDataStorageConfigServiceContext(): IUserDataStorageConfigServiceContext {
    this.logger.debug("Providing User Data Storage Config Service Context.");
    return {
      accountStorage: this.CONTEXT.accountStorage,
      signedInUser: this.CONTEXT.signedInUser
    } satisfies IUserDataStorageConfigServiceContext;
  }

  public getUserDataStorageVisibilityGroupServiceContext(): IUserDataStorageVisibilityGroupServiceContext {
    this.logger.debug("Providing User Data Storage Visibility Group Service Context.");
    return {
      accountStorage: this.CONTEXT.accountStorage,
      signedInUser: this.CONTEXT.signedInUser
    } satisfies IUserDataStorageVisibilityGroupServiceContext;
  }
}
