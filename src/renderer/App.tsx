import { FC } from "react";
import CssBaseline from "@mui/material/CssBaseline/CssBaseline";
import { AppRouter } from "./AppRouter";

export const App: FC = () => {
  return (
    <>
      <CssBaseline />
      <AppRouter />
    </>
  );
};
