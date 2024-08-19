export enum IPCEncryptionIPCChannel {
  getMainProcessPublicRSAKey = "IPCEncryption:getMainProcessPublicRSAKey"
}

export enum UserAccountManagerIPCChannel {
  isStorageAvailable = "userAccountManager:isStorageAvailable",
  onStorageAvailabilityChange = "userAccountManager:onStorageAvailabilityChange",
  isUsernameAvailable = "userAccountManager:isUsernameAvailable",
  register = "userAccountManager:register"
}
