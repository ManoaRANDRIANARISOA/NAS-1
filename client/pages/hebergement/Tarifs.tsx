import { Box, Button, Paper, Stack, TextField, Typography } from "@mui/material";
import { chambres } from "@/services/mock";
import { useState } from "react";

export default function HebergementTarifs() {
  const [rows, setRows] = useState(
    chambres.map((c) => ({
      id: c.id,
      numero: c.numero,
      categorie: c.categorie,
      capacite: c.capacite,
      tarif: c.tarif_base,
    })),
  );
  function update<K extends keyof typeof rows[number]>(id: string, key: K, value: any) {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, [key]: value } : r)));
  }
  return (
    <Box>
      <Typography variant="h4" fontWeight={800} mb={2}>
        Hébergement — Tarifs
      </Typography>
      <Paper sx={{ p: 2 }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "120px 1fr 120px 160px",
            px: 1,
            py: 1,
            color: "text.secondary",
            fontWeight: 700,
          }}
        >
          <Box>Chambre</Box>
          <Box>Catégorie</Box>
          <Box>Capacité</Box>
          <Box>Tarif base (Ar)</Box>
        </Box>
        {rows.map((r) => (
          <Box
            key={r.id}
            sx={{
              display: "grid",
              gridTemplateColumns: "120px 1fr 120px 160px",
              px: 1,
              py: 1,
              borderTop: "1px solid",
              borderColor: "divider",
              alignItems: "center",
            }}
          >
            <Box>{r.numero}</Box>
            <TextField
              size="small"
              value={r.categorie}
              onChange={(e) => update(r.id, "categorie", e.target.value)}
            />
            <TextField
              size="small"
              type="number"
              value={r.capacite}
              onChange={(e) =>
                update(r.id, "capacite", parseInt(e.target.value || "0", 10))
              }
            />
            <TextField
              size="small"
              type="number"
              value={r.tarif}
              onChange={(e) =>
                update(r.id, "tarif", parseInt(e.target.value || "0", 10))
              }
            />
          </Box>
        ))}
        <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2 }}>
          <Button variant="contained">Valider</Button>
        </Stack>
      </Paper>
    </Box>
  );
}
