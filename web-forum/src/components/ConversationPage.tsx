import React, { useEffect, useState, useRef, ChangeEvent } from "react";
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

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

// Activate the plugins
dayjs.extend(utc);
dayjs.extend(timezone);

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
  const [uploading, setUploading] = useState(false);
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
    return dayjs.utc(iso).tz("Europe/Sofia").format("DD MMMM YYYY, HH:mm");
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((word) => word[0].toUpperCase())
      .join("")
      .slice(0, 2);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    const token = localStorage.getItem("token");
    if (!token) return;

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);

    try {
      const response = await axios.post(
        "https://db-api.alpha-panda.eu/api/v1/messages/upload-image",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Получаваме URL на качената снимка
      const imageUrl = response.data.url;
      // Изпращаме съобщение със съдържание URL-то на снимката
      await axios.post(
        "https://db-api.alpha-panda.eu/api/v1/messages/",
        {
          receiver_username: username,
          content: imageUrl,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setNewMessage("");
      fetchMessages();
    } catch (err) {
      console.error("Failed to upload or send image", err);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(() => {
      fetchMessages();
    }, 3000);
    return () => clearInterval(interval);
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
            // Проверка дали съдържанието е URL на изображение (примерна простичка проверка)
            const isImage =
              msg.content.startsWith("http") &&
              (msg.content.endsWith(".jpg") ||
                msg.content.endsWith(".jpeg") ||
                msg.content.endsWith(".png") ||
                msg.content.endsWith(".gif") ||
                msg.content.includes("base64"));

            return (
              <Box
                key={msg.id}
                display="flex"
                justifyContent={isSender ? "flex-end" : "flex-start"}
                alignItems="flex-end"
              >
                <Box
                  display="flex"
                  flexDirection={isSender ? "row-reverse" : "row"}
                  alignItems="flex-end"
                  sx={{ maxWidth: "75%" }}
                >
                  <Avatar
                    sx={{
                      bgcolor: isSender ? "#42a5f5" : "#8bc34a",
                      mx: 1,
                      fontSize: "0.875rem",
                    }}
                  >
                    {initials}
                  </Avatar>
                  <Paper
                    sx={{
                      p: 1.5,
                      borderRadius: "20px",
                      bgcolor: isSender ? "#d0e8ff" : "#d6f5d6",
                      color: "#000",
                      boxShadow: 2,
                      wordBreak: "break-word",
                      maxWidth: "100%",
                    }}
                  >
                    {isImage ? (
                      <img
                        src={msg.content}
                        alt="Sent image"
                        style={{ maxWidth: "100%", borderRadius: "15px" }}
                      />
                    ) : (
                      <Typography
                        variant="body2"
                        sx={{ whiteSpace: "pre-wrap" }}
                      >
                        {msg.content}
                      </Typography>
                    )}
                    <Typography
                      variant="caption"
                      sx={{
                        display: "block",
                        mt: 0.5,
                        textAlign: isSender ? "right" : "left",
                      }}
                    >
                      {formatDateTime(msg.created_at)}
                    </Typography>
                  </Paper>
                </Box>
              </Box>
            );
          })}
          <div ref={messagesEndRef} />
        </Stack>
      </Box>

      {/* Message Input */}
      <Box display="flex" gap={1} alignItems="center">
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
          disabled={uploading}
        />
        <Button
          variant="contained"
          onClick={handleSend}
          disabled={!newMessage.trim() || uploading}
        >
          Send
        </Button>

        {/* Бутон за качване на снимка */}
        <Button variant="outlined" component="label" disabled={uploading}>
          {uploading ? "Uploading..." : "Upload Image"}
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={handleFileChange}
          />
        </Button>
      </Box>
    </Box>
  );
}
