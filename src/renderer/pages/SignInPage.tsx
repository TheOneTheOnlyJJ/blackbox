import { Link } from "react-router-dom";
import Box from "@mui/material/Box/Box";
import Typography from "@mui/material/Typography/Typography";
import Paper from "@mui/material/Paper/Paper";
import { FC } from "react";
import UserSignInForm from "@renderer/components/forms/UserSignInForm";

const SignInPage: FC = () => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        backgroundImage: `linear-gradient(-45deg, #FFC796 0%, #FF6B95 100%)`
      }}
    >
      <Paper
        elevation={24}
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
          minWidth: "40%",
          maxHeight: "80%",
          padding: "2%",
          overflow: "auto"
        }}
      >
        <Typography variant="h4">Sign In</Typography>
        <UserSignInForm />
        <Typography>
          New to BlackBox?{" "}
          <Link to="/signup" replace={true}>
            Sign Up
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
};

export default SignInPage;
