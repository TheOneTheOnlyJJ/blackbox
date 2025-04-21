import { IUserDataTemplateCreateDTO } from "@shared/user/data/template/create/DTO/UserDataTemplateCreateDTO";
import { TransformToIPCAPIChannels } from "../IPCAPIChannels";
import { IEncryptedData } from "@shared/utils/EncryptedData";
import { IPCAPIResponse } from "../IPCAPIResponse";
import { IDataChangedDiff } from "@shared/utils/DataChangedDiff";
import { IUserDataTemplateInfo } from "@shared/user/data/template/info/UserDataTemplateInfo";
import { IUserDataTemplateNameAvailabilityRequest } from "@shared/user/data/template/create/UserDataTemplateNameAvailabilityRequest";

export type AvailableUserDataTemplatesChangedCallback = (
  encryptedUserDataTemplatesInfoChangedDiff: IEncryptedData<IDataChangedDiff<string, IUserDataTemplateInfo>>
) => void;

export interface IUserDataTemplateAPI {
  isUserDataTemplateNameAvailable: (
    encryptedUserDataTemplateNameAvailabilityRequest: IEncryptedData<IUserDataTemplateNameAvailabilityRequest>
  ) => IPCAPIResponse<boolean>;
  addUserDataTemplate: (encryptedUserDataTemplateCreateDTO: IEncryptedData<IUserDataTemplateCreateDTO>) => IPCAPIResponse<boolean>;
  getAllSignedInUserAvailableUserDataTemplateInfo: () => IPCAPIResponse<IEncryptedData<IUserDataTemplateInfo[]>>;
  onAvailableUserDataTemplatesChanged: (callback: AvailableUserDataTemplatesChangedCallback) => () => void;
}

export type UserDataTemplateAPIIPCChannels = TransformToIPCAPIChannels<"UserDataTemplateAPI", IUserDataTemplateAPI>;
export type UserDataTemplateAPIIPCChannel = UserDataTemplateAPIIPCChannels[keyof UserDataTemplateAPIIPCChannels];

export const USER_DATA_TEMPLATE_API_IPC_CHANNELS: UserDataTemplateAPIIPCChannels = {
  isUserDataTemplateNameAvailable: "UserDataTemplateAPI:isUserDataTemplateNameAvailable",
  addUserDataTemplate: "UserDataTemplateAPI:addUserDataTemplate",
  getAllSignedInUserAvailableUserDataTemplateInfo: "UserDataTemplateAPI:getAllSignedInUserAvailableUserDataTemplateInfo",
  onAvailableUserDataTemplatesChanged: "UserDataTemplateAPI:onAvailableUserDataTemplatesChanged"
};
