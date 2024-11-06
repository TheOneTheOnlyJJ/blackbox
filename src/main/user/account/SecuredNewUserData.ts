import { UUID } from "crypto";

export interface ISecuredNewUserData {
  userId: UUID;
  username: string;
  passwordHash: Buffer;
  passwordSalt: Buffer;
}
