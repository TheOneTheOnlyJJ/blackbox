import { FC, useEffect, useState } from "react";
import { useLoggerContext } from "./components/LoggerContext";

const App: FC = () => {
  const { appLogger } = useLoggerContext();
  const [msg, setMsg] = useState<string>("");

  useEffect(() => {
    appLogger.info("Emitting new user account manager request to main process.");
    window.api.newUserAccountManager();
    window.api.onCreatedUserAccountManager(() => {
      setMsg("SUCCESS");
    });
    window.api.onFailedCreatingUserAccountManager(() => {
      setMsg("FAILED");
    });
  }, []);

  return (
    <>
      <div>Hello, Electron with React and TypeScript!</div>
      <p>
        User account manager creation status : <strong>{msg}</strong>
      </p>
    </>
  );
};

export default App;
