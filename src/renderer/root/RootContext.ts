import { useOutletContext } from "react-router-dom";

export interface RootContext {
  isUserStorageInitialised: boolean;
}

export const useRootContext = (): RootContext => {
  return useOutletContext<RootContext>();
};
