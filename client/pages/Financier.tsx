import { Box, Grid, Paper, Stack, Typography, Button } from "@mui/material";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  LineChart,
  Line,
} from "recharts";

const occData = [
  { name: "101", value: 80 },
  { name: "102", value: 65 },
  { name: "201", value: 92 },
];
const restoResa = [
  { name: "L", v: 12 },
  { name: "M", v: 16 },
  { name: "M ", v: 10 },
  { name: "J", v: 8 },
  { name: "V", v: 20 },
  { name: "S", v: 25 },
  { name: "D", v: 14 },
];
const ca = [
  { name: "Héb.", v: 12 },
  { name: "Resto", v: 21 },
  { name: "Évén.", v: 3.5 },
];

export default function Financier() {
  return (
    <Box>
      <Typography variant="h4" fontWeight={800} mb={2}>
        Financier
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 1 }}
            >
              <Typography fontWeight={700}>Suivi des paiements</Typography>
              <Button variant="outlined">Exporter</Button>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Restaurant · Événements
            </Typography>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={restoResa}>
                <XAxis dataKey="name" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="v"
                  stroke="#6E8EF5"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 1 }}
            >
              <Typography fontWeight={700}>Factures internes</Typography>
              <Button variant="contained">Créer une facture</Button>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Liste synthétique
            </Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 120px 100px",
                px: 1,
                py: 1,
                color: "text.secondary",
                fontWeight: 700,
              }}
            >
              <Box>Client</Box>
              <Box>Date</Box>
              <Box>Total</Box>
            </Box>
            {[
              { c: "R. Rakoto", d: "12/09/2025", t: "€256" },
              { c: "S. Randria", d: "13/09/2025", t: "€120" },
            ].map((r, i) => (
              <Box
                key={i}
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr 120px 100px",
                  px: 1,
                  py: 1,
                  borderTop: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Box>{r.c}</Box>
                <Box>{r.d}</Box>
                <Box>{r.t}</Box>
              </Box>
            ))}
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography fontWeight={700} mb={1}>
              Taux d’occupation par chambre
            </Typography>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={occData}>
                <XAxis dataKey="name" />
                <Tooltip />
                <Bar dataKey="value" fill="#81C784" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography fontWeight={700} mb={1}>
              Revenus par activité
            </Typography>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={ca}>
                <XAxis dataKey="name" />
                <Tooltip />
                <Bar dataKey="v" fill="#6E8EF5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
