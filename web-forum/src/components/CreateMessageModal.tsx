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
import { useNavigate } from "react-router-dom";

interface Props {
  open: boolean;
  onClose: () => void;
  mode: "send" | "view"; // 👈 добавено
}

export default function CreateMessageModal({ open, onClose, mode }: Props) {
  const [content, setContent] = useState("");
  const [receiverUsername, setReceiverUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    const token = localStorage.getItem("token");
    if (!token || !receiverUsername.trim()) return;

    if (mode === "view") {
      onClose();
      navigate(`/messages/with/${receiverUsername.trim()}`);
      return;
    }

    if (!content.trim()) return;

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
      onClose();
    } catch (err) {
      console.error("❌ Error sending message:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>
        {mode === "send" ? "Send a Message" : "View Conversation"}
      </DialogTitle>
      <DialogContent>
        <TextField
          label="Username"
          fullWidth
          variant="outlined"
          margin="normal"
          value={receiverUsername}
          onChange={(e) => setReceiverUsername(e.target.value)}
        />
        {mode === "send" && (
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
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={
            loading || !receiverUsername || (mode === "send" && !content)
          }
        >
          {mode === "send"
            ? loading
              ? "Sending..."
              : "Send"
            : "View Conversation"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
