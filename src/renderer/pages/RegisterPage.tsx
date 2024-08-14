import { Box, Button, Typography } from "@mui/material";
import { FC } from "react";
import { Link } from "react-router-dom";
import { useRootContext } from "../root/RootContext";

const RegisterPage: FC = () => {
  const appContext = useRootContext();
  return (
    <Box>
      <Typography>Register Page</Typography>
      <Button variant="contained" disabled={!appContext.isUserStorageAvailable}>
        Register
      </Button>
      <Link to="/">Back to home</Link>
    </Box>
  );
};

export default RegisterPage;
