import { Box, Container, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <Container sx={{ py: 8 }}>
      <Typography variant="h4" gutterBottom>
        Privacy Policy - Alpha Panda
      </Typography>

      <Typography variant="body1" paragraph>
        At Alpha Panda, we value your privacy. Your personal information is collected only when necessary to provide our forum services.
      </Typography>

      <Typography variant="body1" paragraph>
        We do not sell, rent, or share your personal data with third parties. All communications and user activity are encrypted and securely stored.
      </Typography>

      <Typography variant="body1" paragraph>
        Cookies are used to improve user experience, such as remembering login sessions and tracking anonymous analytics.
      </Typography>

      <Typography variant="body1" paragraph>
        You have full rights to view, edit, or delete your personal data by contacting our support team at support@alphapanda.com.
      </Typography>

      <Box sx={{ mt: 4 }}>
        <Button variant="contained" onClick={() => navigate("/")}>
          Back to Home
        </Button>
      </Box>
    </Container>
  );
}
