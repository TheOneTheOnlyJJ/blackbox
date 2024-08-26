import { FC, useState } from "react";
import "@fontsource/saira-stencil-one";
import { Link } from "react-router-dom";
import { useAppRootContext } from "../appRoot/AppRootContext";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import Box from "@mui/material/Box/Box";
import Typography from "@mui/material/Typography/Typography";
import Paper from "@mui/material/Paper/Paper";
import TextField from "@mui/material/TextField/TextField";
import InputAdornment from "@mui/material/InputAdornment/InputAdornment";
import IconButton from "@mui/material/IconButton/IconButton";
import Button from "@mui/material/Button/Button";

const BACKGROUND_COLOR_1 = "black";
const BACKGROUND_COLOR_2 = "white";

const LoginPage: FC = () => {
  const appRootContext = useAppRootContext();
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
                  onClick={(): void => {
                    setDoShowPassword((prevShowPassword) => !prevShowPassword);
                  }}
                >
                  {doShowPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
                </IconButton>
              </InputAdornment>
            )
          }}
        />
        <Button size="large" variant="contained" disabled={!appRootContext.isUserStorageAvailable}>
          Login
        </Button>
        <Typography
          sx={{
            textAlign: "center",
            padding: "1vw"
          }}
        >
          Don&apos;t have an account? <Link to="/register">Register</Link>
        </Typography>
      </Paper>
    </Box>
  );
};

export default LoginPage;
