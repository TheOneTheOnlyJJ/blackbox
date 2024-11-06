export const IPC_API_RESPONSE_STATUSES = {
  SUCCESS: 200,

  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,

  INTERNAL_ERROR: 500
} as const;
export type IPCAPIResponseStatuses = typeof IPC_API_RESPONSE_STATUSES;
export type IPCAPIResponseStatus = IPCAPIResponseStatuses[keyof IPCAPIResponseStatuses];
