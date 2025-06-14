import { ISignedInUser } from "@main/user/account/SignedInUser";
import { ISecuredUserDataBoxConfig } from "@main/user/data/box/config/SecuredUserDataBoxConfig";
import { IStorageSecuredUserDataBoxConfig } from "@main/user/data/box/config/StorageSecuredUserDataBoxConfig";
import { storageSecuredUserDataBoxConfigToSecuredUserDataBoxConfig } from "@main/user/data/box/config/utils/storageSecuredUserDataBoxConfigToSecuredUserDataBoxConfig";
import { userDataBoxConfigCreateDTOToUserDataBoxConfig } from "@main/user/data/box/config/utils/userDataBoxConfigCreateDTOToUserDataBoxConfig";
import { userDataBoxConfigToSecuredUserDataBoxConfig } from "@main/user/data/box/config/utils/userDataBoxConfigToSecuredUserDataBoxConfig";
import { IUserDataBox } from "@main/user/data/box/UserDataBox";
import { userDataBoxToUserDataBoxInfo } from "@main/user/data/box/utils/userDataBoxToUserDataBoxInfo";
import { IUserDataStorageUserDataBoxConfigFilter } from "@main/user/data/storage/backend/BaseUserDataStorageBackend";
import { IUserDataBoxConfigCreateDTO } from "@shared/user/data/box/create/DTO/UserDataBoxConfigCreateDTO";
import { IUserDataBoxNameAvailabilityRequest } from "@shared/user/data/box/create/UserDataBoxNameAvailabilityRequest";
import { IUserDataBoxInfo } from "@shared/user/data/box/info/UserDataBoxInfo";
import { LogFunctions } from "electron-log";
import { UUID } from "node:crypto";

export interface IUserDataBoxServiceContext {
  getSignedInUser: () => Readonly<ISignedInUser> | null;
  getDataStorageResourceAESKeyFromId: (storageId: UUID, logger: LogFunctions | null) => Buffer | undefined;
  getAvailableDataBoxes: () => IUserDataBox[];
  generateRandomDataBoxId: (userDataStorageId: UUID) => UUID;
  addSecuredUserDataBoxConfig: (securedUserDataBoxConfig: ISecuredUserDataBoxConfig, encryptionAESKey: Buffer) => boolean;
  getStorageSecuredUserDataBoxConfigsForUserDataStorage: (
    userDataStorageId: UUID,
    filter: IUserDataStorageUserDataBoxConfigFilter
  ) => IStorageSecuredUserDataBoxConfig[];
}

export class UserDataBoxService {
  private readonly logger: LogFunctions;
  private readonly CONTEXT: IUserDataBoxServiceContext;

  public constructor(logger: LogFunctions, context: IUserDataBoxServiceContext) {
    this.logger = logger;
    this.logger.debug("Initialising new User Data Box Service.");
    this.CONTEXT = context;
  }

  public generateRandomDataBoxId(userDataStorageId: UUID): UUID {
    this.logger.debug(`Generating random User Data Box ID for User Data Storage "${userDataStorageId}".`);
    return this.CONTEXT.generateRandomDataBoxId(userDataStorageId);
  }

  public addSecuredUserDataBoxConfigFromCreateDTO(userDataBoxConfigCreateDTO: IUserDataBoxConfigCreateDTO): boolean {
    return this.addSecuredUserDataBoxConfig(
      userDataBoxConfigToSecuredUserDataBoxConfig(
        userDataBoxConfigCreateDTOToUserDataBoxConfig(
          userDataBoxConfigCreateDTO,
          this.generateRandomDataBoxId(userDataBoxConfigCreateDTO.storageId as UUID),
          this.logger
        ),
        this.logger
      )
    );
  }

  public addSecuredUserDataBoxConfig(securedUserDataBoxConfig: ISecuredUserDataBoxConfig): boolean {
    this.logger.debug(`Adding Secured User Data Box Config to User Data Storage "${securedUserDataBoxConfig.storageId}".`);
    const SIGNED_IN_USER: Readonly<ISignedInUser> | null = this.CONTEXT.getSignedInUser();
    if (SIGNED_IN_USER === null) {
      throw new Error("No signed in user");
    }
    const ENCRYPTION_AES_KEY: Buffer | undefined = this.CONTEXT.getDataStorageResourceAESKeyFromId(securedUserDataBoxConfig.storageId, this.logger);
    if (ENCRYPTION_AES_KEY === undefined) {
      throw new Error(`Could not get Secured User Data Box Config encryption AES key`);
    }
    return this.CONTEXT.addSecuredUserDataBoxConfig(securedUserDataBoxConfig, ENCRYPTION_AES_KEY);
  }

  public isUserDataBoxNameAvailableForUserDataStorage(userDataBoxNameAvailabilityRequest: IUserDataBoxNameAvailabilityRequest): boolean {
    this.logger.info(`Getting User Data Box name availability for User Data Storage "${userDataBoxNameAvailabilityRequest.storageId}".`);
    const SIGNED_IN_USER: Readonly<ISignedInUser> | null = this.CONTEXT.getSignedInUser();
    if (SIGNED_IN_USER === null) {
      throw new Error("No signed in user");
    }
    const DECRYPTION_AES_KEY: Buffer | undefined = this.CONTEXT.getDataStorageResourceAESKeyFromId(
      userDataBoxNameAvailabilityRequest.storageId as UUID,
      this.logger
    );
    if (DECRYPTION_AES_KEY === undefined) {
      throw new Error(`Could not get Storage Secured User Data Box Config decryption AES key`);
    }
    // TODO: Don't make a data storage read for this
    for (const STORAGE_SECURED_DATA_BOX_CONFIG of this.CONTEXT.getStorageSecuredUserDataBoxConfigsForUserDataStorage(
      userDataBoxNameAvailabilityRequest.storageId as UUID,
      { includeIds: "all", excludeIds: null } satisfies IUserDataStorageUserDataBoxConfigFilter
    )) {
      const SECURED_DATA_BOX_CONFIG: ISecuredUserDataBoxConfig = storageSecuredUserDataBoxConfigToSecuredUserDataBoxConfig(
        STORAGE_SECURED_DATA_BOX_CONFIG,
        DECRYPTION_AES_KEY,
        null
      );
      if (SECURED_DATA_BOX_CONFIG.name === userDataBoxNameAvailabilityRequest.name) {
        this.logger.info(`Unavailable User Data Box name in User Data Storage "${userDataBoxNameAvailabilityRequest.storageId}".`);
        return false;
      }
    }
    this.logger.info(`Available User Data Box name in User Data Storage "${userDataBoxNameAvailabilityRequest.storageId}".`);
    return true;
  }

  public getAllSignedInUserAvailableUserDataBoxesInfo(): IUserDataBoxInfo[] {
    this.logger.debug("Getting all signed in user's available User Data Boxes Info.");
    return this.CONTEXT.getAvailableDataBoxes().map((dataBox: IUserDataBox): IUserDataBoxInfo => {
      return userDataBoxToUserDataBoxInfo(dataBox, null);
    });
  }
}
