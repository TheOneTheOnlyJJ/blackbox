import { ISignedInUser } from "@main/user/account/SignedInUser";
import { IUserDataStorageUserDataTemplateConfigFilter } from "@main/user/data/storage/backend/BaseUserDataStorageBackend";
import { ISecuredUserDataTemplateConfig } from "@main/user/data/template/config/SecuredUserDataTemplateConfig";
import { IStorageSecuredUserDataTemplateConfig } from "@main/user/data/template/config/StorageSecuredUserDataTemplateConfig";
import { storageSecuredUserDataTemplateConfigToSecuredUserDataTemplateConfig } from "@main/user/data/template/config/utils/storageSecuredUserDataTemplateConfigToSecuredUserDataTemplateConfig";
import { userDataTemplateConfigCreateDTOToUserDataTemplateConfig } from "@main/user/data/template/config/utils/userDataTemplateConfigCreateDTOToUserDataTemplateConfig";
import { userDataTemplateConfigToSecuredUserDataTemplateConfig } from "@main/user/data/template/config/utils/userDataTemplateConfigToSecuredUserDataTemplateConfig";
import { IUserDataTemplate } from "@main/user/data/template/UserDataTemplate";
import { userDataTemplateToUserDataTemplateInfo } from "@main/user/data/template/utils/userDataTemplateToUserDataTemplateInfo";
import { IUserDataTemplateConfigCreateDTO } from "@shared/user/data/template/config/create/DTO/UserDataTemplateConfigCreateDTO";
import { IUserDataTemplateNameAvailabilityRequest } from "@shared/user/data/template/config/create/UserDataTemplateNameAvailabilityRequest";
import { IUserDataTemplateInfo } from "@shared/user/data/template/info/UserDataTemplateInfo";
import { LogFunctions } from "electron-log";
import { UUID } from "node:crypto";

export interface IUserDataTemplateServiceContext {
  getSignedInUser: () => Readonly<ISignedInUser> | null;
  getDataStorageResourceAESKeyFromId: (storageId: UUID, logger: LogFunctions | null) => Buffer | undefined;
  getAvailableDataTemplates: () => IUserDataTemplate[];
  generateRandomDataTemplateId: (userDataStorageId: UUID, userDataBoxId: UUID) => UUID;
  addSecuredUserDataTemplateConfig: (securedUserDataTemplateConfig: ISecuredUserDataTemplateConfig, encryptionAESKey: Buffer) => boolean;
  getStorageSecuredUserDataTemplates: (
    userDataStorageId: UUID,
    filter: IUserDataStorageUserDataTemplateConfigFilter
  ) => IStorageSecuredUserDataTemplateConfig[];
}

export class UserDataTemplateService {
  private readonly logger: LogFunctions;
  private readonly CONTEXT: IUserDataTemplateServiceContext;

  public constructor(logger: LogFunctions, context: IUserDataTemplateServiceContext) {
    this.logger = logger;
    this.logger.debug("Initialising new User Data Template Service.");
    this.CONTEXT = context;
  }

  public generateRandomDataTemplateId(userDataStorageId: UUID, userDataBoxId: UUID): UUID {
    this.logger.debug(`Generating random User Data Template ID for User Data Storage "${userDataStorageId}" and User Data Box "${userDataBoxId}".`);
    return this.CONTEXT.generateRandomDataTemplateId(userDataStorageId, userDataBoxId);
  }

  public addSecuredUserDataTemplateConfigFromCreateDTO(userDataTemplateConfigCreateDTO: IUserDataTemplateConfigCreateDTO): boolean {
    return this.addSecuredUserDataTemplateConfig(
      userDataTemplateConfigToSecuredUserDataTemplateConfig(
        userDataTemplateConfigCreateDTOToUserDataTemplateConfig(
          userDataTemplateConfigCreateDTO,
          this.generateRandomDataTemplateId(userDataTemplateConfigCreateDTO.storageId as UUID, userDataTemplateConfigCreateDTO.boxId as UUID),
          this.logger
        ),
        this.logger
      )
    );
  }

  public addSecuredUserDataTemplateConfig(securedUserDataTemplateConfig: ISecuredUserDataTemplateConfig): boolean {
    this.logger.debug(`Adding Secured User Data Template Config to User Data Storage "${securedUserDataTemplateConfig.storageId}".`);
    const SIGNED_IN_USER: Readonly<ISignedInUser> | null = this.CONTEXT.getSignedInUser();
    if (SIGNED_IN_USER === null) {
      throw new Error("No signed in user");
    }
    // TODO: Delete this
    // this.logger.info(`RECEIVED TEMPLATE CONFIG:\n${JSON.stringify(securedUserDataTemplateConfig, null, 2)}`);
    const ENCRYPTION_AES_KEY: Buffer | undefined = this.CONTEXT.getDataStorageResourceAESKeyFromId(
      securedUserDataTemplateConfig.storageId,
      this.logger
    );
    if (ENCRYPTION_AES_KEY === undefined) {
      throw new Error(`Could not get Secured User Data Template Config encryption AES key`);
    }
    return this.CONTEXT.addSecuredUserDataTemplateConfig(securedUserDataTemplateConfig, ENCRYPTION_AES_KEY);
  }

  public isUserDataTemplateNameAvailable(userDataTemplateNameAvailabilityRequest: IUserDataTemplateNameAvailabilityRequest): boolean {
    this.logger.info(
      `Getting User Data Template name availability for User Data Storage "${userDataTemplateNameAvailabilityRequest.storageId}" and User Data Box "${userDataTemplateNameAvailabilityRequest.boxId}".`
    );
    const SIGNED_IN_USER: Readonly<ISignedInUser> | null = this.CONTEXT.getSignedInUser();
    if (SIGNED_IN_USER === null) {
      throw new Error("No signed in user");
    }
    const DECRYPTION_AES_KEY: Buffer | undefined = this.CONTEXT.getDataStorageResourceAESKeyFromId(
      userDataTemplateNameAvailabilityRequest.storageId as UUID,
      this.logger
    );
    if (DECRYPTION_AES_KEY === undefined) {
      throw new Error(`Could not get Storage Secured User Data Template Config decryption AES key`);
    }
    // TODO: Don't make a data storage read for this
    for (const STORAGE_SECURED_DATA_TEMPLATE_CONFIG of this.CONTEXT.getStorageSecuredUserDataTemplates(
      userDataTemplateNameAvailabilityRequest.storageId as UUID,
      {
        includeIds: "all",
        excludeIds: null,
        boxes: { includeIds: [userDataTemplateNameAvailabilityRequest.boxId as UUID], excludeIds: null }
      } satisfies IUserDataStorageUserDataTemplateConfigFilter
    )) {
      const SECURED_DATA_TEMPLATE_CONFIG: ISecuredUserDataTemplateConfig = storageSecuredUserDataTemplateConfigToSecuredUserDataTemplateConfig(
        STORAGE_SECURED_DATA_TEMPLATE_CONFIG,
        DECRYPTION_AES_KEY,
        null
      );
      if (SECURED_DATA_TEMPLATE_CONFIG.name === userDataTemplateNameAvailabilityRequest.name) {
        this.logger.info(
          `Unavailable User Data Template name in User Data Storage "${userDataTemplateNameAvailabilityRequest.storageId}" and User Data Box "${userDataTemplateNameAvailabilityRequest.boxId}".`
        );
        return false;
      }
    }
    this.logger.info(
      `Available User Data Template name in User Data Storage "${userDataTemplateNameAvailabilityRequest.storageId}" and User Data Box "${userDataTemplateNameAvailabilityRequest.boxId}".`
    );
    return true;
  }

  public getAllSignedInUserAvailableUserDataTemplatesInfo(): IUserDataTemplateInfo[] {
    this.logger.debug("Getting all signed in user's available User Data Templates Info.");
    return this.CONTEXT.getAvailableDataTemplates().map((dataTemplate: IUserDataTemplate): IUserDataTemplateInfo => {
      return userDataTemplateToUserDataTemplateInfo(dataTemplate, null);
    });
  }
}
