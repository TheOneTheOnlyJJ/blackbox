export enum IPCEncryptionIPCChannel {
  getMainProcessPublicRSAKeyPEM = "IPCEncryption:getMainProcessPublicRSAKeyPEM",
  sendRendererProcessWrappedAESKey = "IPCEncryption:sendRendererProcessWrappedAESKey"
}

export enum UserAccountManagerIPCChannel {
  isStorageAvailable = "userAccountManager:isStorageAvailable",
  onStorageAvailabilityChange = "userAccountManager:onStorageAvailabilityChange",
  isUsernameAvailable = "userAccountManager:isUsernameAvailable",
  register = "userAccountManager:register"
}
