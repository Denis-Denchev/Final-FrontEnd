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

import { ThemeProvider } from "./context/ThemeContext";
import Footer from "./footer/Footer";

export default function App() {
  return (
    <ThemeProvider>
      <CssBaseline />
      <Router>
        <div className="flex flex-col min-h-screen">
          <NavBar />
          <div className="flex-grow">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/categories" element={<CategoriesPage />} />
              <Route path="/topics" element={<TopicsPage />} />
              <Route path="/topic-detail" element={<TopicDetailPage />} />
              <Route path="/messages/with/:username" element={<ConversationPage />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
          <Footer />
        </div>
      </Router>
    </ThemeProvider>
  );
}
