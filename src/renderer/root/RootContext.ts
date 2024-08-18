import { useOutletContext } from "react-router-dom";

export interface RootContext {
  publicIPCEncryptionKey: string | null;
  isUserStorageAvailable: boolean;
}

export const useRootContext = (): RootContext => {
  return useOutletContext<RootContext>();
};
