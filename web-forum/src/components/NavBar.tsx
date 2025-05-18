import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  useTheme,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import LogoutIcon from "@mui/icons-material/Logout";
import LoginIcon from "@mui/icons-material/Login";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import ForumIcon from "@mui/icons-material/Forum";
import axios from "axios";
import { useThemeMode } from "../context/ThemeContext";

const NavBar = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { toggleTheme, logout } = useThemeMode();

  const handleLogout = async () => {
    try {
      await axios.post("/api/logout");
      logout();
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const isLoggedIn = Boolean(localStorage.getItem("token"));

  return (
    <AppBar position="static" color="default" sx={{ mb: 4 }}>
      <Toolbar>
        <ForumIcon sx={{ mr: 2 }} />
        <Typography
          variant="h6"
          component="div"
          sx={{ flexGrow: 1, cursor: "pointer" }}
          onClick={() => navigate("/")}
        >
          Alpha Panda Forum
        </Typography>

        <IconButton onClick={toggleTheme} color="inherit">
          {theme.palette.mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
        </IconButton>

        <Box>
          {isLoggedIn ? (
            <>
              <Button color="inherit" onClick={() => navigate("/categories")}>
                Categories
              </Button>
              <Button
                color="inherit"
                startIcon={<LogoutIcon />}
                onClick={handleLogout}
              >
                Logout
              </Button>
            </>
          ) : (
            <Button
              color="inherit"
              startIcon={<LoginIcon />}
              onClick={() => navigate("/login")}
            >
              Login
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;
