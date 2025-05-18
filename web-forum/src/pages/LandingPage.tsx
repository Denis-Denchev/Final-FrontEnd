import { Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Box,
  Button,
  CssBaseline,
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

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          py: 6,
          px: 2,
          backgroundColor: theme.palette.mode === 'dark' ? '#0f172a' : '#f1f5f9',
          color: theme.palette.text.primary,
        }}
      >
        <Box
          sx={{
            maxWidth: 1200,
            mx: 'auto',
            display: 'grid',
            gridTemplateColumns: isSmall ? '1fr' : 'repeat(4, 1fr)',
            gap: 4,
          }}
        >
          {/* About */}
          <Box>
            <Typography variant="h6" fontWeight="bold" gutterBottom>Alpha Panda</Typography>
            <Typography variant="body2">
              A community forum for passionate discussions and knowledge sharing.
            </Typography>
          </Box>

          {/* Quick Links */}
          <Box>
            <Typography variant="h6" fontWeight="bold" gutterBottom>Quick Links</Typography>
            <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
              {['Home', 'Categories', 'About', 'Contact'].map((text, i) => (
                <li key={i}>
                  <Link component={RouterLink} to={text === 'Home' ? '/' : `/${text.toLowerCase()}`}
                    underline="hover" color="inherit">
                    {text}
                  </Link>
                </li>
              ))}
            </Box>
          </Box>

          {/* Legal */}
          <Box>
            <Typography variant="h6" fontWeight="bold" gutterBottom>Legal</Typography>
            <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
              {['Privacy Policy', 'Terms of Service', 'Community Guidelines'].map((text, i) => (
                <li key={i}>
                  <Link component={RouterLink} to={`/${text.toLowerCase().replace(/\s/g, '-')}`}
                    underline="hover" color="inherit">
                    {text}
                  </Link>
                </li>
              ))}
            </Box>
          </Box>

          {/* Social */}
          <Box>
            <Typography variant="h6" fontWeight="bold" gutterBottom>Connect With Us</Typography>
            <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
              <Link href="https://www.facebook.com/profile.php?id=61576293721896" target="_blank" rel="noopener noreferrer">
                <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/facebook/facebook-original.svg" width="24" />
              </Link>
              <Link href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/twitter/twitter-original.svg" width="24" />
              </Link>
              <Link href="https://discord.com" target="_blank" rel="noopener noreferrer">
                <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/discordjs/discordjs-original.svg" width="24" />
              </Link>
            </Box>
          </Box>
        </Box>

        <Typography
          variant="caption"
          sx={{ mt: 4, display: 'block', textAlign: 'center', opacity: 0.6 }}
        >
          © {new Date().getFullYear()} Alpha Panda Forum. All rights reserved.
        </Typography>
      </Box>
    </>
  );
}
