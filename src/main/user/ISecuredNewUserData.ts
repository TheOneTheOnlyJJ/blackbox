import { UUID } from "crypto";

export interface ISecuredNewUserData {
  id: UUID;
  username: string;
  passwordHash: string;
  passwordSalt: string;
}
