import { Dispatch, SetStateAction } from "react";
import { useOutletContext } from "react-router-dom";
import { UserStorageConfig } from "src/shared/user/storage/types";

export interface AppContext {
  userStorageConfig: UserStorageConfig | null;
  setUserStorageConfig: Dispatch<SetStateAction<UserStorageConfig | null>>;
}

export const useAppContext = (): AppContext => {
  return useOutletContext<AppContext>();
};
