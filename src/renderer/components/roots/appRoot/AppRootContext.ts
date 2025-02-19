import { useOutletContext } from "react-router-dom";
import { ICurrentlySignedInUser } from "@shared/user/account/CurrentlySignedInUser";

export interface IAppRootContext {
  currentlySignedInUser: ICurrentlySignedInUser | null;
  isUserAccountStorageBackendAvailable: boolean;
}

export const useAppRootContext = (): IAppRootContext => {
  return useOutletContext<IAppRootContext>();
};
