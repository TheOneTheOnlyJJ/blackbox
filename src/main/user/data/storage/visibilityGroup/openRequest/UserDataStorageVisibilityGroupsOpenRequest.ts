import { UUID } from "node:crypto";

export interface IUserDataStorageVisibilityGroupsOpenRequest {
  userIdToOpenFor: UUID;
  password: string;
}
