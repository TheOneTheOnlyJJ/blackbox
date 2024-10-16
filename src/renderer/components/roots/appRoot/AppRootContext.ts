import { useOutletContext } from "react-router-dom";
import { ICurrentlySignedInUser } from "@shared/user/ICurrentlySignedInUser";

export interface AppRootContext {
  rendererProcessAESKey: CryptoKey | null;
  currentlySignedInUser: ICurrentlySignedInUser | null;
  isUserAccountStorageAvailable: boolean;
}

export const useAppRootContext = (): AppRootContext => {
  return useOutletContext<AppRootContext>();
};
