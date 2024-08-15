/* eslint-disable react/no-unescaped-entities */
import { Box, Button, IconButton, InputAdornment, Paper, TextField, Typography } from "@mui/material";
import { FC, useState } from "react";
import "@fontsource/saira-stencil-one";
import { Link } from "react-router-dom";
import { useRootContext } from "../root/RootContext";
import { Visibility, VisibilityOff } from "@mui/icons-material";

const BACKGROUND_COLOR_1 = "black";
const BACKGROUND_COLOR_2 = "white";

const LoginPage: FC = () => {
  const appContext = useRootContext();
  const [doShowPassword, setDoShowPassword] = useState<boolean>(false);
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "start",
        alignItems: "center",
        flexDirection: "column",
        width: "100vw",
        height: "100vh",
        backgroundImage: `conic-gradient(at 50% 35%, ${BACKGROUND_COLOR_1}, ${BACKGROUND_COLOR_2})`
      }}
    >
      <Typography
        variant="h1"
        sx={{
          fontFamily: "Saira Stencil One, system-ui",
          fontSize: "15vw",
          color: BACKGROUND_COLOR_1,
          marginTop: "5vh",
          paddingRight: "11.75vw"
        }}
      >
        Black
        <span style={{ color: BACKGROUND_COLOR_2 }}>Box</span>
      </Typography>
      <Paper
        elevation={24}
        sx={{
          display: "flex",
          flexDirection: "column",
          padding: "1vw",
          marginTop: "5vh"
        }}
      >
        <Typography
          variant="h4"
          sx={{
            textAlign: "center",
            padding: "1vw"
          }}
        >
          Login
        </Typography>
        <TextField
          variant="standard"
          label="Username"
          sx={{
            paddingBottom: "1vw"
          }}
        />
        <TextField
          variant="standard"
          label="Password"
          type={doShowPassword ? "text" : "password"}
          sx={{
            paddingBottom: "1vw"
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={() => {
                    setDoShowPassword((prevShowPassword) => !prevShowPassword);
                  }}
                >
                  {doShowPassword ? <Visibility /> : <VisibilityOff />}
                </IconButton>
              </InputAdornment>
            )
          }}
        />
        <Button size="large" variant="contained" disabled={!appContext.isUserStorageAvailable}>
          Login
        </Button>
        <Typography
          sx={{
            textAlign: "center",
            padding: "1vw"
          }}
        >
          Don't have an account? <Link to="/register">Register</Link>
        </Typography>
      </Paper>
    </Box>
  );
};

export default LoginPage;
