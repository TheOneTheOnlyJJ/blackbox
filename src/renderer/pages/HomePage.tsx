/* eslint-disable react/no-unescaped-entities */
import { Box, Button, Paper, TextField, Typography } from "@mui/material";
import { FC } from "react";
import "@fontsource/saira-stencil-one";
import { Link } from "react-router-dom";
import { useRootContext } from "../root/RootContext";

const BACKGROUND_COLOR_1 = "black";
const BACKGROUND_COLOR_2 = "white";

const HomePage: FC = () => {
  const appContext = useRootContext();
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
          disabled={!appContext.isUserStorageInitialised}
        />
        <TextField
          variant="standard"
          label="Password"
          sx={{
            paddingBottom: "1vw"
          }}
          disabled={!appContext.isUserStorageInitialised}
        />
        <Button size="large" variant="contained" disabled={!appContext.isUserStorageInitialised}>
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

export default HomePage;
