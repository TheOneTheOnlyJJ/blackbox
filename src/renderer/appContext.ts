import { useOutletContext } from "react-router-dom";

export interface AppContext {
  isUserStorageInitialised: boolean;
}

export const useAppContext = (): AppContext => {
  return useOutletContext<AppContext>();
};
