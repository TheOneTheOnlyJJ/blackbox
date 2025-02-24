import { useOutletContext } from "react-router-dom";
import { ISignedInUser } from "@shared/user/account/SignedInUser";
import { ICurrentUserAccountStorage } from "@shared/user/account/storage/CurrentUserAccountStorage";

export interface IAppRootContext {
  signedInUser: ISignedInUser | null;
  signedInNavigationEntryIndex: number;
  currentUserAccountStorage: ICurrentUserAccountStorage | null;
  isIPCTLSReady: {
    main: boolean;
    renderer: boolean;
    both: boolean;
  };
}

export const useAppRootContext = (): IAppRootContext => {
  return useOutletContext<IAppRootContext>();
};
