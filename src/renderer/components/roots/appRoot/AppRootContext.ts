import { IPublicSignedInUser } from "@shared/user/account/PublicSignedInUser";
import { IPublicUserAccountStorageConfig } from "@shared/user/account/storage/PublicUserAccountStorageConfig";
import { useOutletContext } from "react-router-dom";

export interface IAppRootContext {
  signedInUser: IPublicSignedInUser | null;
  signedInNavigationEntryIndex: number;
  currentUserAccountStorageConfig: IPublicUserAccountStorageConfig | null;
  isIPCTLSReady: {
    main: boolean;
    renderer: boolean;
    both: boolean;
  };
}

export const useAppRootContext = (): IAppRootContext => {
  return useOutletContext<IAppRootContext>();
};
