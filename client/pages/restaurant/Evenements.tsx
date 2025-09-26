import {
  Box,
  Button,
  Chip,
  Grid,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  startOfMonth,
} from "date-fns";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  useCreateEvenement,
  useEvenements,
  useUpdateEvenement,
} from "@/services/api";
import { Evenement } from "@shared/api";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import WineBarIcon from "@mui/icons-material/WineBar";
import CakeIcon from "@mui/icons-material/Cake";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import FavoriteIcon from "@mui/icons-material/Favorite";
import EventIcon from "@mui/icons-material/Event";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

function typeIcon(t?: Evenement["type"]) {
  switch (t) {
    case "musique":
      return <MusicNoteIcon fontSize="small" />;
    case "degustation":
      return <WineBarIcon fontSize="small" />;
    case "anniversaire":
      return <CakeIcon fontSize="small" />;
    case "conference":
      return <BusinessCenterIcon fontSize="small" />;
    case "mariage":
      return <FavoriteIcon fontSize="small" />;
    default:
      return <EventIcon fontSize="small" />;
  }
}

function statutChip(ev: Evenement) {
  const label = ev.statut === "confirme" ? "Confirmé" : ev.statut === "annule" ? "Annulé" : "Planifié";
  const color: any = ev.statut === "confirme" ? "success" : ev.statut === "annule" ? "default" : "warning";
  return <Chip size="small" label={label} color={color} variant={ev.statut === "annule" ? "outlined" : "filled"} />;
}

function CalendarMonth({
  baseDate,
  events,
  onSelect,
}: {
  baseDate: Date;
  events: Evenement[];
  onSelect: (id: string) => void;
}) {
  const start = startOfMonth(baseDate);
  const end = endOfMonth(baseDate);
  const days = eachDayOfInterval({ start, end });

  function eventsFor(d: Date) {
    const key = format(d, "yyyy-MM-dd");
    return events.filter((e) => e.date === key);
  }

  const weekdays = ["L", "M", "M", "J", "V", "S", "D"];

  return (
    <Box>
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 1, mb: 1 }}>
        {weekdays.map((w, i) => (
          <Typography key={i} variant="caption" color="text.secondary">
            {w}
          </Typography>
        ))}
      </Box>
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 1 }}>
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
                  color={ev.statut === "confirme" ? "success" : ev.statut === "annule" ? "default" : "warning"}
                  onClick={() => onSelect(ev.id)}
                />
              ))}
            </Stack>
          </Paper>
        ))}
      </Box>
    </Box>
  );
}

export default function RestoEvenements() {
  const { data } = useEvenements();
  const create = useCreateEvenement();
  const update = useUpdateEvenement();
  const [selectedId, setSelectedId] = useState<string | null>(data?.[0]?.id ?? null);
  useEffect(() => {
    if (data && !selectedId) setSelectedId(data[0]?.id ?? null);
  }, [data]);
  const [monthRef, setMonthRef] = useState<Date>(startOfMonth(new Date()));
  const detailsRef = useRef<HTMLDivElement | null>(null);
  const nameRef = useRef<HTMLInputElement | null>(null);

  function focusDetails() {
    detailsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    setTimeout(() => nameRef.current?.focus(), 120);
  }
  const monthLabel = format(monthRef, "LLLL yyyy");

  // Filters: statut + type
  const [statusFilter, setStatusFilter] = useState<"all" | "planifie" | "confirme" | "annule">("all");
  const [typeFilter, setTypeFilter] = useState<"all" | NonNullable<Evenement["type"]>>("all");

  const inMonth = useMemo(() => {
    const list = data || [];
    const m = format(monthRef, "yyyy-MM");
    return list.filter((e) => (e.date || "").startsWith(m));
  }, [data, monthRef]);

  const filtered = useMemo(() => {
    let list = inMonth;
    if (statusFilter !== "all") list = list.filter((e) => e.statut === statusFilter);
    if (typeFilter !== "all") list = list.filter((e) => e.type === typeFilter);
    return list;
  }, [inMonth, statusFilter, typeFilter]);

  const selected = (data || []).find((e) => e.id === selectedId) || null;

  // Details form state (save only on button)
  const [form, setForm] = useState<Partial<Evenement>>({});
  useEffect(() => {
    if (selected) {
      setForm({
        nom: selected.nom,
        date: selected.date,
        heures: selected.heures,
        nb: selected.nb,
        contact: selected.contact,
        notes: selected.notes,
        statut: selected.statut,
        type: selected.type,
      });
    }
  }, [selectedId]);

  function onSave() {
    if (!selected) return;
    update.mutate({ id: selected.id, ...form } as any, {
      onSuccess: (ev) => {
        if (ev?.date) setMonthRef(startOfMonth(new Date(ev.date)));
        setSelectedId(ev.id);
      },
    });
  }

  function onDuplicate() {
    if (!selected) return;
    const payload: Omit<Evenement, "id"> = {
      nom: `${selected.nom} (copie)`,
      date: selected.date,
      heures: selected.heures,
      nb: selected.nb,
      contact: selected.contact,
      statut: selected.statut,
      notes: selected.notes,
      type: selected.type,
    } as Omit<Evenement, "id">;
    create.mutate(payload, { onSuccess: (ev) => { setSelectedId(ev.id); setMonthRef(startOfMonth(new Date(ev.date))); setForm(ev); focusDetails(); } });
  }

  function newEvent() {
    const today = format(new Date(), "yyyy-MM-dd");
    create.mutate(
      { nom: "Nouvel événement", date: today, heures: "19:00–22:00", nb: 0, contact: "", statut: "planifie", type: "musique" },
      { onSuccess: (ev) => { setSelectedId(ev.id); setMonthRef(startOfMonth(new Date(ev.date))); setForm(ev); focusDetails(); } },
    );
  }

  function exportCsv() {
    const rows = [
      ["Nom", "Date", "Heures", "Capacité", "Statut", "Type", "Contact"],
      ...((data || []).map((e) => [e.nom, e.date, e.heures, String(e.nb), e.statut || "", e.type || "", e.contact])),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "evenements.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h4" fontWeight={800}>
          Événements
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" onClick={exportCsv}>Export calendrier</Button>
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
            <Stack spacing={1.5}>
              <Stack direction="row" gap={1} flexWrap="wrap" alignItems="center">
                <Typography variant="body2" color="text.secondary">Période</Typography>
                <Chip label="Mois précédent" onClick={() => setMonthRef((d) => addMonths(d, -1))} variant="outlined" />
                <Chip label="Mois suivant" onClick={() => setMonthRef((d) => addMonths(d, 1))} variant="outlined" />
                <Chip label="Ce mois" color="primary" onClick={() => setMonthRef(startOfMonth(new Date()))} />
                <Typography sx={{ ml: 1 }} fontWeight={700}>{monthLabel}</Typography>
              </Stack>
              <Stack direction="row" gap={1} flexWrap="wrap" alignItems="center">
                <Typography variant="body2" color="text.secondary">Statut</Typography>
                <Chip label="Tous" onClick={() => setStatusFilter("all")} color={statusFilter === "all" ? "primary" : "default"} variant={statusFilter === "all" ? "filled" : "outlined"} />
                <Chip label="Planifié" onClick={() => setStatusFilter("planifie")} color={statusFilter === "planifie" ? "primary" : "default"} variant={statusFilter === "planifie" ? "filled" : "outlined"} />
                <Chip label="Confirmé" onClick={() => setStatusFilter("confirme")} color={statusFilter === "confirme" ? "primary" : "default"} variant={statusFilter === "confirme" ? "filled" : "outlined"} />
                <Chip label="Annulé" onClick={() => setStatusFilter("annule")} color={statusFilter === "annule" ? "primary" : "default"} variant={statusFilter === "annule" ? "filled" : "outlined"} />
              </Stack>
              <Stack direction="row" gap={1} flexWrap="wrap" alignItems="center">
                <Typography variant="body2" color="text.secondary">Type</Typography>
                <Chip icon={typeIcon()} label="Tous" onClick={() => setTypeFilter("all")} color={typeFilter === "all" ? "primary" : "default"} variant={typeFilter === "all" ? "filled" : "outlined"} />
                <Chip icon={<MusicNoteIcon />} label="Musique" onClick={() => setTypeFilter("musique")} color={typeFilter === "musique" ? "primary" : "default"} variant={typeFilter === "musique" ? "filled" : "outlined"} />
                <Chip icon={<WineBarIcon />} label="Dégustation" onClick={() => setTypeFilter("degustation")} color={typeFilter === "degustation" ? "primary" : "default"} variant={typeFilter === "degustation" ? "filled" : "outlined"} />
                <Chip icon={<CakeIcon />} label="Anniversaire" onClick={() => setTypeFilter("anniversaire")} color={typeFilter === "anniversaire" ? "primary" : "default"} variant={typeFilter === "anniversaire" ? "filled" : "outlined"} />
                <Chip icon={<BusinessCenterIcon />} label="Conférence" onClick={() => setTypeFilter("conference")} color={typeFilter === "conference" ? "primary" : "default"} variant={typeFilter === "conference" ? "filled" : "outlined"} />
                <Chip icon={<FavoriteIcon />} label="Mariage" onClick={() => setTypeFilter("mariage")} color={typeFilter === "mariage" ? "primary" : "default"} variant={typeFilter === "mariage" ? "filled" : "outlined"} />
              </Stack>
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
                <ListItemButton key={ev.id} selected={ev.id === selectedId} onClick={() => { setSelectedId(ev.id); focusDetails(); }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>{typeIcon(ev.type)}</ListItemIcon>
                  <ListItemText primary={ev.nom} secondary={`${ev.date} · ${ev.heures} · ${ev.nb} pers`} />
                  {statutChip(ev)}
                </ListItemButton>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* 2) Calendrier du mois */}
      <Box sx={{ mb: 2 }}>
        <Paper sx={{ p: 2 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
            <Stack direction="row" alignItems="center" gap={1}>
              <Button size="small" variant="outlined" onClick={() => setMonthRef((d) => addMonths(d, -1))} startIcon={<ChevronLeftIcon />}>Mois</Button>
              <Typography fontWeight={800}>{monthLabel}</Typography>
              <Button size="small" variant="outlined" onClick={() => setMonthRef((d) => addMonths(d, 1))} endIcon={<ChevronRightIcon />}>Mois</Button>
            </Stack>
          </Stack>
          <CalendarMonth baseDate={monthRef} events={filtered} onSelect={(id) => { setSelectedId(id); focusDetails(); }} />
        </Paper>
      </Box>

      {/* 3) Détails en dessous du calendrier */}
      <Paper sx={{ p: 2, minHeight: 400 }} ref={detailsRef}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography fontWeight={800}>Détails de l'événement</Typography>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" onClick={onDuplicate} disabled={!selected}>Dupliquer</Button>
            <Button variant="contained" onClick={onSave} disabled={!selected}>Valider</Button>
          </Stack>
        </Stack>

        {!selected && (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
            <Typography color="text.secondary">Sélectionnez un événement pour voir les détails</Typography>
          </Box>
        )}
        {selected && (
          <Stack spacing={1.2}>
            <TextField size="small" label="Nom" value={form.nom || ""} onChange={(e) => setForm((f) => ({ ...f, nom: e.target.value }))} inputRef={nameRef} />
            <TextField size="small" label="Date" type="date" value={form.date || ""} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
            <TextField size="small" label="Heures" value={form.heures || ""} onChange={(e) => setForm((f) => ({ ...f, heures: e.target.value }))} />
            <TextField size="small" type="number" label="Capacité" value={String(form.nb ?? 0)} onChange={(e) => setForm((f) => ({ ...f, nb: parseInt(e.target.value || "0", 10) }))} />
            <Stack direction="row" gap={1}>
              <Select size="small" value={form.statut || "planifie"} onChange={(e) => setForm((f) => ({ ...f, statut: e.target.value as any }))}>
                <MenuItem value="planifie">Planifié</MenuItem>
                <MenuItem value="confirme">Confirmé</MenuItem>
                <MenuItem value="annule">Annulé</MenuItem>
              </Select>
              <Select size="small" value={form.type || "autre"} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as any }))}>
                <MenuItem value="musique">Musique</MenuItem>
                <MenuItem value="degustation">Dégustation</MenuItem>
                <MenuItem value="anniversaire">Anniversaire</MenuItem>
                <MenuItem value="conference">Conférence</MenuItem>
                <MenuItem value="mariage">Mariage</MenuItem>
                <MenuItem value="autre">Autre</MenuItem>
              </Select>
            </Stack>
            <TextField size="small" label="Responsable" value={form.contact || ""} onChange={(e) => setForm((f) => ({ ...f, contact: e.target.value }))} />
            <TextField size="small" label="Notes" value={form.notes || ""} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} multiline minRows={3} />
            <Stack direction="row" gap={1}>
              <Chip label="Aperçu" variant="outlined" />
              <Chip label="Invités" variant="outlined" />
              <Chip label="Ressources" variant="outlined" />
            </Stack>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Budget: 1 200 000 Ar · Prévisions CA: 2 800 000 Ar · Marge estimée: 57%
              </Typography>
            </Box>
          </Stack>
        )}
      </Paper>
    </Box>
  );
}
