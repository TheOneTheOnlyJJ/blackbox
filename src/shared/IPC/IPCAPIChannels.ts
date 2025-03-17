export type TransformToIPCAPIChannels<TIPCAPIName extends string, TIPCAPI> = {
  [K in keyof TIPCAPI]: `${Capitalize<TIPCAPIName>}:${string & K}`;
};
