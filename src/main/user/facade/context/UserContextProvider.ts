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
      getAccountStorage: this.CONTEXT.ACCOUNT_STORAGE_CONTEXT.getAccountStorage.bind(this.CONTEXT.ACCOUNT_STORAGE_CONTEXT)
    } satisfies IUserAccountServiceContext;
  }

  public getUserAccountStorageServiceContext(): IUserAccountStorageServiceContext {
    this.logger.debug("Providing User Account Storage Service Context.");
    return {
      getAccountStorage: this.CONTEXT.ACCOUNT_STORAGE_CONTEXT.getAccountStorage.bind(this.CONTEXT.ACCOUNT_STORAGE_CONTEXT),
      setAccountStorage: this.CONTEXT.ACCOUNT_STORAGE_CONTEXT.setAccountStorage.bind(this.CONTEXT.ACCOUNT_STORAGE_CONTEXT)
    } satisfies IUserAccountStorageServiceContext;
  }

  public getUserAuthenticationServiceContext(): IUserAuthenticationServiceContext {
    this.logger.debug("Providing User Authentication Service Context.");
    return {
      getAccountStorage: this.CONTEXT.ACCOUNT_STORAGE_CONTEXT.getAccountStorage.bind(this.CONTEXT.ACCOUNT_STORAGE_CONTEXT),
      getSignedInUser: this.CONTEXT.AUTH_CONTEXT.getSignedInUser.bind(this.CONTEXT.AUTH_CONTEXT),
      setSignedInUser: this.CONTEXT.AUTH_CONTEXT.setSignedInUser.bind(this.CONTEXT.AUTH_CONTEXT)
    } satisfies IUserAuthenticationServiceContext;
  }

  public getUserDataStorageConfigServiceContext(): IUserDataStorageConfigServiceContext {
    this.logger.debug("Providing User Data Storage Config Service Context.");
    return {
      getAccountStorage: this.CONTEXT.ACCOUNT_STORAGE_CONTEXT.getAccountStorage.bind(this.CONTEXT.ACCOUNT_STORAGE_CONTEXT),
      getSignedInUser: this.CONTEXT.AUTH_CONTEXT.getSignedInUser.bind(this.CONTEXT.AUTH_CONTEXT),
      getAvailableDataStorageConfigs: this.CONTEXT.AVAILABLE_DATA_STORAGE_CONFIGS_CONTEXT.getAvailableDataStorageConfigs.bind(
        this.CONTEXT.AVAILABLE_DATA_STORAGE_CONFIGS_CONTEXT
      ),
      getOpenDataStorageVisibilityGroups: this.CONTEXT.OPEN_DATA_STORAGE_VISIBILITY_GROUPS_CONTEXT.getOpenDataStorageVisibilityGroups.bind(
        this.CONTEXT.OPEN_DATA_STORAGE_VISIBILITY_GROUPS_CONTEXT
      )
    } satisfies IUserDataStorageConfigServiceContext;
  }

  public getUserDataStorageVisibilityGroupServiceContext(): IUserDataStorageVisibilityGroupServiceContext {
    this.logger.debug("Providing User Data Storage Visibility Group Service Context.");
    return {
      getAccountStorage: this.CONTEXT.ACCOUNT_STORAGE_CONTEXT.getAccountStorage.bind(this.CONTEXT.ACCOUNT_STORAGE_CONTEXT),
      getSignedInUser: this.CONTEXT.AUTH_CONTEXT.getSignedInUser.bind(this.CONTEXT.AUTH_CONTEXT),
      getOpenDataStorageVisibilityGroups: this.CONTEXT.OPEN_DATA_STORAGE_VISIBILITY_GROUPS_CONTEXT.getOpenDataStorageVisibilityGroups.bind(
        this.CONTEXT.OPEN_DATA_STORAGE_VISIBILITY_GROUPS_CONTEXT
      ),
      addOpenDataStorageVisibilityGroups: this.CONTEXT.OPEN_DATA_STORAGE_VISIBILITY_GROUPS_CONTEXT.addOpenDataStorageVisibilityGroups.bind(
        this.CONTEXT.OPEN_DATA_STORAGE_VISIBILITY_GROUPS_CONTEXT
      ),
      removeOpenDataStorageVisibilityGroups: this.CONTEXT.OPEN_DATA_STORAGE_VISIBILITY_GROUPS_CONTEXT.removeOpenDataStorageVisibilityGroups.bind(
        this.CONTEXT.OPEN_DATA_STORAGE_VISIBILITY_GROUPS_CONTEXT
      )
    } satisfies IUserDataStorageVisibilityGroupServiceContext;
  }
}
