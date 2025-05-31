import { IEncryptedData } from "@shared/utils/EncryptedData";
import { TransformToIPCAPIChannels } from "../IPCAPIChannels";
import { IPCAPIResponse } from "../IPCAPIResponse";
import { IUserDataEntryCreateDTO } from "@shared/user/data/entry/create/DTO/UserDataEntryCreateDTO";
import { IUserDataEntryIdentifier } from "@shared/user/data/entry/identifier/UserDataEntryIdentifier";
import { IUserDataEntryInfo } from "@shared/user/data/entry/info/UserDataEntryInfo";
import { IDataChangedDiff } from "@shared/utils/DataChangedDiff";

export type AvailableUserDataEntriesChangedCallback = (
  encryptedAvailableUserDataEntriesInfoChangedDiff: IEncryptedData<IDataChangedDiff<IUserDataEntryIdentifier, IUserDataEntryInfo>>
) => void;

export interface IUserDataEntryAPI {
  addUserDataEntry: (encryptedUserDataEntryCreateDTO: IEncryptedData<IUserDataEntryCreateDTO>) => IPCAPIResponse<boolean>;
  getAllSignedInUserAvailableUserDataEntriesInfo: () => IPCAPIResponse<IEncryptedData<IUserDataEntryInfo[]>>;
  onAvailableUserDataEntriesChanged: (callback: AvailableUserDataEntriesChangedCallback) => () => void;
}

export type UserDataEntryAPIIPCChannels = TransformToIPCAPIChannels<"UserDataEntryAPI", IUserDataEntryAPI>;
export type UserDataEntryAPIIPCChannel = UserDataEntryAPIIPCChannels[keyof UserDataEntryAPIIPCChannels];

export const USER_DATA_ENTRY_API_IPC_CHANNELS: UserDataEntryAPIIPCChannels = {
  addUserDataEntry: "UserDataEntryAPI:addUserDataEntry",
  getAllSignedInUserAvailableUserDataEntriesInfo: "UserDataEntryAPI:getAllSignedInUserAvailableUserDataEntriesInfo",
  onAvailableUserDataEntriesChanged: "UserDataEntryAPI:onAvailableUserDataEntriesChanged"
};
