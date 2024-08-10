// Declare API interfaces
interface IUserStorageAPI {
  getDefaultConfig: () => Promise<AccountManagerConfig>;
  new: (config: AccountManagerConfig) => Promise<boolean>;
}

declare global {
  interface Window {
    userStorageAPI: IUserStorageAPI;
  }
}

// Ensure TypeScript recognizes this file as part of the global declarations
export {};
