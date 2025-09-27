import {
  Avatar,
  Box,
  Button,
  Chip,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { clients, reservations } from "@/services/mock";
import { useMemo, useState } from "react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

export default function HebergementClients() {
  const [q, setQ] = useState("");
  const list = useMemo(
    () => clients.filter((c) => c.nom.toLowerCase().includes(q.toLowerCase())),
    [q],
  );
  const [selectedId, setSelectedId] = useState(list[0]?.id || "");
  const selected = list.find((c) => c.id === selectedId) || null;
  const history = useMemo(
    () =>
      reservations.filter(
        (r) => r.clientId === selectedId && r.type === "hebergement",
      ),
    [selectedId],
  );
  const navigate = useNavigate();

  return (
    <Box>
      <Typography variant="h4" fontWeight={800} mb={2}>
        Hébergement — Clients
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "320px 1fr" },
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
            {list.map((c) => {
              const hist = reservations.filter(
                (r) => r.clientId === c.id && r.type === "hebergement",
              );
              const last = hist[hist.length - 1];
              const type = "Hébergement";
              return (
                <ListItemButton
                  key={c.id}
                  selected={c.id === selectedId}
                  onClick={() => setSelectedId(c.id)}
                >
                  <Avatar sx={{ width: 24, height: 24, mr: 1 }}>
                    {c.nom[0]}
                  </Avatar>
                  <ListItemText
                    primary={c.nom}
                    secondary={`Dernière: ${last ? format(new Date(last.dateDebut), "dd MMM yyyy") : "—"}`}
                  />
                  <Chip size="small" label={type} />
                </ListItemButton>
              );
            })}
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
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography fontWeight={800}>{selected.nom}</Typography>
                <Stack direction="row" spacing={1}>
                  <Button variant="outlined">E-mail</Button>
                  <Button variant="outlined">Appeler</Button>
                  <Button
                    variant="contained"
                    onClick={() =>
                      navigate("/hebergement/gestion", {
                        state: { createReservation: { clientId: selected.id } },
                      })
                    }
                  >
                    Nouvelle réservation
                  </Button>
                </Stack>
              </Stack>
              <Stack direction={{ xs: "column", md: "row" }} spacing={1}>
                <TextField
                  size="small"
                  label="Nom"
                  defaultValue={selected.nom}
                />
                <TextField
                  size="small"
                  label="Type"
                  defaultValue="Hébergement"
                />
              </Stack>
              <Stack direction={{ xs: "column", md: "row" }} spacing={1}>
                <TextField
                  size="small"
                  label="E-mail"
                  defaultValue={selected.email || ""}
                />
                <TextField
                  size="small"
                  label="Téléphone"
                  defaultValue={selected.telephone}
                />
              </Stack>
              <Stack direction={{ xs: "column", md: "row" }} spacing={1}>
                <TextField size="small" label="Adresse" fullWidth />
                <TextField
                  size="small"
                  label="Pays"
                  defaultValue="Madagascar"
                />
              </Stack>
              <Stack direction={{ xs: "column", md: "row" }} spacing={1}>
                <TextField
                  size="small"
                  label="Tags"
                  placeholder="VIP, Direct"
                />
                <TextField
                  size="small"
                  label="Référence"
                  placeholder="#CLI-00842"
                />
              </Stack>
              <Chip
                size="small"
                label={`Historique: ${history.length} séjours`}
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
                      gridTemplateColumns: "1fr 160px 160px 100px",
                      py: 0.5,
                    }}
                  >
                    <Box>Hébergement</Box>
                    <Box>{format(new Date(h.dateDebut), "dd/MM/yyyy")}</Box>
                    <Box>
                      {h.dateFin
                        ? format(new Date(h.dateFin), "dd/MM/yyyy")
                        : "-"}
                    </Box>
                    <Box>{h.statut}</Box>
                  </Box>
                ))}
              </Box>
              <Stack direction="row" spacing={1}>
                <Button variant="outlined">Voir les factures</Button>
                <Button variant="outlined">Ajouter au planning</Button>
              </Stack>
            </Stack>
          )}
        </Paper>
      </Box>
    </Box>
  );
}
