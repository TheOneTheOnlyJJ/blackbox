import { IEncryptedData } from "@shared/utils/EncryptedData";
import { TransformToIPCAPIChannels } from "../IPCAPIChannels";
import { IUserDataBoxConfigCreateDTO } from "@shared/user/data/box/create/DTO/UserDataBoxConfigCreateDTO";
import { IPCAPIResponse } from "../IPCAPIResponse";

export interface IUserDataBoxNameAvailabilityRequest {
  name: string;
  storageId: string;
}

export interface IUserDataBoxAPI {
  isUserDataBoxNameAvailableForUserDataStorage: (
    encryptedUserDataBoxNameAvailabilityRequest: IEncryptedData<IUserDataBoxNameAvailabilityRequest>
  ) => IPCAPIResponse<boolean>;
  addNewUserDataBox: (encryptedUserDataBoxConfigCreateDTO: IEncryptedData<IUserDataBoxConfigCreateDTO>) => IPCAPIResponse<boolean>;
}

export type UserDataBoxAPIIPCChannels = TransformToIPCAPIChannels<"UserDataBoxAPI", IUserDataBoxAPI>;
export type UserDataBoxAPIIPCChannel = UserDataBoxAPIIPCChannels[keyof UserDataBoxAPIIPCChannels];

export const USER_DATA_BOX_API_IPC_CHANNELS: UserDataBoxAPIIPCChannels = {
  isUserDataBoxNameAvailableForUserDataStorage: "UserDataBoxAPI:isUserDataBoxNameAvailableForUserDataStorage",
  addNewUserDataBox: "UserDataBoxAPI:addNewUserDataBox"
};
