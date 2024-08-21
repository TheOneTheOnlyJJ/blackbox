export const insertLineBreaks = (str: string, lineLength = 64): string => {
  const regex = new RegExp(`(.{${lineLength.toString()}})`, "g");
  return str.replace(regex, "$1\n");
};
