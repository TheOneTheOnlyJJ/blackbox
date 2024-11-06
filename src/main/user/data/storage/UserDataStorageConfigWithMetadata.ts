import { UUID } from "node:crypto";
import { UserDataStorageConfig } from "./UserDataStorageConfig";

export interface IUserDataStorageConfigWithMetadata {
  configId: UUID;
  name: string;
  config: UserDataStorageConfig;
}
