import * as React from "react";
import {
  Avatar,
  Box,
  Button,
  Container,
  CssBaseline,
  TextField,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  SelectChangeEvent,
} from "@mui/material";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import { useNavigate } from "react-router-dom";
import { register } from "../api/auth";
import { useTheme } from "@mui/material/styles";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";

export default function RegisterPage() {
  const navigate = useNavigate();
  const theme = useTheme();

  const [formData, setFormData] = React.useState({
    username: "",
    password: "",
    email: "",
    first_name: "",
    last_name: "",
    city: "",
    country: "",
    birth_date: "",
    sex: "MALE",
  });

  const [emailError, setEmailError] = React.useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === "email") {
      const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      setEmailError(isValid ? "" : "Invalid email address");
    }
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    const name = e.target.name;
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date: dayjs.Dayjs | null) => {
    setFormData((prev) => ({
      ...prev,
      birth_date: date ? date.toDate().toISOString() : "",
    }));
  };

  const handleRegister = async () => {
    if (emailError) {
      alert("Please fix the errors before submitting.");
      return;
    }
    try {
      await register(formData);
      alert("Registered successfully!");
      navigate("/login");
    } catch (error) {
      alert("Error registering");
    }
  };

  return (
    <>
      <CssBaseline />
      <Box
        sx={{
          minHeight: "100vh",
          pt: 10,
          background:
            theme.palette.mode === "dark"
              ? "radial-gradient(ellipse at center, #1e293b 0%, #0f172a 100%)"
              : "radial-gradient(ellipse at center, #e2e8f0 0%, #f5f5f5 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Container component="main" maxWidth="sm">
          <Box
            sx={{
              backgroundColor: "background.paper",
              padding: 4,
              borderRadius: 2,
              boxShadow: 3,
            }}
          >
            <Box display="flex" flexDirection="column" alignItems="center">
              <Avatar sx={{ m: 1, bgcolor: "primary.main" }}>
                <PersonAddAlt1Icon />
              </Avatar>
              <Typography component="h1" variant="h5" sx={{ mb: 2 }}>
                Register
              </Typography>
            </Box>

            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 2,
                justifyContent: "space-between",
              }}
            >
              <TextField
                name="username"
                label="Username"
                fullWidth
                sx={{ flexBasis: "48%" }}
                variant="standard"
                value={formData.username}
                onChange={handleInputChange}
              />
              <TextField
                name="password"
                label="Password"
                type="password"
                fullWidth
                sx={{ flexBasis: "48%" }}
                variant="standard"
                value={formData.password}
                onChange={handleInputChange}
              />
              <TextField
                name="email"
                label="Email"
                type="email"
                fullWidth
                sx={{ flexBasis: "48%" }}
                variant="standard"
                value={formData.email}
                onChange={handleInputChange}
                error={!!emailError}
                helperText={emailError}
              />
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Birth Date"
                  value={formData.birth_date ? dayjs(formData.birth_date) : null}
                  onChange={handleDateChange}
                  sx={{ flexBasis: "48%" }}
                  slotProps={{ textField: { variant: "standard", fullWidth: true } }}
                />
              </LocalizationProvider>
              <TextField
                name="first_name"
                label="First Name"
                fullWidth
                sx={{ flexBasis: "48%" }}
                variant="standard"
                value={formData.first_name}
                onChange={handleInputChange}
              />
              <TextField
                name="last_name"
                label="Last Name"
                fullWidth
                sx={{ flexBasis: "48%" }}
                variant="standard"
                value={formData.last_name}
                onChange={handleInputChange}
              />
              <TextField
                name="city"
                label="City"
                fullWidth
                sx={{ flexBasis: "48%" }}
                variant="standard"
                value={formData.city}
                onChange={handleInputChange}
              />
              <TextField
                name="country"
                label="Country"
                fullWidth
                sx={{ flexBasis: "48%" }}
                variant="standard"
                value={formData.country}
                onChange={handleInputChange}
              />
              <FormControl fullWidth sx={{ flexBasis: "48%" }} variant="standard">
                <InputLabel id="sex-label">Sex</InputLabel>
                <Select
                  labelId="sex-label"
                  name="sex"
                  value={formData.sex}
                  onChange={handleSelectChange}
                  label="Sex"
                >
                  <MenuItem value="MALE">Male</MenuItem>
                  <MenuItem value="FEMALE">Female</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Button
              fullWidth
              variant="contained"
              sx={{ mt: 4, mb: 2, borderRadius: 2, fontWeight: 600 }}
              onClick={handleRegister}
            >
              Register
            </Button>

            <Button
              fullWidth
              variant="outlined"
              color="secondary"
              onClick={() => navigate("/")}
            >
              Back to Home
            </Button>
          </Box>
        </Container>
      </Box>
    </>
  );
}
