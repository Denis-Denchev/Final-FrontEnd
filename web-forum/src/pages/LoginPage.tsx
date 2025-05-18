import * as React from "react";
import {
  Avatar,
  Box,
  Button,
  Checkbox,
  TextField,
  Typography,
  CssBaseline,
  Container,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { useNavigate } from "react-router-dom";
import { login } from "../api/auth";

export default function LoginPage() {
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const username = data.get("username") as string;
    const password = data.get("password") as string;

    try {
      const response = await login(username, password);
      localStorage.setItem("token", response.data.access_token);
      navigate("/categories");
    } catch (err: any) {
      alert("Login failed: " + (err.response?.data?.detail || "Unknown error"));
    }
  };

  return (
    <>
      <CssBaseline />
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: (theme) =>
            theme.palette.mode === "dark"
              ? "radial-gradient(ellipse at center, #1e293b 0%, #0f172a 100%)"
              : "radial-gradient(ellipse at center, #e2e8f0 0%, #f5f5f5 100%)",
        }}
      >
        <Container maxWidth="xs">
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              backgroundColor: "background.paper",
              padding: 4,
              borderRadius: 2,
              boxShadow: 3,
            }}
          >
            <Avatar sx={{ m: 1, bgcolor: "primary.main" }}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              Sign in
            </Typography>
            <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="Username"
                name="username"
                autoComplete="username"
                autoFocus
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
              />
              <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
                <Checkbox value="remember" color="primary" sx={{ p: 0.5, pr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Remember me
                </Typography>
              </Box>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 2, mb: 1, borderRadius: 2, fontWeight: 600 }}
              >
                Sign in
              </Button>
              <Button fullWidth onClick={() => navigate("/")} color="secondary">
                Back to Home
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>
    </>
  );
}
