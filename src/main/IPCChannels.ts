export enum IPCEncryptionIPCChannel {
  getPublicKey = "IPCEncryption:getPublicKey"
}

export enum UserAccountManagerIPCChannel {
  isStorageAvailable = "userAccountManager:isStorageAvailable",
  onStorageAvailabilityChange = "userAccountManager:onStorageAvailabilityChange",
  isUsernameAvailable = "userAccountManager:isUsernameAvailable",
  register = "userAccountManager:register"
}
