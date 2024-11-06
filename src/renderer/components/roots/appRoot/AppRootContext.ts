import { useOutletContext } from "react-router-dom";
import { ICurrentlySignedInUser } from "@shared/user/account/CurrentlySignedInUser";

export interface IAppRootContext {
  rendererProcessAESKey: CryptoKey | null;
  currentlySignedInUser: ICurrentlySignedInUser | null;
  isUserAccountStorageAvailable: boolean;
}

export const useAppRootContext = (): IAppRootContext => {
  return useOutletContext<IAppRootContext>();
};
