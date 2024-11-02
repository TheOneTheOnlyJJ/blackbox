// TODO: Make these as const
export enum IPCTLSAPIIPCChannel {
  getMainProcessPublicRSAKeyDER = "IPCTLSAPI:getMainProcessPublicRSAKeyDER",
  sendRendererProcessWrappedAESKey = "IPCTLSAPI:sendRendererProcessWrappedAESKey"
}

export enum UserAPIIPCChannel {
  isAccountStorageAvailable = "userAPI:isAccountStorageAvailable",
  onAccountStorageAvailabilityChange = "userAPI:onAccountStorageAvailabilityChange",
  isUsernameAvailable = "userAPI:isUsernameAvailable",
  signUp = "userAPI:signUp",
  getUserCount = "userAPI:getUserCount",
  signIn = "userAPI:signIn",
  signOut = "userAPI:signOut",
  getCurrentlySignedInUser = "userAPI:getCurrentlySignedInUser",
  onCurrentlySignedInUserChange = "userAPI:onCurrentlySignedInUserChange"
}
