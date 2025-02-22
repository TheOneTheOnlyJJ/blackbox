import { ISecuredPasswordData } from "@main/utils/encryption/SecuredPasswordData";
import { UUID } from "crypto";

export interface ISecuredUserSignUpPayload {
  userId: UUID;
  username: string;
  securedPassword: ISecuredPasswordData;
}
