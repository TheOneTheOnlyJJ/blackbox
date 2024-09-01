import { FC } from "react";
import { Link } from "react-router-dom";
import Box from "@mui/material/Box/Box";
import Paper from "@mui/material/Paper/Paper";
import Typography from "@mui/material/Typography/Typography";
import UserSignUpForm from "../components/UserSignUpForm";

const SignUpPage: FC = () => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        width: "100vw",
        height: "100vh",
        backgroundImage: "linear-gradient(to top, #a18cd1 0%, #fbc2eb 100%);"
      }}
    >
      <Paper
        elevation={24}
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
          minWidth: "80%",
          maxHeight: "80%",
          padding: "2%",
          overflow: "auto"
        }}
      >
        <Typography variant="h4">Sign Up</Typography>
        <UserSignUpForm />
        <Link style={{ alignSelf: "start" }} to="/">
          Back to Sign In
        </Link>
      </Paper>
    </Box>
  );
};

export default SignUpPage;
