import { FC, useEffect } from "react";
import { appLogger } from "./loggers";
import { CssBaseline } from "@mui/material";
import { Outlet } from "react-router-dom";

const App: FC = () => {
  useEffect(() => {
    appLogger.info("Rendering App component.");
  }, []);

  return (
    <>
      <CssBaseline />
      <Outlet />
    </>
  );
};

export default App;
