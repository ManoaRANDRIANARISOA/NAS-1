import { Box, Grid, Paper, Stack, Typography, Chip } from "@mui/material";
import { stockProduits } from "@/services/mock";

function Section({
  title,
  filter,
}: {
  title: string;
  filter: (id: string) => boolean;
}) {
  const items = stockProduits.filter(
    (p) => p.famille === "Hebergement" && filter(p.sousCategorie),
  );
  const low = items.filter((p) => p.stock <= p.seuilMin);
  return (
    <Paper sx={{ p: 2 }}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 1 }}
      >
        <Typography fontWeight={800}>{title}</Typography>
        <Chip
          size="small"
          label={`Alertes: ${low.length}`}
          color={low.length ? "warning" : "default"}
        />
      </Stack>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr 120px 120px",
          px: 1,
          py: 1,
          color: "text.secondary",
          fontWeight: 700,
        }}
      >
        <Box>Produit</Box>
        <Box>Seuil</Box>
        <Box>Stock</Box>
      </Box>
      {items.map((it) => (
        <Box
          key={it.id}
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 120px 120px",
            px: 1,
            py: 1,
            borderTop: "1px solid",
            borderColor: "divider",
            alignItems: "center",
          }}
        >
          <Box>{it.nom}</Box>
          <Box>{it.seuilMin}</Box>
          <Box>{it.stock}</Box>
        </Box>
      ))}
    </Paper>
  );
}

export default function HebergementStock() {
  return (
    <Box>
      <Typography variant="h4" fontWeight={800} mb={2}>
        Hébergement — Stock
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Section title="Linge" filter={(c) => c.startsWith("linge")} />
        </Grid>
        <Grid item xs={12} md={6}>
          <Section
            title="Petit déjeuner"
            filter={(c) => c === "petit_dejeuner"}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
