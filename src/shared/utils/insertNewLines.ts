export const insertLineBreaks = (str: string, lineLength = 64): string => {
  const REGEX = new RegExp(`(.{${lineLength.toString()}})`, "g");
  return str.replace(REGEX, "$1\n");
};
