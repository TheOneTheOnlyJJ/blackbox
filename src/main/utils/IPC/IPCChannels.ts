export enum IPCTLSAPIIPCChannel {
  getMainProcessPublicRSAKeyDER = "IPCTLSAPI:getMainProcessPublicRSAKeyDER",
  sendRendererProcessWrappedAESKey = "IPCTLSAPI:sendRendererProcessWrappedAESKey"
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
