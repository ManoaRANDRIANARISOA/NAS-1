import { Box, Chip, Paper, Stack, TextField, Typography } from "@mui/material";
import { stockProduits } from "@/services/mock";
import { useMemo, useState } from "react";

export default function RestoStock() {
  const [q, setQ] = useState("");
  const [view, setView] = useState<"all" | "low" | "zero">("all");
  const list = useMemo(
    () =>
      stockProduits.filter(
        (p) =>
          p.famille === "Restaurant" &&
          p.nom.toLowerCase().includes(q.toLowerCase()),
      ),
    [q],
  );
  const filtered = list.filter((p) =>
    view === "all"
      ? true
      : view === "low"
        ? p.stock <= p.seuilMin
        : p.stock === 0,
  );
  const alerts = list.filter((p) => p.stock <= p.seuilMin);
  return (
    <Box>
      <Typography variant="h4" fontWeight={800} mb={2}>
        Restaurant — Stock
      </Typography>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Stack direction="row" spacing={1}>
            <Chip
              size="small"
              label={`Alertes: ${alerts.length}`}
              color={alerts.length ? "warning" : "default"}
            />
            <Chip
              size="small"
              label="Tous"
              color={view === "all" ? "primary" : "default"}
              variant={view === "all" ? "filled" : "outlined"}
              onClick={() => setView("all")}
            />
            <Chip
              size="small"
              label="Bas"
              color={view === "low" ? "primary" : "default"}
              variant={view === "low" ? "filled" : "outlined"}
              onClick={() => setView("low")}
            />
            <Chip
              size="small"
              label="Rupture"
              color={view === "zero" ? "primary" : "default"}
              variant={view === "zero" ? "filled" : "outlined"}
              onClick={() => setView("zero")}
            />
          </Stack>
          <TextField
            size="small"
            placeholder="Rechercher un produit"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </Stack>
      </Paper>
      <Paper sx={{ p: 2 }}>
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
        {filtered.map((p) => (
          <Box
            key={p.id}
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
            <Box>{p.nom}</Box>
            <Box>{p.seuilMin}</Box>
            <Box>{p.stock}</Box>
          </Box>
        ))}
      </Paper>
    </Box>
  );
}
