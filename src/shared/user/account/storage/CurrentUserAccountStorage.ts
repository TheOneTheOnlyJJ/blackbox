export interface ICurrentUserAccountStorage {
  storageId: string;
  name: string; // TODO: Add backendConfig and a new type to represent it
  isOpen: boolean;
}
