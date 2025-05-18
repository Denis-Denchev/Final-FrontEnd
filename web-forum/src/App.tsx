import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { CssBaseline } from "@mui/material";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import LandingPage from "./pages/LandingPage";
import CategoriesPage from "./pages/CategoriesPage";
import TopicsPage from "./pages/TopicsPage";
import TopicDetailPage from "./pages/TopicDetailPage";
import ConversationPage from "./components/ConversationPage";
import NavBar from "./components/NavBar";

import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import CommunityGuidelines from "./pages/CommunityGuidelines";

import { ThemeContextProvider } from "./context/ThemeContext";

export default function App() {
  return (
    <ThemeContextProvider>
      <CssBaseline />
      <Router>
        <NavBar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/topics" element={<TopicsPage />} />
          <Route path="/topic-detail" element={<TopicDetailPage />} />
          <Route path="/messages/with/:username" element={<ConversationPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/community-guidelines" element={<CommunityGuidelines />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </ThemeContextProvider>
  );
}
