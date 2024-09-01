export enum IPCEncryptionAPIIPCChannel {
  getMainProcessPublicRSAKeyDER = "IPCEncryptionAPI:getMainProcessPublicRSAKeyDER",
  sendRendererProcessWrappedAESKey = "IPCEncryptionAPI:sendRendererProcessWrappedAESKey"
}

export enum UserAPIIPCChannel {
  isStorageAvailable = "userAPI:isStorageAvailable",
  onUserStorageAvailabilityChange = "userAPI:onUserStorageAvailabilityChange",
  isUsernameAvailable = "userAPI:isUsernameAvailable",
  signUp = "userAPI:signUp",
  getUserCount = "userAPI:getUserCount",
  signIn = "userAPI:signIn",
  signOut = "userAPI:signOut",
  getCurrentlySignedInUser = "userAPI:getCurrentlySignedInUser",
  onCurrentlySignedInUserChange = "userAPI:onCurrentlySignedInUserChange"
}
