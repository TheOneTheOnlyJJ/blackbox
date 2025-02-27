import { IPublicSignedInUser } from "@shared/user/account/PublicSignedInUser";
import { IPublicUserAccountStorage } from "@shared/user/account/storage/PublicUserAccountStorage";
import { useOutletContext } from "react-router-dom";

export interface IAppRootContext {
  signedInUser: IPublicSignedInUser | null;
  signedInNavigationEntryIndex: number;
  currentUserAccountStorage: IPublicUserAccountStorage | null;
  isIPCTLSReady: {
    main: boolean;
    renderer: boolean;
    both: boolean;
  };
}

export const useAppRootContext = (): IAppRootContext => {
  return useOutletContext<IAppRootContext>();
};
