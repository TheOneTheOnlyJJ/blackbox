import Box from "@mui/material/Box/Box";
import Typography from "@mui/material/Typography/Typography";
import { FC, useEffect } from "react";
import { SignedInRootContext, useSignedInRootContext } from "../components/roots/signedInRoot/SignedInRootContext";

const SettingsPage: FC = () => {
  const signedInRootContext: SignedInRootContext = useSignedInRootContext();

  useEffect(() => {
    signedInRootContext.setAppBarTitle("Settings");
  }, []);

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "start",
        alignItems: "center",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        background: "blue"
      }}
    >
      <Typography variant="h5">Settings</Typography>
    </Box>
  );
};

export default SettingsPage;
