import { useOutletContext } from "react-router-dom";

export interface RootContext {
  mainProcessPublicRSAKey: string;
  isUserStorageAvailable: boolean;
}

export const useRootContext = (): RootContext => {
  return useOutletContext<RootContext>();
};
