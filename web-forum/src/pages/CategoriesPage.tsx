import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Container,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface Category {
  id: string;
  name: string;
  description: string;
  is_private: boolean;
  is_locked: boolean;
  created_at: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    is_private: false,
    is_locked: false,
  });

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    axios
      .get("https://db-api.alpha-panda.eu/api/v1/category/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => setCategories(res.data))
      .catch((err) => {
        console.error("Error loading categories:", err);
        navigate("/login");
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  const handleCategoryClick = (categoryName: string) => {
    navigate(`/topics?category_name=${categoryName}`);
  };

  const handleCreate = () => {
    const token = localStorage.getItem("token");
    axios
      .post("https://db-api.alpha-panda.eu/api/v1/category/", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(() => window.location.reload())
      .catch((err) => console.error("Error creating category:", err));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.checked });
  };

  return (
    <Container sx={{ pt: 10 }}>
      <Box mb={2}>
        <Typography variant="h4" align="center" gutterBottom>
          Categories
        </Typography>
        <Box display="flex" justifyContent="center">
          <Button variant="contained" onClick={() => setOpen(true)}>
            Create Category
          </Button>
        </Box>
      </Box>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Create Category</DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            name="name"
            fullWidth
            margin="normal"
            value={formData.name}
            onChange={handleChange}
          />
          <TextField
            label="Description"
            name="description"
            fullWidth
            margin="normal"
            value={formData.description}
            onChange={handleChange}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.is_private}
                onChange={handleCheckboxChange}
                name="is_private"
              />
            }
            label="Private"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.is_locked}
                onChange={handleCheckboxChange}
                name="is_locked"
              />
            }
            label="Locked"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleCreate} variant="contained">
            Submit
          </Button>
        </DialogActions>
      </Dialog>

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
          {categories.map((cat) => (
            <Button
              key={cat.id}
              variant="outlined"
              sx={{
                width: { xs: "100%", sm: "48%", md: "19%" },
                height: 120,
                textAlign: "left",
                padding: 2,
              }}
              onClick={() => handleCategoryClick(cat.name)}
            >
              <Box>
                <Typography variant="subtitle1" fontWeight="bold">
                  {cat.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {cat.description || "No description"}
                </Typography>
              </Box>
            </Button>
          ))}
        </Box>
      )}
    </Container>
  );
}
