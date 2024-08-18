import { UserId } from "./UserId";

export interface INewUserCompleteData {
  id: UserId;
  username: string;
  passwordHash: string;
  passwordSalt: string;
}
