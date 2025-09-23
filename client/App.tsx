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
import Dashboard from "@/pages/Dashboard";
import RestoPlan from "@/pages/restaurant/Plan";
import RestoMenu from "@/pages/restaurant/Menu";
import RestoEvenements from "@/pages/restaurant/Evenements";
import Placeholder from "@/components/Placeholder";

const queryClient = new QueryClient();

const App = () => (
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <AppLayout>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />

              <Route
                path="/hebergement/planning"
                element={<Placeholder title="Hébergement · Planning" />}
              />
              <Route
                path="/hebergement/reservations"
                element={<Placeholder title="Hébergement · Réservations" />}
              />
              <Route
                path="/hebergement/clients"
                element={<Placeholder title="Hébergement · Clients" />}
              />
              <Route
                path="/hebergement/linge"
                element={<Placeholder title="Hébergement · Linge" />}
              />
              <Route
                path="/hebergement/tarifs"
                element={<Placeholder title="Hébergement · Tarifs" />}
              />

              <Route path="/resto/plan" element={<RestoPlan />} />
              <Route path="/resto/menu" element={<RestoMenu />} />
              <Route path="/resto/evenements" element={<RestoEvenements />} />

              <Route
                path="/stock/produits"
                element={<Placeholder title="Économat · Produits" />}
              />
              <Route
                path="/stock/mouvements"
                element={<Placeholder title="Économat · Mouvements" />}
              />
              <Route
                path="/stock/alertes"
                element={<Placeholder title="Économat · Alertes" />}
              />

              <Route
                path="/facturation/factures"
                element={<Placeholder title="Facturation · Factures" />}
              />
              <Route
                path="/rapports"
                element={<Placeholder title="Rapports" />}
              />
              <Route
                path="/admin/utilisateurs"
                element={<Placeholder title="Utilisateurs & Rôles" />}
              />
              <Route
                path="/parametres"
                element={<Placeholder title="Paramètres" />}
              />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppLayout>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  </Provider>
);

createRoot(document.getElementById("root")!).render(<App />);
