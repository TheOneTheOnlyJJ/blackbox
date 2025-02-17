import { ISecuredPasswordData } from "@shared/utils/ISecuredPasswordData";
import { UUID } from "crypto";

export interface ISecuredUserSignUpData {
  userId: UUID;
  username: string;
  password: ISecuredPasswordData;
}
