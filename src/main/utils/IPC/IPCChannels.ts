export const IPC_TLS_API_IPC_CHANNELS = {
  getMainProcessPublicRSAKeyDER: "IPCTLSAPI:getMainProcessPublicRSAKeyDER",
  sendRendererProcessWrappedAESKey: "IPCTLSAPI:sendRendererProcessWrappedAESKey"
} as const;
export type IPCTLSAPIIPCChannels = typeof IPC_TLS_API_IPC_CHANNELS;
export type IPCTLSAPIIPCChannel = IPCTLSAPIIPCChannels[keyof IPCTLSAPIIPCChannels];

export const USER_API_IPC_CHANNELS = {
  isAccountStorageBackendAvailable: "userAPI:isAccountStorageBackendAvailable",
  onAccountStorageBackendAvailabilityChanged: "userAPI:onAccountStorageBackendAvailabilityChanged",
  isUsernameAvailable: "userAPI:isUsernameAvailable",
  signUp: "userAPI:signUp",
  getUserCount: "userAPI:getUserCount",
  signIn: "userAPI:signIn",
  signOut: "userAPI:signOut",
  addUserDataStorageConfigToUser: "userAPI:addUserDataStorageConfigToUser",
  getCurrentlySignedInUser: "userAPI:getCurrentlySignedInUser",
  onCurrentlySignedInUserChanged: "userAPI:onCurrentlySignedInUserChanged"
} as const;
export type UserAPIIPCChannels = typeof USER_API_IPC_CHANNELS;
export type UserAPIIPCChannel = UserAPIIPCChannels[keyof UserAPIIPCChannels];
