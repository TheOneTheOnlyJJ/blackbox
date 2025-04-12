import { IEncryptedData } from "@shared/utils/EncryptedData";
import { TransformToIPCAPIChannels } from "../IPCAPIChannels";
import { IUserDataBoxConfigCreateDTO } from "@shared/user/data/box/create/DTO/UserDataBoxConfigCreateDTO";
import { IPCAPIResponse } from "../IPCAPIResponse";
import { IUserDataBoxNameAvailabilityRequest } from "@shared/user/data/box/create/UserDataBoxNameAvailabilityRequest";
import { IUserDataBoxInfo } from "@shared/user/data/box/info/UserDataBoxInfo";
import { IDataChangedDiff } from "@shared/utils/DataChangedDiff";

export type AvailableUserDataBoxesChangedCallback = (
  encryptedAvailableUserDataBoxesInfoChangedDiff: IEncryptedData<IDataChangedDiff<string, IUserDataBoxInfo>>
) => void;

export interface IUserDataBoxAPI {
  isUserDataBoxNameAvailableForUserDataStorage: (
    encryptedUserDataBoxNameAvailabilityRequest: IEncryptedData<IUserDataBoxNameAvailabilityRequest>
  ) => IPCAPIResponse<boolean>;
  addUserDataBoxConfig: (encryptedUserDataBoxConfigCreateDTO: IEncryptedData<IUserDataBoxConfigCreateDTO>) => IPCAPIResponse<boolean>;
  getAllSignedInUserAvailableUserDataBoxesInfo: () => IPCAPIResponse<IEncryptedData<IUserDataBoxInfo[]>>;
  onAvailableUserDataBoxesChanged: (callback: AvailableUserDataBoxesChangedCallback) => () => void;
}

export type UserDataBoxAPIIPCChannels = TransformToIPCAPIChannels<"UserDataBoxAPI", IUserDataBoxAPI>;
export type UserDataBoxAPIIPCChannel = UserDataBoxAPIIPCChannels[keyof UserDataBoxAPIIPCChannels];

export const USER_DATA_BOX_API_IPC_CHANNELS: UserDataBoxAPIIPCChannels = {
  isUserDataBoxNameAvailableForUserDataStorage: "UserDataBoxAPI:isUserDataBoxNameAvailableForUserDataStorage",
  addUserDataBoxConfig: "UserDataBoxAPI:addUserDataBoxConfig",
  getAllSignedInUserAvailableUserDataBoxesInfo: "UserDataBoxAPI:getAllSignedInUserAvailableUserDataBoxesInfo",
  onAvailableUserDataBoxesChanged: "UserDataBoxAPI:onAvailableUserDataBoxesChanged"
};
