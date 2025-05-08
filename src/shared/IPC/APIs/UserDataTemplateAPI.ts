import { IUserDataTemplateConfigCreateDTO } from "@shared/user/data/template/config/create/DTO/UserDataTemplateConfigCreateDTO";
import { TransformToIPCAPIChannels } from "../IPCAPIChannels";
import { IEncryptedData } from "@shared/utils/EncryptedData";
import { IPCAPIResponse } from "../IPCAPIResponse";
import { IDataChangedDiff } from "@shared/utils/DataChangedDiff";
import { IUserDataTemplateInfo } from "@shared/user/data/template/info/UserDataTemplateInfo";
import { IUserDataTemplateNameAvailabilityRequest } from "@shared/user/data/template/config/create/UserDataTemplateNameAvailabilityRequest";
import { IUserDataTemplateIdentifier } from "@shared/user/data/template/identifier/UserDataTemplateIdentifier";

export type AvailableUserDataTemplatesChangedCallback = (
  encryptedUserDataTemplatesInfoChangedDiff: IEncryptedData<IDataChangedDiff<IUserDataTemplateIdentifier, IUserDataTemplateInfo>>
) => void;

export interface IUserDataTemplateAPI {
  isUserDataTemplateNameAvailable: (
    encryptedUserDataTemplateNameAvailabilityRequest: IEncryptedData<IUserDataTemplateNameAvailabilityRequest>
  ) => IPCAPIResponse<boolean>;
  addUserDataTemplateConfig: (encryptedUserDataTemplateConfigCreateDTO: IEncryptedData<IUserDataTemplateConfigCreateDTO>) => IPCAPIResponse<boolean>;
  getAllSignedInUserAvailableUserDataTemplatesInfo: () => IPCAPIResponse<IEncryptedData<IUserDataTemplateInfo[]>>;
  onAvailableUserDataTemplatesChanged: (callback: AvailableUserDataTemplatesChangedCallback) => () => void;
}

export type UserDataTemplateAPIIPCChannels = TransformToIPCAPIChannels<"UserDataTemplateAPI", IUserDataTemplateAPI>;
export type UserDataTemplateAPIIPCChannel = UserDataTemplateAPIIPCChannels[keyof UserDataTemplateAPIIPCChannels];

export const USER_DATA_TEMPLATE_API_IPC_CHANNELS: UserDataTemplateAPIIPCChannels = {
  isUserDataTemplateNameAvailable: "UserDataTemplateAPI:isUserDataTemplateNameAvailable",
  addUserDataTemplateConfig: "UserDataTemplateAPI:addUserDataTemplateConfig",
  getAllSignedInUserAvailableUserDataTemplatesInfo: "UserDataTemplateAPI:getAllSignedInUserAvailableUserDataTemplatesInfo",
  onAvailableUserDataTemplatesChanged: "UserDataTemplateAPI:onAvailableUserDataTemplatesChanged"
};
