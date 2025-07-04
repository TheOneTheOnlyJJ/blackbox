import { LogFunctions } from "electron-log";
import { UUID } from "node:crypto";
import { IUserDataStorageConfig } from "../data/storage/config/UserDataStorageConfig";
import { IUserSignInPayload } from "../account/UserSignInPayload";
import { IUserSignUpPayload } from "../account/UserSignUpPayload";
import { IUserAccountStorageHandlers, UserAccountStorage } from "../account/storage/UserAccountStorage";
import { IUserAccountStorageInfo } from "@shared/user/account/storage/info/UserAccountStorageInfo";
import { ISignedInUserInfo } from "@shared/user/account/SignedInUserInfo";
import { IUserDataStorageVisibilityGroupConfig } from "../data/storage/visibilityGroup/config/UserDataStorageVisibilityGroupConfig";
import { IUserDataStorageVisibilityGroupsOpenRequest } from "../data/storage/visibilityGroup/openRequest/UserDataStorageVisibilityGroupsOpenRequest";
import { IUserDataStorageVisibilityGroupInfo } from "@shared/user/data/storage/visibilityGroup/info/UserDataStorageVisibilityGroupInfo";
import { hashPassword } from "@main/utils/encryption/hashPassword";
import { UserAuthService } from "./services/UserAuthService";
import { IUserContextHandlers, IUserContextLoggers, UserContext } from "./context/UserContext";
import { UserAccountStorageService } from "./services/UserAccountStorageService";
import { UserDataStorageConfigService } from "./services/UserDataStorageConfigService";
import { UserDataStorageVisibilityGroupService } from "./services/UserDataStorageVisibilityGroupService";
import { UserContextProvider } from "./context/UserContextProvider";
import { IUserSignUpDTO } from "@shared/user/account/UserSignUpDTO";
import { IUserSignInDTO } from "@shared/user/account/UserSignInDTO";
import { IUserDataStorageConfigCreateDTO } from "@shared/user/data/storage/config/create/DTO/UserDataStorageConfigCreateDTO";
import { IUserDataStorageVisibilityGroupConfigCreateDTO } from "@shared/user/data/storage/visibilityGroup/config/create/DTO/UserDataStorageVisibilityGroupConfigCreateDTO";
import { IUserDataStorageVisibilityGroupsOpenRequestDTO } from "@shared/user/data/storage/visibilityGroup/openRequest/DTO/UserDataStorageVisibilityGroupsOpenRequestDTO";
import { IUserDataStorageConfigInfo } from "@shared/user/data/storage/config/info/UserDataStorageConfigInfo";
import { IUserAccountStorageConfig } from "../account/storage/config/UserAccountStorageConfig";
import { IUserDataStorageInfo } from "@shared/user/data/storage/info/UserDataStorageInfo";
import { UserDataStorageService } from "./services/UserDataStorageService";
import { IUserDataBoxNameAvailabilityRequest } from "@shared/user/data/box/create/UserDataBoxNameAvailabilityRequest";
import { UserDataBoxService } from "./services/UserDataBoxService";
import { UserDataTemplateService } from "./services/UserDataTemplateService";
import { IUserDataBoxConfigCreateDTO } from "@shared/user/data/box/create/DTO/UserDataBoxConfigCreateDTO";
import { ISecuredUserDataBoxConfig } from "../data/box/config/SecuredUserDataBoxConfig";
import { IUserDataBoxInfo } from "@shared/user/data/box/info/UserDataBoxInfo";
import { IUserDataStorageNameAvailabilityRequest } from "@shared/user/data/storage/config/create/UserDataStorageNameAvailabilityRequest";
import { IUserDataTemplateNameAvailabilityRequest } from "@shared/user/data/template/config/create/UserDataTemplateNameAvailabilityRequest";
import { IUserDataTemplateConfigCreateDTO } from "@shared/user/data/template/config/create/DTO/UserDataTemplateConfigCreateDTO";
import { IUserDataTemplateInfo } from "@shared/user/data/template/info/UserDataTemplateInfo";
import { ISecuredUserDataTemplateConfig } from "../data/template/config/SecuredUserDataTemplateConfig";
import { IUserDataEntryCreateDTO } from "@shared/user/data/entry/create/DTO/UserDataEntryCreateDTO";
import { IUserDataEntry } from "../data/entry/UserDataEntry";
import { UserDataEntryService } from "./services/UserDataEntryService";
import { IUserDataEntryInfo } from "@shared/user/data/entry/info/UserDataEntryInfo";

export interface IUserServiceLoggers {
  auth: LogFunctions;
  account: LogFunctions;
  accountStorage: LogFunctions;
  dataStorageConfig: LogFunctions;
  dataStorage: LogFunctions;
  dataStorageVisibilityGroup: LogFunctions;
  dataBox: LogFunctions;
  dataTemplate: LogFunctions;
  dataEntry: LogFunctions;
}

export interface IUserFacadeConstructorProps {
  logger: LogFunctions;
  contextProviderLogger: LogFunctions;
  contextLoggers: IUserContextLoggers;
  serviceLoggers: IUserServiceLoggers;
  contextHandlers: IUserContextHandlers;
}

export class UserFacade {
  private readonly logger: LogFunctions;
  // Services
  private readonly AUTH_SERVICE: UserAuthService;
  private readonly ACCOUNT_STORAGE_SERVICE: UserAccountStorageService;
  private readonly DATA_STORAGE_CONFIG_SERVICE: UserDataStorageConfigService;
  private readonly DATA_STORAGE_SERVICE: UserDataStorageService;
  private readonly DATA_STORAGE_VISIBILITY_GROUP_SERVICE: UserDataStorageVisibilityGroupService;
  private readonly DATA_BOX_SERVICE: UserDataBoxService;
  private readonly DATA_TEMPLATE_SERVICE: UserDataTemplateService;
  private readonly DATA_ENTRY_SERVICE: UserDataEntryService;

  public constructor(props: IUserFacadeConstructorProps) {
    this.logger = props.logger;
    this.logger.debug("Initialising new User Facade.");
    const CONTEXT_PROVIDER = new UserContextProvider(props.contextProviderLogger, new UserContext(props.contextLoggers, props.contextHandlers));
    // Services
    this.AUTH_SERVICE = new UserAuthService(props.serviceLoggers.auth, CONTEXT_PROVIDER.getUserAuthServiceContext());
    this.ACCOUNT_STORAGE_SERVICE = new UserAccountStorageService(
      props.serviceLoggers.accountStorage,
      CONTEXT_PROVIDER.getUserAccountStorageServiceContext()
    );
    this.DATA_STORAGE_CONFIG_SERVICE = new UserDataStorageConfigService(
      props.serviceLoggers.dataStorageConfig,
      CONTEXT_PROVIDER.getUserDataStorageConfigServiceContext()
    );
    this.DATA_STORAGE_SERVICE = new UserDataStorageService(props.serviceLoggers.dataStorage, CONTEXT_PROVIDER.getUserDataStorageServiceContext());
    this.DATA_STORAGE_VISIBILITY_GROUP_SERVICE = new UserDataStorageVisibilityGroupService(
      props.serviceLoggers.dataStorageVisibilityGroup,
      CONTEXT_PROVIDER.getUserDataStorageVisibilityGroupServiceContext()
    );
    this.DATA_BOX_SERVICE = new UserDataBoxService(props.serviceLoggers.dataBox, CONTEXT_PROVIDER.getUserDataBoxServiceContext());
    this.DATA_TEMPLATE_SERVICE = new UserDataTemplateService(props.serviceLoggers.dataTemplate, CONTEXT_PROVIDER.getUserDataTemplateServiceContext());
    this.DATA_ENTRY_SERVICE = new UserDataEntryService(props.serviceLoggers.dataEntry, CONTEXT_PROVIDER.getUserDataEntryServiceContext());
  }

  public destroy(): void {
    this.logger.info("Destroying User Facade.");
    this.signOutUser();
    if (this.isAccountStorageSet()) {
      if (this.isAccountStorageOpen()) {
        this.closeAccountStorage();
      } else {
        this.logger.debug("No User Account Storage open.");
      }
      this.unsetAccountStorage();
    } else {
      this.logger.debug("No User Account Storage set.");
    }
  }

  private hashUserPasswordFunction(userPassword: string, userPasswordSalt: Buffer): string {
    return hashPassword(userPassword, userPasswordSalt, this.logger, "user sign up").toString("base64");
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

  public setAccountStorageFromConfig(
    newAccountStorageConfig: IUserAccountStorageConfig,
    logScope: string,
    handlers: IUserAccountStorageHandlers
  ): boolean {
    return this.ACCOUNT_STORAGE_SERVICE.setAccountStorageFromConfig(newAccountStorageConfig, logScope, handlers);
  }

  public unsetAccountStorage(): boolean {
    return this.ACCOUNT_STORAGE_SERVICE.unsetAccountStorage();
  }

  public openAccountStorage(): void {
    this.ACCOUNT_STORAGE_SERVICE.openAccountStorage();
  }

  public closeAccountStorage(): void {
    this.ACCOUNT_STORAGE_SERVICE.closeAccountStorage();
  }

  public isUsernameAvailable(username: string): boolean {
    return this.AUTH_SERVICE.isUsernameAvailable(username);
  }

  public isDataStorageVisibilityGroupNameAvailableForSignedInUser(name: string): boolean {
    return this.DATA_STORAGE_VISIBILITY_GROUP_SERVICE.isDataStorageVisibilityGroupNameAvailableForSignedInUser(name);
  }

  public isUserDataBoxNameAvailableForUserDataStorage(userDataBoxNameAvailabilityRequest: IUserDataBoxNameAvailabilityRequest): boolean {
    return this.DATA_BOX_SERVICE.isUserDataBoxNameAvailableForUserDataStorage(userDataBoxNameAvailabilityRequest);
  }

  public isUserDataTemplateNameAvailable(userDataTemplateNameAvailabilityRequest: IUserDataTemplateNameAvailabilityRequest): boolean {
    return this.DATA_TEMPLATE_SERVICE.isUserDataTemplateNameAvailable(userDataTemplateNameAvailabilityRequest);
  }

  public generateRandomUserId(): UUID {
    return this.AUTH_SERVICE.generateRandomUserId();
  }

  public generateRandomDataStorageId(): UUID {
    return this.DATA_STORAGE_CONFIG_SERVICE.generateRandomDataStorageId();
  }

  public generateRandomDataStorageVisibilityGroupId(): UUID {
    return this.DATA_STORAGE_VISIBILITY_GROUP_SERVICE.generateRandomDataStorageVisibilityGroupId();
  }

  public generateRandomDataBoxId(userDataStorageId: UUID): UUID {
    return this.DATA_BOX_SERVICE.generateRandomDataBoxId(userDataStorageId);
  }

  public getUserCount(): number {
    return this.ACCOUNT_STORAGE_SERVICE.getUserCount();
  }

  public getUsernameForUserId(userId: UUID): string | null {
    return this.ACCOUNT_STORAGE_SERVICE.getUsernameForUserId(userId);
  }

  public signUpUser(userSignUpPayload: IUserSignUpPayload): boolean {
    return this.AUTH_SERVICE.signUp(userSignUpPayload, this.hashUserPasswordFunction.bind(this));
  }

  public signUpUserFromDTO(userSignUpDTO: IUserSignUpDTO): boolean {
    return this.AUTH_SERVICE.signUpFromDTO(userSignUpDTO, this.hashUserPasswordFunction.bind(this));
  }

  public signInUser(userSignInPayload: IUserSignInPayload): boolean {
    return this.AUTH_SERVICE.signIn(userSignInPayload);
  }

  public signInUserFromDTO(userSignInDTO: IUserSignInDTO): boolean {
    return this.AUTH_SERVICE.signInFromDTO(userSignInDTO);
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

  // TODO: This should be secured (along other add operations)?
  public addUserDataStorageConfig(userDataStorageConfig: IUserDataStorageConfig): boolean {
    return this.DATA_STORAGE_CONFIG_SERVICE.addUserDataStorageConfig(userDataStorageConfig);
  }

  public addUserDataStorageConfigFromCreateDTO(userDataStorageConfigCreateDTO: IUserDataStorageConfigCreateDTO): boolean {
    return this.DATA_STORAGE_CONFIG_SERVICE.addUserDataStorageConfigFromCreateDTO(userDataStorageConfigCreateDTO);
  }

  public addUserDataStorageVisibilityGroupConfig(dataStorageVisibilityGroupConfig: IUserDataStorageVisibilityGroupConfig): boolean {
    return this.DATA_STORAGE_VISIBILITY_GROUP_SERVICE.addUserDataStorageVisibilityGroupConfig(dataStorageVisibilityGroupConfig);
  }

  public addUserDataStorageVisibilityGroupConfigFromCreateDTO(
    dataStorageVisibilityGroupConfigCreateDTO: IUserDataStorageVisibilityGroupConfigCreateDTO
  ): boolean {
    return this.DATA_STORAGE_VISIBILITY_GROUP_SERVICE.addUserDataStorageVisibilityGroupConfigFromCreateDTO(dataStorageVisibilityGroupConfigCreateDTO);
  }

  public addSecuredUserDataBoxConfig(securedUserDataBoxConfig: ISecuredUserDataBoxConfig): boolean {
    return this.DATA_BOX_SERVICE.addSecuredUserDataBoxConfig(securedUserDataBoxConfig);
  }

  public addSecuredUserDataBoxConfigFromCreateDTO(userDataBoxConfigCreateDTO: IUserDataBoxConfigCreateDTO): boolean {
    return this.DATA_BOX_SERVICE.addSecuredUserDataBoxConfigFromCreateDTO(userDataBoxConfigCreateDTO);
  }

  public addSecuredUserDataTemplateConfig(securedUserDataTemplateConfig: ISecuredUserDataTemplateConfig): boolean {
    return this.DATA_TEMPLATE_SERVICE.addSecuredUserDataTemplateConfig(securedUserDataTemplateConfig);
  }

  public addSecuredUserDataTemplateConfigFromCreateDTO(userDataTemplateConfigCreateDTO: IUserDataTemplateConfigCreateDTO): boolean {
    return this.DATA_TEMPLATE_SERVICE.addSecuredUserDataTemplateConfigFromCreateDTO(userDataTemplateConfigCreateDTO);
  }

  public addUserDataEntry(userDataEntry: IUserDataEntry): boolean {
    return this.DATA_ENTRY_SERVICE.addUserDataEntry(userDataEntry);
  }

  public addUserDataEntryFromCreateDTO(userDataEntryCreateDTO: IUserDataEntryCreateDTO): boolean {
    return this.DATA_ENTRY_SERVICE.addUserDataEntryFromCreateDTO(userDataEntryCreateDTO);
  }

  public openUserDataStorageVisibilityGroups(userDataStorageVisibilityGroupOpenRequest: IUserDataStorageVisibilityGroupsOpenRequest): number {
    return this.DATA_STORAGE_VISIBILITY_GROUP_SERVICE.openUserDataStorageVisibilityGroups(userDataStorageVisibilityGroupOpenRequest);
  }

  public openUserDataStorageVisibilityGroupsFromOpenRequestDTO(
    userDataStorageVisibilityGroupOpenRequestDTO: IUserDataStorageVisibilityGroupsOpenRequestDTO
  ): number {
    return this.DATA_STORAGE_VISIBILITY_GROUP_SERVICE.openUserDataStorageVisibilityGroupsFromOpenRequestDTO(
      userDataStorageVisibilityGroupOpenRequestDTO
    );
  }

  public closeUserDataStorageVisibilityGroups(visibilityGroupIds: UUID[]): number {
    return this.DATA_STORAGE_VISIBILITY_GROUP_SERVICE.closeUserDataStorageVisibilityGroups(visibilityGroupIds);
  }

  public getAllSignedInUserAvailableDataStorageConfigsInfo(): IUserDataStorageConfigInfo[] {
    return this.DATA_STORAGE_CONFIG_SERVICE.getAllSignedInUserAvailableSecuredDataStorageConfigsInfo();
  }

  public isUserDataStorageNameAvailable(userDataStorageNameAvailabilityRequest: IUserDataStorageNameAvailabilityRequest): boolean {
    return this.DATA_STORAGE_SERVICE.isUserDataStorageNameAvailable(userDataStorageNameAvailabilityRequest);
  }

  public initialiseUserDataStorage(storageId: UUID): boolean {
    return this.DATA_STORAGE_SERVICE.initialiseUserDataStorage(storageId);
  }

  public terminateUserDataStorage(storageId: UUID): boolean {
    return this.DATA_STORAGE_SERVICE.terminateUserDataStorage(storageId);
  }

  public openUserDataStorage(storageId: UUID): boolean {
    return this.DATA_STORAGE_SERVICE.openUserDataStorage(storageId);
  }

  public closeUserDataStorage(storageId: UUID): boolean {
    return this.DATA_STORAGE_SERVICE.closeUserDataStorage(storageId);
  }

  public getAllSignedInUserInitialisedDataStoragesInfo(): IUserDataStorageInfo[] {
    return this.DATA_STORAGE_SERVICE.getAllSignedInUserInitialisedDataStoragesInfo();
  }

  public getAllSignedInUserOpenUserDataStorageVisibilityGroupsInfo(): IUserDataStorageVisibilityGroupInfo[] {
    return this.DATA_STORAGE_VISIBILITY_GROUP_SERVICE.getAllSignedInUserOpenUserDataStorageVisibilityGroupsInfo();
  }

  public getAllSignedInUserAvailableUserDataBoxesInfo(): IUserDataBoxInfo[] {
    return this.DATA_BOX_SERVICE.getAllSignedInUserAvailableUserDataBoxesInfo();
  }

  public getAllSignedInUserAvailableUserDataTemplatesInfo(): IUserDataTemplateInfo[] {
    return this.DATA_TEMPLATE_SERVICE.getAllSignedInUserAvailableUserDataTemplatesInfo();
  }

  public getAllSignedInUserAvailableUserDataEntriesInfo(): IUserDataEntryInfo[] {
    return this.DATA_ENTRY_SERVICE.getAllSignedInUserAvailableUserDataEntriesInfo();
  }
}
