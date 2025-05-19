import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Divider,
  useTheme,
  TextField,
  Button,
  Stack,
  Avatar,
} from "@mui/material";

interface Message {
  id: number;
  sender_username: string;
  receiver_username: string;
  content: string;
  created_at: string;
}

export default function ConversationPage() {
  const { username } = useParams<{ username: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const theme = useTheme();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUser = localStorage.getItem("username");

  const fetchMessages = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await axios.get(
        `https://db-api.alpha-panda.eu/api/v1/messages/with/${username}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessages(response.data);
    } catch (err: any) {
      console.error("Failed to fetch messages", err);
      setError("Could not load conversation.");
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    const token = localStorage.getItem("token");
    if (!token || !newMessage.trim()) return;

    try {
      await axios.post(
        `https://db-api.alpha-panda.eu/api/v1/messages/`,
        {
          receiver_username: username,
          content: newMessage.trim(),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setNewMessage("");
      fetchMessages();
    } catch (err) {
      console.error("Failed to send message", err);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatDateTime = (iso: string) => {
    const date = new Date(iso);
    return date.toLocaleString("bg-BG", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((word) => word[0].toUpperCase())
      .join("")
      .slice(0, 2);

  useEffect(() => {
    fetchMessages();
  }, [username]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (loading) return <CircularProgress sx={{ m: 4 }} />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box
      sx={{
        maxWidth: "700px",
        mx: "auto",
        p: 2,
        display: "flex",
        flexDirection: "column",
        height: "80vh",
      }}
    >
      <Typography variant="h5" gutterBottom>
        Conversation with <strong>{username}</strong>
      </Typography>
      <Divider sx={{ mb: 2 }} />

      {/* Chat Messages */}
      <Box sx={{ flexGrow: 1, overflowY: "auto", mb: 2 }}>
        <Stack spacing={1}>
          {messages.map((msg) => {
            const isSender = msg.sender_username === currentUser;
            const initials = getInitials(msg.sender_username);

            return (
              <Box
                key={msg.id}
                display="flex"
                justifyContent={isSender ? "flex-end" : "flex-start"}
                sx={{ mb: 1 }}
              >
                <Box
                  display="flex"
                  flexDirection={isSender ? "row-reverse" : "row"}
                  alignItems="flex-end"
                  sx={{
                    maxWidth: "70%",
                    bgcolor: isSender ? "#d0e8ff" : "#d6f5d6",
                    borderRadius: "20px",
                    p: 1.5,
                    boxShadow: 2,
                    color: "#000",
                    wordBreak: "break-word",
                  }}
                >
                  <Avatar
                    sx={{
                      bgcolor: isSender ? "#42a5f5" : "#8bc34a",
                      ml: isSender ? 1 : 0,
                      mr: isSender ? 0 : 1,
                      fontSize: "0.875rem",
                    }}
                  >
                    {initials}
                  </Avatar>

                  <Box>
                    <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                      {msg.content}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ display: "block", mt: 0.5, textAlign: isSender ? "right" : "left" }}
                    >
                      {formatDateTime(msg.created_at)}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            );
          })}
          <div ref={messagesEndRef} />
        </Stack>
      </Box>

      {/* Message Input */}
      <Box display="flex" gap={1}>
        <TextField
          fullWidth
          multiline
          minRows={1}
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          sx={{
            borderRadius: "10px",
            bgcolor: theme.palette.mode === "dark" ? "#1e1e1e" : "#fff",
            input: {
              color: theme.palette.mode === "dark" ? "#fff" : "#000",
            },
          }}
        />
        <Button
          variant="contained"
          onClick={handleSend}
          disabled={!newMessage.trim()}
        >
          Send
        </Button>
      </Box>
    </Box>
  );
}
