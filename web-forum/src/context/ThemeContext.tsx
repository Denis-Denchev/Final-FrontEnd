import React, { createContext, useMemo, useState, useContext } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";

const getTheme = (mode: "light" | "dark") =>
  createTheme({
    palette: {
      mode,
      background: {
        default: mode === "dark" ? "#0c0f15" : "#f5f5f5",
        paper: mode === "dark" ? "#111827" : "#ffffff",
      },
      primary: { main: "#2563eb" },
      secondary: { main: "#64748b" },
      text: {
        primary: mode === "dark" ? "#ffffff" : "#000000",
        secondary: mode === "dark" ? "#cbd5e1" : "#4b5563",
      },
    },
  });

const ThemeModeContext = createContext<{
  toggleTheme: () => void;
  logout: () => void;
  mode: "light" | "dark";
}>({
  toggleTheme: () => {},
  logout: () => {},
  mode: "dark",
});

export const useThemeMode = () => useContext(ThemeModeContext);

export const ThemeContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [mode, setMode] = useState<"light" | "dark">("dark");

  const toggleTheme = () => setMode((prev) => (prev === "dark" ? "light" : "dark"));
  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  const theme = useMemo(() => getTheme(mode), [mode]);

  return (
    <ThemeModeContext.Provider value={{ toggleTheme, logout, mode }}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ThemeModeContext.Provider>
  );
};