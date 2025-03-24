import { UserAccountStorage } from "@main/user/account/storage/UserAccountStorage";
import { ISecuredUserDataStorageConfig } from "@main/user/data/storage/config/SecuredUserDataStorageConfig";
import { IUserAccountStorageInfo } from "@shared/user/account/storage/info/UserAccountStorageInfo";
import { LogFunctions } from "electron-log";

export class UserAccountStorageContext {
  private readonly logger: LogFunctions;

  private accountStorage: UserAccountStorage | null;

  public onAddedNewUserDataStorageConfigsCallback: ((newSecuredUserDataStorageConfigs: ISecuredUserDataStorageConfig[]) => void) | null;
  public onUserAccountStorageChangedCallback: ((newUserAccountStorage: UserAccountStorage | null) => void) | null;

  public constructor(logger: LogFunctions) {
    this.logger = logger;
    this.logger.info("Initialising new User Account Storage Context.");
    this.accountStorage = null;
    this.onAddedNewUserDataStorageConfigsCallback = null; // TODO: Maybe abstract this in its corresponding context by wrapping all required UserAccountStorage methods (would also be safer)
    this.onUserAccountStorageChangedCallback = null;
  }

  public getAccountStorage(): UserAccountStorage | null {
    this.logger.info("Getting User Account Storage.");
    return this.accountStorage;
  }

  public setAccountStorage(newAccountStorage: UserAccountStorage | null): boolean {
    this.logger.info("Setting new User Account Storage.");
    if (newAccountStorage !== null && this.accountStorage !== null && newAccountStorage.storageId === this.accountStorage.storageId) {
      this.logger.info(`The same User Account Storage "${this.accountStorage.storageId}" is already set.`);
      return false;
    }
    let newAccountStorageInfo: IUserAccountStorageInfo | null;
    if (newAccountStorage === null) {
      newAccountStorageInfo = null;
    } else if (newAccountStorage instanceof UserAccountStorage) {
      newAccountStorageInfo = newAccountStorage.getInfo();
      // Proxy the add data storage config function to add it to available data storages on success
      type AddStorageSecuredUserDataStorageConfigType = typeof newAccountStorage.addSecuredUserDataStorageConfig;
      type AddStorageSecuredUserDataStorageConfigParametersType = Parameters<AddStorageSecuredUserDataStorageConfigType>;
      type AddStorageSecuredUserDataStorageConfigReturnType = ReturnType<AddStorageSecuredUserDataStorageConfigType>;
      newAccountStorage.addSecuredUserDataStorageConfig = new Proxy<AddStorageSecuredUserDataStorageConfigType>(
        newAccountStorage.addSecuredUserDataStorageConfig.bind(newAccountStorage),
        {
          apply: (
            target: AddStorageSecuredUserDataStorageConfigType,
            thisArg: unknown,
            argArray: AddStorageSecuredUserDataStorageConfigParametersType
          ): AddStorageSecuredUserDataStorageConfigReturnType => {
            const WAS_SECURED_DATA_STORAGE_CONFIG_ADDED: boolean = Reflect.apply(target, thisArg, argArray);
            if (WAS_SECURED_DATA_STORAGE_CONFIG_ADDED) {
              this.onAddedNewUserDataStorageConfigsCallback?.([argArray[0]]);
            }
            return WAS_SECURED_DATA_STORAGE_CONFIG_ADDED;
          }
        } satisfies ProxyHandler<AddStorageSecuredUserDataStorageConfigType>
      );
    } else {
      throw new Error(`Invalid new User Account Storage`);
    }
    this.accountStorage = newAccountStorage;
    this.logger.info(
      `Set User Account Storage to: ${
        newAccountStorage === null ? "null (unavailable)" : `${JSON.stringify(newAccountStorageInfo, null, 2)} (available)`
      }`
    );
    this.onUserAccountStorageChangedCallback?.(newAccountStorage);
    // TODO: Maybe make all not open storage configs unavailable when this closes? This should be done on the front end
    return true;
  }
}
