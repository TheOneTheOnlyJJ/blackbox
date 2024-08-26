import { useOutletContext } from "react-router-dom";
import { ICurrentlyLoggedInUser } from "../../shared/user/ICurrentlyLoggedInUser";

export interface AppRootContext {
  rendererProcessAESKey: CryptoKey | null;
  currentlyLoggedInUser: ICurrentlyLoggedInUser | null;
  isUserStorageAvailable: boolean;
}

export const useAppRootContext = (): AppRootContext => {
  return useOutletContext<AppRootContext>();
};
