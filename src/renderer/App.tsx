import { FC, useEffect } from "react";
import { useLoggerContext } from "./components/LoggerContext";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import { CssBaseline } from "@mui/material";
import RegisterPage from "./pages/RegisterPage";

const App: FC = () => {
  const { appLogger } = useLoggerContext();

  useEffect(() => {
    appLogger.info("Rendering App component.");
  }, []);

  return (
    <>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </Router>
    </>
  );
};

export default App;
