import { FC, useEffect } from "react";
import { useLoggerContext } from "./components/LoggerContext";

const App: FC = () => {
  const { appLogger } = useLoggerContext();

  useEffect(() => {
    appLogger.info("Emitting new user storage request to main process.");
    window.api.newUserStorage();
  }, []);

  return (
    <>
      <div>Hello, Electron with React and TypeScript!</div>
    </>
  );
};

export default App;
