import { ISignedInUser } from "@main/user/account/SignedInUser";
import { IUserDataEntry } from "@main/user/data/entry/UserDataEntry";
import { userDataEntryCreateDTOToUserDataEntry } from "@main/user/data/entry/utils/userDataEntryCreateDTOToUserDataEntry";
import { userDataEntryToUserDataEntryInfo } from "@main/user/data/entry/utils/userDataEntryToUserDataEntryInfo";
import { IUserDataEntryCreateDTO } from "@shared/user/data/entry/create/DTO/UserDataEntryCreateDTO";
import { IUserDataEntryInfo } from "@shared/user/data/entry/info/UserDataEntryInfo";
import { LogFunctions } from "electron-log";
import { UUID } from "node:crypto";

export interface IUserDataEntryServiceContext {
  getSignedInUser: () => Readonly<ISignedInUser> | null;
  getAvailableDataEntries: () => IUserDataEntry[];
  generateRandomDataEntryId: (userDataStorageId: UUID, userDataBoxId: UUID, userDataTemplateId: UUID) => UUID;
  addUserDataEntry: (userDataEntry: IUserDataEntry, encryptionAESKey: Buffer) => boolean;
}

export class UserDataEntryService {
  private readonly logger: LogFunctions;
  private readonly CONTEXT: IUserDataEntryServiceContext;

  public constructor(logger: LogFunctions, context: IUserDataEntryServiceContext) {
    this.logger = logger;
    this.logger.debug("Initialising new User Data Entry Service.");
    this.CONTEXT = context;
  }

  public generateRandomDataEntryId(userDataStorageId: UUID, userDataBoxId: UUID, userDataTemplateId: UUID): UUID {
    this.logger.debug(`Generating random User Data Entry ID for User Data Storage "${userDataStorageId}".`);
    return this.CONTEXT.generateRandomDataEntryId(userDataStorageId, userDataBoxId, userDataTemplateId);
  }

  public addUserDataEntryFromCreateDTO(userDataEntryCreateDTO: IUserDataEntryCreateDTO): boolean {
    return this.addUserDataEntry(
      userDataEntryCreateDTOToUserDataEntry(
        userDataEntryCreateDTO,
        this.generateRandomDataEntryId(
          userDataEntryCreateDTO.storageId as UUID,
          userDataEntryCreateDTO.boxId as UUID,
          userDataEntryCreateDTO.templateId as UUID
        ),
        this.logger
      )
    );
  }

  public addUserDataEntry(userDataEntry: IUserDataEntry): boolean {
    this.logger.debug(`Adding User Data Entry to User Data Storage "${userDataEntry.storageId}" and User Data Box "${userDataEntry.boxId}".`);
    const SIGNED_IN_USER: Readonly<ISignedInUser> | null = this.CONTEXT.getSignedInUser();
    if (SIGNED_IN_USER === null) {
      throw new Error("No signed in user");
    }
    return this.CONTEXT.addUserDataEntry(userDataEntry, SIGNED_IN_USER.userDataAESKey); // TODO: When Box Visibility Groups, use key from there
  }

  public getAllSignedInUserAvailableUserDataEntriesInfo(): IUserDataEntryInfo[] {
    this.logger.debug("Getting all signed in user's available User Data Entries Info.");
    return this.CONTEXT.getAvailableDataEntries().map((dataEntry: IUserDataEntry): IUserDataEntryInfo => {
      return userDataEntryToUserDataEntryInfo(dataEntry, null);
    });
  }
}
