import Box from "@mui/material/Box/Box";
import Typography from "@mui/material/Typography/Typography";
import { FC, useEffect } from "react";
import { SignedInRootContext, useSignedInRootContext } from "../components/roots/signedInRoot/SignedInRootContext";

const ProfilePage: FC = () => {
  const signedInRootContext: SignedInRootContext = useSignedInRootContext();

  useEffect(() => {
    signedInRootContext.setAppBarTitle("Profile");
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
        background: "yellow"
      }}
    >
      <Typography variant="h5">Profile</Typography>
    </Box>
  );
};

export default ProfilePage;
