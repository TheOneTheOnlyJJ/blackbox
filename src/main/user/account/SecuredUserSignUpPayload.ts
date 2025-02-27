import { ISecuredPassword } from "@main/utils/encryption/SecuredPassword";
import { UUID } from "crypto";

export interface ISecuredUserSignUpPayload {
  userId: UUID;
  username: string;
  securedPassword: ISecuredPassword;
  dataEncryptionAESKeySalt: string;
}
