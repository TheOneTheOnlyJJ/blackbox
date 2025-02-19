import { ISecuredPasswordData } from "@main/utils/encryption/SecuredPasswordData";
import { UUID } from "crypto";

export interface ISecuredUserSignUpData {
  userId: UUID;
  username: string;
  securedPassword: ISecuredPasswordData;
}
