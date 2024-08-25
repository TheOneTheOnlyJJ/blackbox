export enum IPCEncryptionIPCChannel {
  getMainProcessPublicRSAKeyDER = "IPCEncryption:getMainProcessPublicRSAKeyDER",
  sendRendererProcessWrappedAESKey = "IPCEncryption:sendRendererProcessWrappedAESKey"
}

export enum UserAccountManagerIPCChannel {
  isStorageAvailable = "userAccountManager:isStorageAvailable",
  onStorageAvailabilityChange = "userAccountManager:onStorageAvailabilityChange",
  isUsernameAvailable = "userAccountManager:isUsernameAvailable",
  register = "userAccountManager:register",
  getUserCount = "userAccountManager:getUserCount"
}
