import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Button,
  Container,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Menu,
  MenuItem,
} from "@mui/material";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import LogoutIcon from "@mui/icons-material/Logout";
import LoginIcon from "@mui/icons-material/Login";
import { useThemeMode } from "../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function NavBar() {
  const { toggleTheme, logout, mode } = useThemeMode();
  const navigate = useNavigate();
  const isLoggedIn = Boolean(localStorage.getItem("token"));

  // Modal and menu states
  const [openSend, setOpenSend] = useState(false);
  const [receiverUsername, setReceiverUsername] = useState("");
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);

  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [viewUsername, setViewUsername] = useState("");
  const [openView, setOpenView] = useState(false);

  const handleSendMessage = async () => {
    const token = localStorage.getItem("token");
    if (!token || !receiverUsername.trim() || !content.trim()) return;

    setSending(true);
    try {
      await axios.post(
        "https://db-api.alpha-panda.eu/api/v1/messages/",
        {
          content,
          receiver_username: receiverUsername,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setReceiverUsername("");
      setContent("");
      setOpenSend(false);
    } catch (err) {
      console.error("❌ Error sending message:", err);
    } finally {
      setSending(false);
    }
  };

  const handleViewConversation = () => {
    if (viewUsername.trim()) {
      navigate(`/messages/with/${viewUsername}`);
      setOpenView(false);
    }
  };

  return (
    <>
      <AppBar position="fixed" color="primary" elevation={1}>
        <Container maxWidth="lg">
          <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography
              variant="h6"
              component="div"
              onClick={() => navigate("/")}
              sx={{ cursor: "pointer", fontWeight: "bold" }}
            >
              Web Forum
            </Typography>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {isLoggedIn && (
                <Button color="inherit" onClick={() => navigate("/categories")}>
                  Categories
                </Button>
              )}

              {/* Messages Dropdown */}
              {isLoggedIn && (
                <>
                  <Button
                    color="inherit"
                    onClick={(e) => setMenuAnchorEl(e.currentTarget)}
                  >
                    Messages
                  </Button>
                  <Menu
                    anchorEl={menuAnchorEl}
                    open={Boolean(menuAnchorEl)}
                    onClose={() => setMenuAnchorEl(null)}
                  >
                    <MenuItem
                      onClick={() => {
                        setOpenSend(true);
                        setMenuAnchorEl(null);
                      }}
                    >
                      Send Message
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        setOpenView(true);
                        setMenuAnchorEl(null);
                      }}
                    >
                      View Conversation
                    </MenuItem>
                  </Menu>
                </>
              )}

              {/* Toggle Theme */}
              <Tooltip title="Toggle theme">
                <IconButton onClick={toggleTheme} color="inherit">
                  {mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
                </IconButton>
              </Tooltip>

              {isLoggedIn ? (
                <Tooltip title="Logout">
                  <IconButton onClick={logout} color="inherit">
                    <LogoutIcon />
                  </IconButton>
                </Tooltip>
              ) : (
                <Tooltip title="Login">
                  <IconButton
                    onClick={() => navigate("/login")}
                    color="inherit"
                  >
                    <LoginIcon />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Send Message Dialog */}
      <Dialog open={openSend} onClose={() => setOpenSend(false)} fullWidth maxWidth="sm">
        <DialogTitle>Send a Message</DialogTitle>
        <DialogContent>
          <TextField
            label="Receiver Username"
            fullWidth
            value={receiverUsername}
            onChange={(e) => setReceiverUsername(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Message Content"
            multiline
            minRows={3}
            fullWidth
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSend(false)}>Cancel</Button>
          <Button
            onClick={handleSendMessage}
            disabled={!receiverUsername.trim() || !content.trim() || sending}
            variant="contained"
          >
            {sending ? "Sending..." : "Send"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Conversation Dialog */}
      <Dialog open={openView} onClose={() => setOpenView(false)} fullWidth maxWidth="sm">
        <DialogTitle>View Conversation</DialogTitle>
        <DialogContent>
          <TextField
            label="Username"
            fullWidth
            value={viewUsername}
            onChange={(e) => setViewUsername(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenView(false)}>Cancel</Button>
          <Button
            onClick={handleViewConversation}
            disabled={!viewUsername.trim()}
            variant="contained"
          >
            View
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
