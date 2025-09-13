import {
  Box,
  Button,
  Chip,
  Grid,
  List,
  ListItemButton,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  addDays,
  eachDayOfInterval,
  endOfMonth,
  format,
  startOfMonth,
} from "date-fns";
import { useEffect, useMemo, useState } from "react";
import {
  useCreateEvenement,
  useEvenements,
  useUpdateEvenement,
} from "@/services/api";
import { Evenement } from "@shared/api";

function CalendarMonth({
  events,
  onSelect,
}: {
  events: Evenement[];
  onSelect: (id: string) => void;
}) {
  const today = new Date();
  const start = startOfMonth(today);
  const end = endOfMonth(today);
  const days = eachDayOfInterval({ start, end });

  function eventsFor(d: Date) {
    const key = format(d, "yyyy-MM-dd");
    return events.filter((e) => e.date === key);
  }

  return (
    <Box
      sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 1 }}
    >
      {days.map((d) => (
        <Paper key={d.toISOString()} sx={{ p: 1.2, minHeight: 96 }}>
          <Typography variant="caption" color="text.secondary">
            {format(d, "d")}
          </Typography>
          <Stack spacing={0.5} sx={{ mt: 0.5 }}>
            {eventsFor(d).map((ev) => (
              <Chip
                key={ev.id}
                size="small"
                label={ev.nom}
                color={
                  ev.statut === "confirme"
                    ? "success"
                    : ev.statut === "annule"
                      ? "default"
                      : "warning"
                }
                onClick={() => onSelect(ev.id)}
              />
            ))}
          </Stack>
        </Paper>
      ))}
    </Box>
  );
}

export default function RestoEvenements() {
  const { data } = useEvenements();
  const create = useCreateEvenement();
  const update = useUpdateEvenement();
  const [selectedId, setSelectedId] = useState<string | null>(
    data?.[0]?.id ?? null,
  );
  useEffect(() => {
    if (data && !selectedId) setSelectedId(data[0]?.id ?? null);
  }, [data]);
  const selected = data?.find((e) => e.id === selectedId) || null;

  const [statusFilter, setStatusFilter] = useState<
    "all" | "planifie" | "confirme" | "annule"
  >("all");
  const filtered = useMemo(() => {
    let list = data || [];
    if (statusFilter !== "all")
      list = list.filter((e) => e.statut === statusFilter);
    return list;
  }, [data, statusFilter]);

  function saveField<K extends keyof Evenement>(k: K, v: Evenement[K]) {
    if (!selected) return;
    update.mutate({ id: selected.id, [k]: v } as any);
  }

  function newEvent() {
    const today = format(new Date(), "yyyy-MM-dd");
    create.mutate({
      nom: "Nouvel événement",
      date: today,
      heures: "19:00–22:00",
      nb: 0,
      contact: "",
      statut: "planifie",
    });
  }

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Typography variant="h4" fontWeight={800}>
          Événements
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined">Export calendrier</Button>
          <Button variant="contained" onClick={newEvent}>
            Nouvel événement
          </Button>
        </Stack>
      </Box>

      {/* 1) Filtres + Événements rapides (au-dessus du calendrier) */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography fontWeight={800} mb={1}>
              Filtres
            </Typography>
            <Stack direction="row" gap={1} flexWrap="wrap">
              <Chip
                label="Tous"
                onClick={() => setStatusFilter("all")}
                color={statusFilter === "all" ? "primary" : "default"}
                variant={statusFilter === "all" ? "filled" : "outlined"}
              />
              <Chip
                label="Planifié"
                onClick={() => setStatusFilter("planifie")}
                color={statusFilter === "planifie" ? "primary" : "default"}
                variant={statusFilter === "planifie" ? "filled" : "outlined"}
              />
              <Chip
                label="Confirmé"
                onClick={() => setStatusFilter("confirme")}
                color={statusFilter === "confirme" ? "primary" : "default"}
                variant={statusFilter === "confirme" ? "filled" : "outlined"}
              />
              <Chip
                label="Annulé"
                onClick={() => setStatusFilter("annule")}
                color={statusFilter === "annule" ? "primary" : "default"}
                variant={statusFilter === "annule" ? "filled" : "outlined"}
              />
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography fontWeight={800} mb={1}>
              Événements rapides
            </Typography>
            <List dense>
              {filtered.map((ev) => (
                <ListItemButton
                  key={ev.id}
                  selected={ev.id === selectedId}
                  onClick={() => setSelectedId(ev.id)}
                >
                  <ListItemText
                    primary={ev.nom}
                    secondary={`${ev.date} · ${ev.heures} · ${ev.nb} pers`}
                  />
                </ListItemButton>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* 2) Calendrier du mois */}
      <Box sx={{ mb: 2 }}>
        <Paper sx={{ p: 2 }}>
          <CalendarMonth
            events={filtered}
            onSelect={(id) => setSelectedId(id)}
          />
        </Paper>
      </Box>

      {/* 3) Détails en dessous du calendrier */}
      <Paper sx={{ p: 2 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={1}
        >
          <Typography fontWeight={800}>Détails de l'événement</Typography>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined">Dupliquer</Button>
            <Button
              variant="contained"
              onClick={() => selected && update.mutate({ id: selected.id })}
            >
              Enregistrer
            </Button>
          </Stack>
        </Stack>

        {!selected && (
          <Typography color="text.secondary">
            Sélectionnez un événement
          </Typography>
        )}
        {selected && (
          <Stack spacing={1.2}>
            <TextField
              size="small"
              label="Nom"
              defaultValue={selected.nom}
              onBlur={(e) => saveField("nom", e.target.value)}
            />
            <TextField
              size="small"
              label="Date"
              type="date"
              defaultValue={selected.date}
              onBlur={(e) => saveField("date", e.target.value)}
            />
            <TextField
              size="small"
              label="Heures"
              defaultValue={selected.heures}
              onBlur={(e) => saveField("heures", e.target.value)}
            />
            <TextField
              size="small"
              type="number"
              label="Capacité"
              defaultValue={selected.nb}
              onBlur={(e) =>
                saveField("nb", parseInt(e.target.value || "0", 10))
              }
            />
            <TextField
              size="small"
              label="Salle"
              placeholder="Salle principale"
            />
            <TextField
              size="small"
              label="Menu dédié"
              placeholder="Menu Soirée Jazz"
            />
            <TextField
              size="small"
              label="Responsable"
              defaultValue={selected.contact}
              onBlur={(e) => saveField("contact", e.target.value)}
            />
            <TextField
              size="small"
              label="Notes"
              defaultValue={selected.notes}
              onBlur={(e) => saveField("notes", e.target.value)}
              multiline
              minRows={3}
            />
            <Stack direction="row" gap={1}>
              <Chip label="Aperçu" variant="outlined" />
              <Chip label="Invités" variant="outlined" />
              <Chip label="Ressources" variant="outlined" />
            </Stack>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Budget: 1 200 000 Ar · Prévisions CA: 2 800 000 Ar · Marge
                estimée: 57%
              </Typography>
            </Box>
          </Stack>
        )}
      </Paper>
    </Box>
  );
}
