import { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Paper,
  Divider,
  Button,
  TextField,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

interface Topic {
  id: string;
  title: string;
  category_name: string;
  created_at: string;
  is_locked: boolean;
  author_id: string;
}

interface Reply {
  id: string;
  text: string;
  created_at: string;
  upvotes: number;
  downvotes: number;
  is_best: boolean;
  author_id: string;
}

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function TopicDetailPage() {
  const [topic, setTopic] = useState<Topic | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(true);
  const [newReply, setNewReply] = useState("");
  const [posting, setPosting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const query = useQuery();
  const title = query.get("title");
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const fetchTopicDetails = async () => {
    if (!title || !token) return;

    try {
      const res = await axios.get(`https://db-api.alpha-panda.eu/api/v1/topic/${encodeURIComponent(title)}`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { page: 1, per_page: 10, sort_by: "created_at", sort_order: "asc" },
      });

      setTopic(res.data.topic);
      const allReplies: Reply[] = res.data.replies;
      const best = allReplies.find((r) => r.is_best);
      const others = allReplies.filter((r) => !r.is_best);
      setReplies(best ? [best, ...others] : others);
    } catch (err) {
      console.error("❌ Error fetching topic:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopicDetails();
  }, [title]);

  const handlePostReply = async () => {
    if (!newReply.trim() || !title || !token) return;

    try {
      setPosting(true);
      await axios.post(
        "https://db-api.alpha-panda.eu/api/v1/reply/",
        {
          text: newReply.trim(),
          topic_title: title,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setNewReply("");
      await fetchTopicDetails();
    } catch (error) {
      console.error("❌ Failed to post reply:", error);
    } finally {
      setPosting(false);
    }
  };

  const handleDeleteReply = async (replyId: string) => {
    if (!token) return;
    try {
      setDeletingId(replyId);
      await axios.delete(`https://db-api.alpha-panda.eu/api/v1/reply/${replyId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      await fetchTopicDetails();
    } catch (error) {
      console.error("❌ Failed to delete reply:", error);
    } finally {
      setDeletingId(null);
    }
  };

  const handleVote = async (replyId: string, voteType: "UPVOTE" | "DOWNVOTE") => {
    if (!token) return;

    try {
      await axios.put(
        `https://db-api.alpha-panda.eu/api/v1/reply/vote/${voteType}`,
        null,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { reply_id: replyId },
        }
      );
      await fetchTopicDetails();
    } catch (error) {
      console.error("❌ Error voting:", error);
    }
  };

  return (
    <Container sx={{ pt: 10 }}>
      <Button variant="outlined" onClick={() => navigate(-1)} sx={{ mb: 3 }}>
        ← Back
      </Button>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {topic && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h4" gutterBottom>
                {topic.title}
              </Typography>
              <Typography color="text.secondary">
                Category: {topic.category_name}
              </Typography>
              <Typography color="text.secondary">
                Created: {new Date(topic.created_at).toLocaleDateString()}
              </Typography>
            </Box>
          )}

          <Divider sx={{ mb: 2 }} />

          <Typography variant="h5" gutterBottom>
            Replies
          </Typography>

          {/* Post Reply Form */}
          <Box sx={{ mb: 4 }}>
            <TextField
              label="Your reply"
              multiline
              fullWidth
              minRows={3}
              value={newReply}
              onChange={(e) => setNewReply(e.target.value)}
              variant="outlined"
              sx={{ mb: 2 }}
            />
            <Button
              variant="contained"
              onClick={handlePostReply}
              disabled={posting || !newReply.trim()}
            >
              {posting ? "Posting..." : "Post Reply"}
            </Button>
          </Box>

          {replies.map((reply) => (
            <Paper key={reply.id} sx={{ p: 2, mb: 2 }}>
              <Typography>{reply.text}</Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}
              >
                {new Date(reply.created_at).toLocaleString()} | 
                👍 {reply.upvotes}{" "}
                <Button size="small" onClick={() => handleVote(reply.id, "UPVOTE")}>
                  Upvote
                </Button>
                👎 {reply.downvotes}{" "}
                <Button size="small" onClick={() => handleVote(reply.id, "DOWNVOTE")}>
                  Downvote
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  onClick={() => handleDeleteReply(reply.id)}
                  disabled={deletingId === reply.id}
                  sx={{ ml: 2 }}
                >
                  {deletingId === reply.id ? "Deleting..." : "Delete"}
                </Button>
              </Typography>
              {reply.is_best && (
                <Typography variant="caption" color="primary" ml={2}>
                  ⭐ Best Answer
                </Typography>
              )}
            </Paper>
          ))}
        </>
      )}
    </Container>
  );
}
