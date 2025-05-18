import { Box, Container, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function CommunityGuidelines() {
  const navigate = useNavigate();

  return (
    <Container sx={{ py: 8 }}>
      <Typography variant="h4" gutterBottom>
        Community Guidelines - Alpha Panda
      </Typography>

      <Typography variant="body1" paragraph>
        Welcome to Alpha Panda! We're committed to maintaining a respectful, inclusive, and helpful community for everyone.
      </Typography>

      <Typography variant="body1" paragraph>
        ✨ Be respectful – Disagreements are fine, but personal attacks, hate speech, and harassment will not be tolerated.
      </Typography>

      <Typography variant="body1" paragraph>
        🚫 No spam or self-promotion – Keep the conversation meaningful and relevant to the community topics.
      </Typography>

      <Typography variant="body1" paragraph>
        💡 Stay on topic – Make sure your contributions match the discussion category and contribute positively.
      </Typography>

      <Typography variant="body1" paragraph>
        🛡️ Report issues – If you see content that violates these guidelines, please report it so our moderators can review.
      </Typography>

      <Box sx={{ mt: 4 }}>
        <Button variant="contained" onClick={() => navigate("/")}>
          Back to Home
        </Button>
      </Box>
    </Container>
  );
}
