import { IPCAPIResponseStatus } from "./IPCAPIResponseStatus";

export type IPCAPIResponse<T = undefined> =
  | (T extends undefined
      ? {
          status: IPCAPIResponseStatus.SUCCESS;
          message?: string;
        }
      : {
          status: IPCAPIResponseStatus.SUCCESS;
          data: T;
          message?: string;
        })
  | {
      status: Exclude<IPCAPIResponseStatus, IPCAPIResponseStatus.SUCCESS>;
      error: string;
      message?: string;
    };
