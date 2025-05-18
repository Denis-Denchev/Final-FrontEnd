import { Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AppBar,
  Box,
  Button,
  CssBaseline,
  Toolbar,
  Typography,
  useTheme,
  Link,
  useMediaQuery,
} from "@mui/material";

const features = [
  {
    icon: '💬',
    title: 'Engaging Discussions',
    desc: 'Join conversations with like-minded people',
  },
  {
    icon: '🔒',
    title: 'Safe Space',
    desc: 'Moderated environment for healthy debates',
  },
  {
    icon: '🎯',
    title: 'Specialized Topics',
    desc: 'Find communities for your specific interests',
  },
];

export default function LandingPage() {
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));

  const bgGradient = theme.palette.mode === "dark"
    ? "radial-gradient(ellipse at center, #1e293b 0%, #0f172a 100%)"
    : "radial-gradient(ellipse at center, #e2e8f0 0%, #f5f5f5 100%)";

  return (
    <>
      <CssBaseline />

      <Box
        sx={{
          minHeight: '100vh',
          background: bgGradient,
          px: 2,
          py: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          color: theme.palette.text.primary,
          gap: 6,
        }}
      >
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ maxWidth: isSmall ? '100%' : 600 }}
        >
          <Typography variant="h2" component="h1" gutterBottom sx={{
            fontWeight: 'bold',
            background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Welcome to Alpha Panda Forum 🐼
          </Typography>

          <Typography variant="h5" color="text.secondary" paragraph>
            Connect, discuss, and grow with people who share your passion.
          </Typography>
        </motion.div>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}
        >
          <Button
            component={RouterLink}
            to="/register"
            variant="contained"
            size="large"
            sx={{
              px: 6,
              fontWeight: 'bold',
              background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              ':hover': {
                background: `linear-gradient(90deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
              },
            }}
          >
            Join Now
          </Button>

          <Button
            component={RouterLink}
            to="/categories"
            variant="outlined"
            size="large"
            sx={{
              px: 6,
              color: theme.palette.mode === 'dark' ? theme.palette.primary.light : theme.palette.primary.main,
              borderColor: theme.palette.primary.main,
              ':hover': {
                borderColor: theme.palette.primary.dark,
                backgroundColor: theme.palette.action.hover,
              },
            }}
          >
            Browse Topics
          </Button>
        </motion.div>

        {/* Features Section */}
        <Box sx={{ maxWidth: 900, width: '100%', mt: 10 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom color="text.primary" textAlign="center">
            Why Join Our Community?
          </Typography>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: isSmall ? '1fr' : 'repeat(3, 1fr)',
              gap: 4,
              mt: 4,
            }}
          >
            {features.map((feature, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 200 }}
                style={{
                  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255 255 255 / 0.05)' : 'rgba(255 255 255 / 0.7)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 24,
                  padding: 24,
                  boxShadow: theme.shadows[4],
                  border: `1px solid ${theme.palette.divider}`,
                  color: theme.palette.text.primary,
                }}
              >
                <Typography fontSize={48} mb={2} textAlign="center">
                  {feature.icon}
                </Typography>
                <Typography variant="h6" fontWeight="bold" mb={1} textAlign="center">
                  {feature.title}
                </Typography>
                <Typography variant="body1" color="text.secondary" textAlign="center">
                  {feature.desc}
                </Typography>
              </motion.div>
            ))}
          </Box>
        </Box>
      </Box>
    </>
  );
}
