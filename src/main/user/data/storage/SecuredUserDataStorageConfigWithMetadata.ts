import { UUID } from "node:crypto";
import { UserDataStorageConfig } from "./UserDataStorageConfig";
import { ISecuredPasswordData } from "@shared/utils/ISecuredPasswordData";

export interface ISecuredUserDataStorageConfigWithMetadata {
  configId: UUID;
  name: string;
  visibilityPassword?: ISecuredPasswordData;
  config: UserDataStorageConfig;
}
