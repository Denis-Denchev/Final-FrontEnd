import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Divider,
  useTheme,
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
  const theme = useTheme();

  useEffect(() => {
    const fetchMessages = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const response = await axios.get(
          `https://db-api.alpha-panda.eu/api/v1/messages/with/${username}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
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

    fetchMessages();
  }, [username]);

  if (loading) return <CircularProgress sx={{ m: 4 }} />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box sx={{ maxWidth: "700px", mx: "auto", p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Conversation with <strong>{username}</strong>
      </Typography>
      <Divider sx={{ mb: 2 }} />
      {messages.length === 0 ? (
        <Typography>No messages yet.</Typography>
      ) : (
        messages.map((msg) => (
          <Paper
            key={msg.id}
            sx={{
              p: 2,
              mb: 2,
              backgroundColor:
                msg.sender_username === username
                  ? theme.palette.mode === "dark"
                    ? "#333"
                    : "#f1f1f1"
                  : theme.palette.mode === "dark"
                  ? "#1976d2"
                  : "#d1e7dd",
              color:
                msg.sender_username === username
                  ? theme.palette.text.primary
                  : theme.palette.mode === "dark"
                  ? "#fff"
                  : "#000",
              alignSelf:
                msg.sender_username === username ? "flex-start" : "flex-end",
            }}
          >
            <Typography variant="body2" color="textSecondary">
              {msg.sender_username} → {msg.receiver_username}
            </Typography>
            <Typography>{msg.content}</Typography>
            <Typography variant="caption" sx={{ mt: 1, display: "block" }}>
              {new Date(msg.created_at).toLocaleString()}
            </Typography>
          </Paper>
        ))
      )}
    </Box>
  );
}
