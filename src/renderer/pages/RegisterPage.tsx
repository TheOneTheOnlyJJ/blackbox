import { Box, Typography } from "@mui/material";
import { FC } from "react";
import { Link } from "react-router-dom";

const RegisterPage: FC = () => {
  return (
    <Box>
      <Typography>Register Page</Typography>
      <Link to="/">Back to home</Link>
    </Box>
  );
};

export default RegisterPage;
