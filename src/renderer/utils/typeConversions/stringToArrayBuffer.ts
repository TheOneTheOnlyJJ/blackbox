export const stringToArrayBuffer = (str: string): ArrayBuffer => {
  const BUF = new ArrayBuffer(str.length);
  const BUF_VIEW = new Uint8Array(BUF);
  for (let i = 0; i < str.length; i++) {
    BUF_VIEW[i] = str.charCodeAt(i);
  }
  return BUF;
};
