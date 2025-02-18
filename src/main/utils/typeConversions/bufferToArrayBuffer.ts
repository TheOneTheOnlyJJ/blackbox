export const bufferToArrayBuffer = (buffer: Buffer): ArrayBuffer => {
  return buffer.byteLength === 0 ? new ArrayBuffer(0) : new Uint8Array(buffer).buffer.slice(0);
};
