import { UUID } from "crypto";

export interface ISecuredUserSignUpData {
  userId: UUID;
  username: string;
  passwordHash: Buffer;
  passwordSalt: Buffer;
}
