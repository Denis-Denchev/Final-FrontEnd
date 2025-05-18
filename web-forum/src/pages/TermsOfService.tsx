import { Box, Container, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function TermsOfService() {
  const navigate = useNavigate();

  return (
    <Container sx={{ py: 8 }}>
      <Typography variant="h4" gutterBottom>
        Terms of Service - Alpha Panda
      </Typography>

      <Typography variant="body1" paragraph>
        By accessing or using Alpha Panda, you agree to comply with these Terms of Service. If you disagree with any part, please do not use our platform.
      </Typography>

      <Typography variant="body1" paragraph>
        Users are responsible for the content they post. Offensive, abusive, or illegal content will be removed and may result in account suspension.
      </Typography>

      <Typography variant="body1" paragraph>
        Alpha Panda reserves the right to update these terms at any time. Continued use of the platform after changes implies acceptance of the new terms.
      </Typography>

      <Typography variant="body1" paragraph>
        Any violation of these terms may result in immediate termination of your account without prior notice.
      </Typography>

      <Box sx={{ mt: 4 }}>
        <Button variant="contained" onClick={() => navigate("/")}>
          Back to Home
        </Button>
      </Box>
    </Container>
  );
}
