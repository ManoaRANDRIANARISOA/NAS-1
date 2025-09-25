import {
  Box,
  Grid,
  Paper,
  Typography,
  Chip,
  Stack,
  Button,
  Divider,
  List,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip } from "recharts";
import {
  factures,
  stockProduits,
  reservations,
  chambres,
  evenements,
} from "@/services/mock";
import {
  addDays,
  format,
  startOfWeek,
  endOfWeek,
  isSameDay,
  differenceInCalendarDays,
} from "date-fns";
import { Link } from "react-router-dom";

const revenus = [
  { name: "Héb.", value: 1200000 },
  { name: "Resto", value: 2100000 },
  { name: "Évén.", value: 350000 },
];

export default function Dashboard() {
  const pendingList = factures.filter((f) => f.statut === "emisee");
  const lowList = stockProduits.filter((p) => p.stock <= p.seuilMin);

  // Alerts data (stock + housekeeping)
  const chambreAlerts = chambres
    .filter((c) => c.statut === "maintenance")
    .map((c) => ({
      type: "chambre" as const,
      text: `${c.numero} en maintenance`,
      badge: "En nettoyage",
    }));
  const stockAlerts = lowList.map((p) => ({
    type: "stock" as const,
    text: `${p.nom} sous seuil`,
    badge: "Rupture",
  }));
  const alertsAll = [...stockAlerts, ...chambreAlerts];

  const [alertFilter, setAlertFilter] = useState<
    "all" | "stock" | "chambre"
  >("all");
  const alerts = alertsAll.filter((a) =>
    alertFilter === "all"
      ? true
      : alertFilter === "stock"
        ? a.type === "stock"
        : a.type === "chambre",
  );

  // Week calendar (events)
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));
  const weekEvents = (evenements || []).filter((e) => {
    const d = new Date(e.date + "T00:00:00");
    return d >= weekStart && d <= weekEnd;
  });
  const weekNumber = Number(format(new Date(), "I"));
  const monthLabel = format(new Date(), "LLLL yyyy");

  return (
    <Box>
      <Typography variant="h4" fontWeight={800} mb={3}>
        Tableau de bord
      </Typography>

      {/* KPIs */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography color="text.secondary">Taux d'occupation</Typography>
            <Typography variant="h4" fontWeight={800}>
              72%
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography color="text.secondary">
              Arrivées à venir (7j)
            </Typography>
            <Typography variant="h4" fontWeight={800}>
              18
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography color="text.secondary">Alertes stock</Typography>
            <Typography variant="h4" fontWeight={800}>
              {lowList.length}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography color="text.secondary">Factures en attente</Typography>
            <Typography variant="h4" fontWeight={800}>
              {pendingList.length}
            </Typography>
          </Paper>
        </Grid>

        {/* Alertes + Calendrier semaine */}
        <Grid item xs={12} md={5}>
          <Paper
            sx={{ p: 2, height: 360, display: "flex", flexDirection: "column" }}
          >
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ mb: 1 }}
            >
              <Typography fontWeight={700}>Alertes</Typography>
              <Stack direction="row" spacing={1}>
                <Chip
                  size="small"
                  label="Tous"
                  color={alertFilter === "all" ? "primary" : "default"}
                  variant={alertFilter === "all" ? "filled" : "outlined"}
                  onClick={() => setAlertFilter("all")}
                />
                <Chip
                  size="small"
                  label="Stock"
                  color={alertFilter === "stock" ? "primary" : "default"}
                  variant={alertFilter === "stock" ? "filled" : "outlined"}
                  onClick={() => setAlertFilter("stock")}
                />
                <Chip
                  size="small"
                  label="Chambres"
                  color={alertFilter === "chambre" ? "primary" : "default"}
                  variant={alertFilter === "chambre" ? "filled" : "outlined"}
                  onClick={() => setAlertFilter("chambre")}
                />
              </Stack>
            </Stack>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 1,
                overflow: "auto",
              }}
            >
              {alerts.map((a, i) => (
                <Paper
                  key={i}
                  variant="outlined"
                  sx={{
                    p: 1.2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography>{a.text}</Typography>
                  <Chip
                    size="small"
                    label={a.badge}
                    color={a.badge === "Rupture" ? "error" : "warning"}
                    variant={a.badge === "Rupture" ? "filled" : "outlined"}
                  />
                </Paper>
              ))}
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={7}>
          <Paper
            sx={{ p: 2, height: 360, display: "flex", flexDirection: "column" }}
          >
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ mb: 1 }}
            >
              <Typography fontWeight={700}>Calendrier (semaine)</Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip
                  size="small"
                  label={`S-${weekNumber}`}
                  variant="outlined"
                />
                <Chip size="small" label={monthLabel} />
              </Stack>
            </Stack>
            <Divider sx={{ mb: 1 }} />
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(7, 1fr)",
                gap: 1,
                flex: 1,
              }}
            >
              {days.map((d) => (
                <Box
                  key={d.toISOString()}
                  sx={{
                    p: 1,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 1,
                    minHeight: 90,
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    {format(d, "EEE d")}
                  </Typography>
                  <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                    {weekEvents
                      .filter((e) =>
                        isSameDay(new Date(e.date + "T00:00:00"), d),
                      )
                      .map((e) => (
                        <Chip
                          key={e.id}
                          size="small"
                          label={e.nom}
                          color="primary"
                          component={Link as any}
                          to="/resto/evenements"
                          clickable
                        />
                      ))}
                  </Stack>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Revenus + Factures en attente */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, height: 340 }}>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ mb: 1 }}
            >
              <Typography fontWeight={700}>Revenus par activité</Typography>
              <Stack direction="row" spacing={1}>
                <Chip size="small" label="Ce mois" color="primary" />
                <Button size="small" variant="outlined">
                  PDF
                </Button>
                <Button size="small" variant="outlined">
                  Excel
                </Button>
              </Stack>
            </Stack>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={revenus}>
                <XAxis dataKey="name" />
                <Tooltip />
                <Bar dataKey="value" fill="#6E8EF5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
              <LegendDot color="#6E8EF5" label="CA TTC" />
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper
            sx={{ p: 2, height: 340, display: "flex", flexDirection: "column" }}
          >
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ mb: 1 }}
            >
              <Typography fontWeight={700}>Factures en attente</Typography>
              <Chip size="small" label={pendingList.length} />
            </Stack>
            <List dense sx={{ flex: 1, overflow: "auto" }}>
              {pendingList.map((f) => (
                <ListItemButton
                  key={f.id}
                  sx={{ borderTop: "1px solid", borderColor: "divider" }}
                >
                  <ListItemText
                    primary={f.clientNom}
                    secondary={`${format(new Date(f.date), "dd/MM/yyyy")} · ${new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(f.totalTTC / 100)}`}
                  />
                  <Button size="small" variant="outlined">
                    Ouvrir
                  </Button>
                </ListItemButton>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Mini calendrier chambres */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ mb: 1 }}
            >
              <Typography fontWeight={700}>Occupation chambres</Typography>
              <Stack direction="row" spacing={1}>
                <Chip size="small" label="Mensuel" variant="outlined" />
                <Chip size="small" label="Hebdo" color="primary" />
                <Chip size="small" label="Jour" variant="outlined" />
                <Chip size="small" label="Aujourd'hui" variant="outlined" />
              </Stack>
            </Stack>
            <MiniRoomsCalendar />
            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              <LegendDot color="#81C784" label="Libre" />
              <LegendDot color="#E57373" label="Occupée" />
              <LegendDot color="#FFD54F" label="En nettoyage" />
              <LegendDot color="#BDBDBD" label="Hors service" />
            </Stack>
          </Paper>
        </Grid>

        {/* Recaps */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box>
              <Typography fontWeight={700}>Plan de salle</Typography>
              <Typography variant="body2" color="text.secondary">
                Vue rapide des tables et réservations en cours
              </Typography>
            </Box>
            <Button
              variant="contained"
              component={Link as any}
              to="/resto/plan"
            >
              Ouvrir
            </Button>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box>
              <Typography fontWeight={700}>R��servations hébergement</Typography>
              <Typography variant="body2" color="text.secondary">
                Calendrier et détails
              </Typography>
            </Box>
            <Button
              variant="outlined"
              component={Link as any}
              to="/hebergement/planning"
            >
              Voir
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Box
        sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: color }}
      />
      <Typography variant="caption">{label}</Typography>
    </Stack>
  );
}

function MiniRoomsCalendar() {
  const start = startOfWeek(new Date(), { weekStartsOn: 1 });
  const columns = Array.from({ length: 7 }).map((_, i) => addDays(start, i));

  function cellColor(chambreId: string, d: Date) {
    const r = reservations.find(
      (r) => r.type === "hebergement" && r.chambreId === chambreId,
    );
    if (!r) return "#81C784"; // Libre
    const debut = new Date(r.dateDebut || "");
    const fin = new Date(r.dateFin || r.dateDebut || "");
    const inside = d >= debut && d < fin;
    return inside ? "#E57373" : "#81C784";
  }

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: `160px repeat(${columns.length}, 1fr)`,
        gap: 1,
      }}
    >
      <Box />
      {columns.map((d) => (
        <Box
          key={d.toISOString()}
          sx={{ textAlign: "center", color: "text.secondary" }}
        >
          {format(d, "EEE d")}
        </Box>
      ))}
      {chambres.map((c) => (
        <Fragment key={c.id}>
          <Box sx={{ py: 1, fontWeight: 700 }}>{c.numero}</Box>
          {columns.map((d, idx) => (
            <Box
              key={`${c.id}-${idx}`}
              sx={{ height: 28, bgcolor: cellColor(c.id, d), borderRadius: 1 }}
            />
          ))}
        </Fragment>
      ))}
    </Box>
  );
}

import { Fragment, useState } from "react";
