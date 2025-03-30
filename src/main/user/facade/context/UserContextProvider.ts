import { LogFunctions } from "electron-log";
import { IUserAccountStorageServiceContext } from "../services/UserAccountStorageService";
import { IUserAuthServiceContext } from "../services/UserAuthService";
import { IUserDataStorageConfigServiceContext } from "../services/UserDataStorageConfigService";
import { IUserDataStorageVisibilityGroupServiceContext } from "../services/UserDataStorageVisibilityGroupService";
import { UserContext } from "./UserContext";
import { IUserDataStorageServiceContext } from "../services/UserDataStorageService";

export class UserContextProvider {
  private readonly logger: LogFunctions;
  private readonly CONTEXT: UserContext;

  public constructor(logger: LogFunctions, context: UserContext) {
    this.logger = logger;
    this.logger.info("Initialising new User Context Provider.");
    this.CONTEXT = context;
  }

  public getUserAccountStorageServiceContext(): IUserAccountStorageServiceContext {
    this.logger.debug("Providing User Account Storage Service Context.");
    return {
      isAccountStorageSet: this.CONTEXT.ACCOUNT_STORAGE_CONTEXT.isSet.bind(this.CONTEXT.ACCOUNT_STORAGE_CONTEXT),
      isAccountStorageOpen: this.CONTEXT.ACCOUNT_STORAGE_CONTEXT.isOpen.bind(this.CONTEXT.ACCOUNT_STORAGE_CONTEXT),
      isAccountStorageClosed: this.CONTEXT.ACCOUNT_STORAGE_CONTEXT.isClosed.bind(this.CONTEXT.ACCOUNT_STORAGE_CONTEXT),
      getAccountStorageInfo: this.CONTEXT.ACCOUNT_STORAGE_CONTEXT.getInfo.bind(this.CONTEXT.ACCOUNT_STORAGE_CONTEXT),
      setAccountStorage: this.CONTEXT.ACCOUNT_STORAGE_CONTEXT.set.bind(this.CONTEXT.ACCOUNT_STORAGE_CONTEXT),
      closeAccountStorage: this.CONTEXT.ACCOUNT_STORAGE_CONTEXT.close.bind(this.CONTEXT.ACCOUNT_STORAGE_CONTEXT),
      openAccountStorage: this.CONTEXT.ACCOUNT_STORAGE_CONTEXT.open.bind(this.CONTEXT.ACCOUNT_STORAGE_CONTEXT),
      getUserCount: this.CONTEXT.ACCOUNT_STORAGE_CONTEXT.getUserCount.bind(this.CONTEXT.ACCOUNT_STORAGE_CONTEXT),
      getUsernameForUserId: this.CONTEXT.ACCOUNT_STORAGE_CONTEXT.getUsernameForUserId.bind(this.CONTEXT.ACCOUNT_STORAGE_CONTEXT)
    } satisfies IUserAccountStorageServiceContext;
  }

  public getUserAuthServiceContext(): IUserAuthServiceContext {
    this.logger.debug("Providing User Auth Service Context.");
    return {
      isAccountStorageSet: this.CONTEXT.ACCOUNT_STORAGE_CONTEXT.isSet.bind(this.CONTEXT.ACCOUNT_STORAGE_CONTEXT),
      getSignedInUser: this.CONTEXT.AUTH_CONTEXT.getSignedInUser.bind(this.CONTEXT.AUTH_CONTEXT),
      setSignedInUser: this.CONTEXT.AUTH_CONTEXT.setSignedInUser.bind(this.CONTEXT.AUTH_CONTEXT),
      isUsernameAvailable: this.CONTEXT.ACCOUNT_STORAGE_CONTEXT.isUsernameAvailable.bind(this.CONTEXT.ACCOUNT_STORAGE_CONTEXT),
      generateRandomUserId: this.CONTEXT.ACCOUNT_STORAGE_CONTEXT.generateRandomUserId.bind(this.CONTEXT.ACCOUNT_STORAGE_CONTEXT),
      addUser: this.CONTEXT.ACCOUNT_STORAGE_CONTEXT.addUser.bind(this.CONTEXT.ACCOUNT_STORAGE_CONTEXT),
      getUserId: this.CONTEXT.ACCOUNT_STORAGE_CONTEXT.getUserId.bind(this.CONTEXT.ACCOUNT_STORAGE_CONTEXT),
      getSecuredUserPassword: this.CONTEXT.ACCOUNT_STORAGE_CONTEXT.getSecuredUserPassword.bind(this.CONTEXT.ACCOUNT_STORAGE_CONTEXT),
      getUserDataAESKeySalt: this.CONTEXT.ACCOUNT_STORAGE_CONTEXT.getUserDataAESKeySalt.bind(this.CONTEXT.ACCOUNT_STORAGE_CONTEXT)
    } satisfies IUserAuthServiceContext;
  }

  public getUserDataStorageConfigServiceContext(): IUserDataStorageConfigServiceContext {
    this.logger.debug("Providing User Data Storage Config Service Context.");
    return {
      isAccountStorageSet: this.CONTEXT.ACCOUNT_STORAGE_CONTEXT.isSet.bind(this.CONTEXT.ACCOUNT_STORAGE_CONTEXT),
      generateRandomUserDataStorageId: this.CONTEXT.ACCOUNT_STORAGE_CONTEXT.generateRandomUserDataStorageId.bind(
        this.CONTEXT.ACCOUNT_STORAGE_CONTEXT
      ),
      isUserIdAvailable: this.CONTEXT.ACCOUNT_STORAGE_CONTEXT.isUserIdAvailable.bind(this.CONTEXT.ACCOUNT_STORAGE_CONTEXT),
      isDataStorageInitialised: this.CONTEXT.INITIALISED_DATA_STORAGES_CONTEXT.isDataStorageInitialised.bind(
        this.CONTEXT.INITIALISED_DATA_STORAGES_CONTEXT
      ),
      addSecuredUserDataStorageConfig: this.CONTEXT.ACCOUNT_STORAGE_CONTEXT.addSecuredUserDataStorageConfig.bind(
        this.CONTEXT.ACCOUNT_STORAGE_CONTEXT
      ),
      getSignedInUser: this.CONTEXT.AUTH_CONTEXT.getSignedInUser.bind(this.CONTEXT.AUTH_CONTEXT),
      getAvailableSecuredDataStorageConfigs: this.CONTEXT.AVAILABLE_DATA_STORAGE_CONFIGS_CONTEXT.getAvailableSecuredDataStorageConfigs.bind(
        this.CONTEXT.AVAILABLE_DATA_STORAGE_CONFIGS_CONTEXT
      ),
      getOpenDataStorageVisibilityGroups: this.CONTEXT.OPEN_DATA_STORAGE_VISIBILITY_GROUPS_CONTEXT.getOpenDataStorageVisibilityGroups.bind(
        this.CONTEXT.OPEN_DATA_STORAGE_VISIBILITY_GROUPS_CONTEXT
      )
    } satisfies IUserDataStorageConfigServiceContext;
  }

  public getUserDataStorageServiceContext(): IUserDataStorageServiceContext {
    this.logger.debug("Providing User Data Storage Service Context.");
    return {
      initialiseDataStoragesFromConfigs: this.CONTEXT.INITIALISED_DATA_STORAGES_CONTEXT.initialiseDataStoragesFromConfigs.bind(
        this.CONTEXT.INITIALISED_DATA_STORAGES_CONTEXT
      ),
      terminateDataStoragesFromIds: this.CONTEXT.INITIALISED_DATA_STORAGES_CONTEXT.terminateDataStoragesFromIds.bind(
        this.CONTEXT.INITIALISED_DATA_STORAGES_CONTEXT
      ),
      openInitialisedDataStorages: this.CONTEXT.INITIALISED_DATA_STORAGES_CONTEXT.openInitialisedDataStorages.bind(
        this.CONTEXT.INITIALISED_DATA_STORAGES_CONTEXT
      ),
      closeInitialisedDataStorages: this.CONTEXT.INITIALISED_DATA_STORAGES_CONTEXT.closeInitialisedDataStorages.bind(
        this.CONTEXT.INITIALISED_DATA_STORAGES_CONTEXT
      ),
      getAllSignedInUserInitialisedDataStoragesInfo:
        this.CONTEXT.INITIALISED_DATA_STORAGES_CONTEXT.getAllSignedInUserInitialisedDataStoragesInfo.bind(
          this.CONTEXT.INITIALISED_DATA_STORAGES_CONTEXT
        ),
      getAvailableSecuredDataStorageConfigs: this.CONTEXT.AVAILABLE_DATA_STORAGE_CONFIGS_CONTEXT.getAvailableSecuredDataStorageConfigs.bind(
        this.CONTEXT.AVAILABLE_DATA_STORAGE_CONFIGS_CONTEXT
      )
    } satisfies IUserDataStorageServiceContext;
  }

  public getUserDataStorageVisibilityGroupServiceContext(): IUserDataStorageVisibilityGroupServiceContext {
    this.logger.debug("Providing User Data Storage Visibility Group Service Context.");
    return {
      isAccountStorageSet: this.CONTEXT.ACCOUNT_STORAGE_CONTEXT.isSet.bind(this.CONTEXT.ACCOUNT_STORAGE_CONTEXT),
      generateRandomUserDataStorageVisibilityGroupId: this.CONTEXT.ACCOUNT_STORAGE_CONTEXT.generateRandomUserDataStorageVisibilityGroupId.bind(
        this.CONTEXT.ACCOUNT_STORAGE_CONTEXT
      ),
      getStorageSecuredUserDataStorageVisibilityGroupConfigs:
        this.CONTEXT.ACCOUNT_STORAGE_CONTEXT.getStorageSecuredUserDataStorageVisibilityGroupConfigs.bind(this.CONTEXT.ACCOUNT_STORAGE_CONTEXT),
      isUserIdAvailable: this.CONTEXT.ACCOUNT_STORAGE_CONTEXT.isUserIdAvailable.bind(this.CONTEXT.ACCOUNT_STORAGE_CONTEXT),
      addSecuredUserDataStorageVisibilityGroupConfig: this.CONTEXT.ACCOUNT_STORAGE_CONTEXT.addSecuredUserDataStorageVisibilityGroupConfig.bind(
        this.CONTEXT.ACCOUNT_STORAGE_CONTEXT
      ),
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
