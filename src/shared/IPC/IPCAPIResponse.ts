import { IPCAPIResponseStatus, IPCAPIResponseStatuses } from "./IPCAPIResponseStatus";

export type IPCAPIResponse<T = undefined> =
  | (T extends undefined
      ? {
          status: IPCAPIResponseStatuses["SUCCESS"];
          message?: string;
        }
      : {
          status: IPCAPIResponseStatuses["SUCCESS"];
          data: T;
          message?: string;
        })
  | {
      status: Exclude<IPCAPIResponseStatus, IPCAPIResponseStatuses["SUCCESS"]>;
      error: string;
      message?: string;
    };
