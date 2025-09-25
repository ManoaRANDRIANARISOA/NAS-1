import {
  Box,
  Paper,
  Stack,
  TextField,
  Typography,
  List,
  ListItemButton,
  ListItemText,
  Chip,
} from "@mui/material";
import { clients, reservations } from "@/services/mock";
import { useMemo, useState } from "react";
import { format } from "date-fns";

export default function HebergementClients() {
  const [q, setQ] = useState("");
  const list = useMemo(
    () => clients.filter((c) => c.nom.toLowerCase().includes(q.toLowerCase())),
    [q],
  );
  const [selectedId, setSelectedId] = useState(list[0]?.id || "");
  const selected = list.find((c) => c.id === selectedId) || null;
  const history = useMemo(
    () => reservations.filter((r) => r.clientId === selectedId),
    [selectedId],
  );

  return (
    <Box>
      <Typography variant="h4" fontWeight={800} mb={2}>
        Hébergement — Clients
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "300px 1fr" },
          gap: 2,
        }}
      >
        <Paper sx={{ p: 2 }}>
          <TextField
            size="small"
            placeholder="Rechercher un client"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            fullWidth
          />
          <List dense>
            {list.map((c) => (
              <ListItemButton
                key={c.id}
                selected={c.id === selectedId}
                onClick={() => setSelectedId(c.id)}
              >
                <ListItemText primary={c.nom} secondary={c.telephone} />
              </ListItemButton>
            ))}
          </List>
        </Paper>
        <Paper sx={{ p: 2 }}>
          {!selected && (
            <Typography color="text.secondary">
              Sélectionnez un client
            </Typography>
          )}
          {selected && (
            <Stack spacing={1}>
              <Typography fontWeight={800}>{selected.nom}</Typography>
              <Typography variant="body2" color="text.secondary">
                {selected.telephone} · {selected.email || "—"}
              </Typography>
              <Chip
                size="small"
                label={`Historique: ${history.length} réservations`}
              />
              <Box sx={{ mt: 1 }}>
                <Typography fontWeight={700} mb={1}>
                  Historique
                </Typography>
                {history.map((h) => (
                  <Box
                    key={h.id}
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "1fr 140px 140px",
                      py: 0.5,
                    }}
                  >
                    <Box>{h.type}</Box>
                    <Box>{format(new Date(h.dateDebut), "dd/MM/yyyy")}</Box>
                    <Box>
                      {h.dateFin
                        ? format(new Date(h.dateFin), "dd/MM/yyyy")
                        : "-"}
                    </Box>
                  </Box>
                ))}
              </Box>
            </Stack>
          )}
        </Paper>
      </Box>
    </Box>
  );
}
