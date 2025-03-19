import { UserAccountStorage } from "@main/user/account/storage/UserAccountStorage";

export interface IUserAccountStorageProxy {
  value: UserAccountStorage | null;
}
