import { LogFunctions } from "electron-log";
import { IUserAccountServiceContext } from "../services/UserAccountService";
import { IUserAccountStorageServiceContext } from "../services/UserAccountStorageService";
import { IUserAuthenticationServiceContext } from "../services/UserAuthenticationService";
import { IUserDataStorageConfigServiceContext } from "../services/UserDataStorageConfigService";
import { IUserDataStorageVisibilityGroupServiceContext } from "../services/UserDataStorageVisibilityGroupService";
import { UserContext } from "./UserContext";

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
      getAccountStorage: this.CONTEXT.getAccountStorage.bind(this.CONTEXT)
    } satisfies IUserAccountServiceContext;
  }

  public getUserAccountStorageServiceContext(): IUserAccountStorageServiceContext {
    this.logger.debug("Providing User Account Storage Service Context.");
    return {
      getAccountStorage: this.CONTEXT.getAccountStorage.bind(this.CONTEXT),
      setAccountStorage: this.CONTEXT.setAccountStorage.bind(this.CONTEXT)
    } satisfies IUserAccountStorageServiceContext;
  }

  public getUserAuthenticationServiceContext(): IUserAuthenticationServiceContext {
    this.logger.debug("Providing User Authentication Service Context.");
    return {
      getAccountStorage: this.CONTEXT.getAccountStorage.bind(this.CONTEXT),
      getSignedInUser: this.CONTEXT.getSignedInUser.bind(this.CONTEXT),
      setSignedInUser: this.CONTEXT.setSignedInUser.bind(this.CONTEXT)
    } satisfies IUserAuthenticationServiceContext;
  }

  public getUserDataStorageConfigServiceContext(): IUserDataStorageConfigServiceContext {
    this.logger.debug("Providing User Data Storage Config Service Context.");
    return {
      getAccountStorage: this.CONTEXT.getAccountStorage.bind(this.CONTEXT),
      getSignedInUser: this.CONTEXT.getSignedInUser.bind(this.CONTEXT),
      getAvailableDataStorageConfigs: this.CONTEXT.getAvailableDataStorageConfigs.bind(this.CONTEXT),
      getOpenDataStorageVisibilityGroups: this.CONTEXT.getOpenDataStorageVisibilityGroups.bind(this.CONTEXT)
    } satisfies IUserDataStorageConfigServiceContext;
  }

  public getUserDataStorageVisibilityGroupServiceContext(): IUserDataStorageVisibilityGroupServiceContext {
    this.logger.debug("Providing User Data Storage Visibility Group Service Context.");
    return {
      getAccountStorage: this.CONTEXT.getAccountStorage.bind(this.CONTEXT),
      getSignedInUser: this.CONTEXT.getSignedInUser.bind(this.CONTEXT),
      getOpenDataStorageVisibilityGroups: this.CONTEXT.getOpenDataStorageVisibilityGroups.bind(this.CONTEXT),
      addOpenDataStorageVisibilityGroups: this.CONTEXT.addOpenDataStorageVisibilityGroups.bind(this.CONTEXT),
      removeOpenDataStorageVisibilityGroups: this.CONTEXT.removeOpenDataStorageVisibilityGroups.bind(this.CONTEXT)
    } satisfies IUserDataStorageVisibilityGroupServiceContext;
  }
}
