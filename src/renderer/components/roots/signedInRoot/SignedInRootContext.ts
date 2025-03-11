import { useOutletContext } from "react-router-dom";
import { IAppRootContext } from "@renderer/components/roots/appRoot/AppRootContext";
import { IPublicSignedInUser } from "@shared/user/account/PublicSignedInUser";
import { IPublicUserDataStorageConfig } from "@shared/user/data/storage/config/public/PublicUserDataStorageConfig";

export interface ISignedInRootContext extends IAppRootContext {
  signedInUser: IPublicSignedInUser;
  publicUserDataStorageConfigs: IPublicUserDataStorageConfig[];
  setForbiddenLocationName: (newForbiddenLocationName: string) => void;
}

export const useSignedInRootContext = (): ISignedInRootContext => {
  return useOutletContext<ISignedInRootContext>();
};
