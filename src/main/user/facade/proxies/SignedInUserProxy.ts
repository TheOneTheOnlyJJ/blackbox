import { ISignedInUser } from "@main/user/account/SignedInUser";

export interface ISignedInUserProxy {
  value: Readonly<ISignedInUser> | null;
}
