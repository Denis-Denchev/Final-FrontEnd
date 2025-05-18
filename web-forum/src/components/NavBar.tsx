import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Box,
} from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import CategoryIcon from "@mui/icons-material/Category";
import ForumIcon from "@mui/icons-material/Forum";
import MessageIcon from "@mui/icons-material/Message";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";

import CreateMessageModal from "./CreateMessageModal";

export default function NavBar() {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"send" | "view">("send");

  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const openSendMessage = () => {
    setModalMode("send");
    setModalOpen(true);
    handleCloseMenu();
  };

  const openViewConversation = () => {
    setModalMode("view");
    setModalOpen(true);
    handleCloseMenu();
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Box display="flex" alignItems="center" gap={1}>
            <IconButton
              component={RouterLink}
              to="/"
              color="inherit"
              size="large"
            >
              <HomeIcon />
            </IconButton>

            <Button
              component={RouterLink}
              to="/categories"
              color="inherit"
              startIcon={<CategoryIcon />}
            >
              Categories
            </Button>

            <Button
              component={RouterLink}
              to="/topics"
              color="inherit"
              startIcon={<ForumIcon />}
            >
              Topics
            </Button>

            <Tooltip title="Messages">
              <IconButton color="inherit" onClick={handleOpenMenu}>
                <MessageIcon />
              </IconButton>
            </Tooltip>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleCloseMenu}
            >
              <MenuItem onClick={openSendMessage}>Send Message</MenuItem>
              <MenuItem onClick={openViewConversation}>
                View Conversation
              </MenuItem>
            </Menu>
          </Box>

          <Box>
            {!token ? (
              <Button
                component={RouterLink}
                to="/login"
                color="inherit"
                startIcon={<LoginIcon />}
              >
                Login
              </Button>
            ) : (
              <Button
                color="inherit"
                startIcon={<LogoutIcon />}
                onClick={handleLogout}
              >
                Logout
              </Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      <CreateMessageModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={modalMode}
      />
    </>
  );
}
