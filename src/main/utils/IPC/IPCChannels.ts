export enum IPCEncryptionIPCChannel {
  getMainProcessPublicRSAKeyDER = "IPCEncryption:getMainProcessPublicRSAKeyDER",
  sendRendererProcessWrappedAESKey = "IPCEncryption:sendRendererProcessWrappedAESKey"
}

export enum UserAccountManagerIPCChannel {
  isStorageAvailable = "userAccountManager:isStorageAvailable",
  onUserStorageAvailabilityChange = "userAccountManager:onUserStorageAvailabilityChange",
  isUsernameAvailable = "userAccountManager:isUsernameAvailable",
  register = "userAccountManager:register",
  getUserCount = "userAccountManager:getUserCount",
  login = "userAccountManager:login",
  onCurrentlyLoggedInUserChange = "userAccountManager:onCurrentlyLoggedInUserChange"
}
