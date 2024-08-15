// Declare API interfaces
export interface IUserAPI {
  isStorageAvailable: () => Promise<boolean>;
  onStorageAvailabilityChanged: (callback: (isAvailable: boolean) => void) => void;
  isUsernameAvailable: (username: string) => boolean;
}
