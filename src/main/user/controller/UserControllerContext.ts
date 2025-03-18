import { IOpenUserDataStorageVisibilityGroupsProxy } from "./proxies/OpenUserDataStorageVisibilityGroupsProxy";
import { ISignedInUserProxy } from "./proxies/SignedInUserProxy";
import { IUserAccountStorageProxy } from "./proxies/UserAccountStorageProxy";

export class UserControllerContext {
  public readonly accountStorage: IUserAccountStorageProxy;
  public readonly signedInUser: ISignedInUserProxy;
  public readonly openDataStorageVisibilityGroups: IOpenUserDataStorageVisibilityGroupsProxy;

  public constructor(
    accountStorage: IUserAccountStorageProxy,
    signedInUser: ISignedInUserProxy,
    openDataStorageVisibilityGroups: IOpenUserDataStorageVisibilityGroupsProxy
  ) {
    this.accountStorage = accountStorage;
    this.signedInUser = signedInUser;
    this.openDataStorageVisibilityGroups = openDataStorageVisibilityGroups;
  }
}
