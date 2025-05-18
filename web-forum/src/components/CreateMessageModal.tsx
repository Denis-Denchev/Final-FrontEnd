// components/CreateMessageModal.tsx
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from "@mui/material";
import { useState } from "react";
import axios from "axios";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function CreateMessageModal({ open, onClose }: Props) {
  const [content, setContent] = useState("");
  const [receiverUsername, setReceiverUsername] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async () => {
    const token = localStorage.getItem("token");
    if (!token || !content.trim() || !receiverUsername.trim()) return;

    try {
      setLoading(true);
      await axios.post(
        "https://db-api.alpha-panda.eu/api/v1/messages/",
        {
          content: content.trim(),
          receiver_username: receiverUsername.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setContent("");
      setReceiverUsername("");
      onClose(); // close modal
    } catch (err) {
      console.error("❌ Error sending message:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>Send a Message</DialogTitle>
      <DialogContent>
        <TextField
          label="To (username)"
          fullWidth
          variant="outlined"
          margin="normal"
          value={receiverUsername}
          onChange={(e) => setReceiverUsername(e.target.value)}
        />
        <TextField
          label="Message"
          fullWidth
          multiline
          minRows={3}
          variant="outlined"
          margin="normal"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSendMessage}
          disabled={loading || !content || !receiverUsername}
        >
          {loading ? "Sending..." : "Send"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
