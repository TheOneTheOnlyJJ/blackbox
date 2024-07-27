import { FC, ReactNode, Context, createContext, useContext } from "react";
import log from "electron-log/renderer";
import { LogFunctions } from "electron-log";

interface ILoggerContext {
  appLogger: LogFunctions;
}

interface LoggerContextProps {
  children: ReactNode;
}

export const LoggerContext: Context<ILoggerContext | undefined> = createContext<ILoggerContext | undefined>(undefined);

export const LoggerProvider: FC<LoggerContextProps> = ({ children }) => {
  const contextValue: ILoggerContext = {
    appLogger: log.scope("renderer-app")
  };
  return <LoggerContext.Provider value={contextValue}>{children}</LoggerContext.Provider>;
};

export const useLoggerContext = (): ILoggerContext => {
  const loggerContext = useContext(LoggerContext);
  if (!loggerContext) {
    throw new Error("useLoggerContext must be used within a LoggerProvider");
  }
  return loggerContext;
};
