import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

interface Topic {
  id: string;
  title: string;
  category_name: string;
  created_at: string;
  is_locked: boolean;
  author_id: string;
}

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function TopicsPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [newTopicTitle, setNewTopicTitle] = useState("");
  const query = useQuery();
  const categoryName = query.get("category_name");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!categoryName || !token) return;

    const requestConfig = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        category_name: categoryName,
        page: 1,
        per_page: 100,
        sort_by: "id",
        sort_order: "asc",
      },
    };

    axios
      .get("https://db-api.alpha-panda.eu/api/v1/topic/view", requestConfig)
      .then((res) => {
        const topics = res.data.topics || [];
        setTopics(topics);
      })
      .catch((err) => console.error("❌ Error loading topics:", err))
      .finally(() => setLoading(false));
  }, [categoryName]);

  const handleTopicClick = (title: string) => {
    navigate(`/topic-detail?title=${encodeURIComponent(title)}`);
  };

  const handleCreateTopic = async () => {
    const token = localStorage.getItem("token");
    if (!token || !newTopicTitle || !categoryName) return;

    try {
      await axios.post(
        "https://db-api.alpha-panda.eu/api/v1/topic/create",
        {
          title: newTopicTitle,
          parent_category_name: categoryName,
          is_locked: false,
          is_private: false,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setNewTopicTitle("");
      setOpenDialog(false);
      window.location.reload();
    } catch (error) {
      console.error("❌ Error creating topic:", error);
    }
  };

  return (
    <Container sx={{ pt: 10 }}>
      <Box display="flex" justifyContent="center" mb={2}>
        <Typography variant="h4" align="center">
          Topics
        </Typography>
      </Box>

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Button variant="outlined" onClick={() => navigate(-1)}>
          ← Back
        </Button>
        <Button variant="contained" onClick={() => setOpenDialog(true)}>
          Create Topic
        </Button>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : (
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            justifyContent: "center",
          }}
        >
          {topics.map((topic) => (
            <Button
              key={topic.id}
              variant="outlined"
              sx={{
                width: { xs: "100%", sm: "48%", md: "19%" },
                height: 120,
                textAlign: "left",
                padding: 2,
              }}
              onClick={() => handleTopicClick(topic.title)}
            >
              <Box>
                <Typography variant="subtitle1" fontWeight="bold">
                  {topic.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Created: {new Date(topic.created_at).toLocaleDateString()}
                </Typography>
              </Box>
            </Button>
          ))}
        </Box>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Create New Topic</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Topic Title"
            fullWidth
            value={newTopicTitle}
            onChange={(e) => setNewTopicTitle(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleCreateTopic} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}