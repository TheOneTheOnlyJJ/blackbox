import { UUID } from "node:crypto";
import { UserDataStorageConfig } from "./UserDataStorageConfig";

export interface ISecuredUserDataStorageConfigWithMetadata {
  configId: UUID;
  name: string;
  visibilityPassword?: {
    hash: Buffer;
    salt: Buffer;
  };
  config: UserDataStorageConfig;
}
