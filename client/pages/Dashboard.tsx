import { Box, Grid, Paper, Typography, Chip } from "@mui/material";
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip } from "recharts";
import { factures, stockProduits } from "@/services/mock";

const revenus = [
  { name: "Héb.", value: 1200000 },
  { name: "Resto", value: 2100000 },
  { name: "Évén.", value: 350000 },
];

export default function Dashboard() {
  const pending = factures.filter((f) => f.statut === "emisee").length;
  const low = stockProduits.filter((p) => p.stock <= p.seuilMin).length;

  return (
    <Box>
      <Typography variant="h4" fontWeight={800} mb={3}>
        Tableau de bord
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography color="text.secondary">
              Occupation chambres (aujourd'hui)
            </Typography>
            <Typography variant="h4" fontWeight={800}>
              72%
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography color="text.secondary">Réservations 7j</Typography>
            <Typography variant="h4" fontWeight={800}>
              24
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography color="text.secondary">Alertes stock bas</Typography>
            <Typography variant="h4" fontWeight={800}>
              {low}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography color="text.secondary">Factures en attente</Typography>
            <Typography variant="h4" fontWeight={800}>
              {pending}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, height: 320 }}>
            <Typography fontWeight={700} mb={2}>
              Revenus par activité (mois)
            </Typography>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={revenus}>
                <XAxis dataKey="name" />
                <Tooltip />
                <Bar dataKey="value" fill="#6E8EF5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: 320 }}>
            <Typography fontWeight={700} mb={2}>
              Alertes
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <AlertItem text="Café sous seuil" />
              <AlertItem text="Savon sous seuil" />
              <AlertItem text="CH-3 en maintenance" />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

function AlertItem({ text }: { text: string }) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 1.5,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <Typography>{text}</Typography>
      <Chip label="Voir" variant="outlined" size="small" />
    </Paper>
  );
}
