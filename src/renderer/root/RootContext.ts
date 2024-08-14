import { useOutletContext } from "react-router-dom";

export interface RootContext {
  isUserStorageAvailable: boolean;
}

export const useRootContext = (): RootContext => {
  return useOutletContext<RootContext>();
};
