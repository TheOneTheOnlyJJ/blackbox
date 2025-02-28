export interface IPublicUserDataStorageConfig {
  storageId: string;
  name: string;
  type: string; // TODO: Add backendConfig and a new type to represent it, with nice titles
  isOpen: boolean;
}
