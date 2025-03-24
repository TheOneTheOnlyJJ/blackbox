import { ISignedInUserInfo } from "@shared/user/account/SignedInUserInfo";
import { IUserAccountStorageInfo } from "@shared/user/account/storage/info/UserAccountStorageInfo";
import { useOutletContext } from "react-router-dom";
import { IIPCTLSReadinessInfo } from "./hooks/useIPCTLSReadinessState";

export interface IAppRootContext {
  signedInUserInfo: ISignedInUserInfo | null;
  signedInNavigationEntryIndex: number;
  userAccountStorageInfo: IUserAccountStorageInfo | null;
  isIPCTLSReady: IIPCTLSReadinessInfo;
}

export const useAppRootContext = (): IAppRootContext => {
  return useOutletContext<IAppRootContext>();
};
