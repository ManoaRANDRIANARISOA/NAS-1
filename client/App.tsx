import "./global.css";

import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import NotFound from "./pages/NotFound";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { theme } from "@/theme/mui";
import { Provider } from "react-redux";
import { store } from "@/store";
import { AppLayout } from "@/layout/AppLayout";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import RestoPlan from "@/pages/restaurant/Plan";
import RestoMenu from "@/pages/restaurant/Menu";
import RestoEvenements from "@/pages/restaurant/Evenements";
import Placeholder from "@/components/Placeholder";
import GestionChambres from "@/pages/hebergement/GestionChambres";
import HebergementClients from "@/pages/hebergement/Clients";
import HebergementStock from "@/pages/hebergement/Stock";
import HebergementTarifs from "@/pages/hebergement/Tarifs";
import Financier from "@/pages/Financier";
import AdminPage from "@/pages/Admin";
import RestoStock from "@/pages/restaurant/Stock";

const queryClient = new QueryClient();

function AuthenticatedApp() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />

              <Route
                path="/hebergement/gestion"
                element={<GestionChambres />}
              />
              <Route
                path="/hebergement/clients"
                element={<HebergementClients />}
              />
              <Route path="/hebergement/stock" element={<HebergementStock />} />
              <Route
                path="/hebergement/tarifs"
                element={<HebergementTarifs />}
              />

              <Route path="/resto/plan" element={<RestoPlan />} />
              <Route path="/resto/menu" element={<RestoMenu />} />
              <Route path="/resto/stock" element={<RestoStock />} />
              <Route path="/resto/evenements" element={<RestoEvenements />} />

              <Route path="/financier" element={<Financier />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route
                path="/parametres"
                element={<Placeholder title="Paramètres" />}
              />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}

const App = () => (
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <AuthenticatedApp />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </Provider>
);

createRoot(document.getElementById("root")!).render(<App />);
