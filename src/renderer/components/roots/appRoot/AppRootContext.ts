import { IPublicSignedInUser } from "@shared/user/account/PublicSignedInUser";
import { IUserAccountStorageInfo } from "@shared/user/account/storage/info/UserAccountStorageInfo";
import { useOutletContext } from "react-router-dom";

export interface IAppRootContext {
  signedInUser: IPublicSignedInUser | null;
  signedInNavigationEntryIndex: number;
  currentUserAccountStorageInfo: IUserAccountStorageInfo | null;
  isIPCTLSReady: {
    main: boolean;
    renderer: boolean;
    both: boolean;
  };
}

export const useAppRootContext = (): IAppRootContext => {
  return useOutletContext<IAppRootContext>();
};
