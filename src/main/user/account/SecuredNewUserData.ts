import { UUID } from "crypto";

export interface ISecuredUserSignUpData {
  userId: UUID;
  username: string;
  password: {
    hash: Buffer;
    salt: Buffer;
  };
}
