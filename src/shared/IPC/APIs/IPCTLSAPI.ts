import { IEncryptedData } from "@shared/utils/EncryptedData";

// Communication is only done from preload to renderer and vice-versa, no IPC channels needed
export interface IIPCTLSAPI {
  isAESKeyReady: () => boolean;
  encryptData: (data: string, dataPurposeToLog?: string) => Promise<IEncryptedData>;
}
