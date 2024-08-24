export const arrayBufferToBase64 = (arrayBuffer: ArrayBuffer): string => {
  const UINT8_ARRAY = new Uint8Array(arrayBuffer);
  let binary = "";
  UINT8_ARRAY.forEach((byte) => (binary += String.fromCharCode(byte)));
  return window.btoa(binary);
};
