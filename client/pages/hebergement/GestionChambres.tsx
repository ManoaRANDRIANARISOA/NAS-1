import {
  Box,
  Button,
  Chip,
  Grid,
  Paper,
  Stack,
  Typography,
  Drawer,
  Divider,
  Select,
  MenuItem,
  TextField,
} from "@mui/material";
import {
  addDays,
  addHours,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  getISOWeek,
  isWithinInterval,
  setHours,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { fr } from "date-fns/locale";
import { useEffect, useState, Fragment } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { chambres as chambresData } from "@/services/mock";
import {
  useHebergementReservations,
  useUpdateHebergementReservation,
  useCreateHebergementReservation,
} from "@/services/api";
import { Reservation } from "@shared/api";

type View = "month" | "week" | "day";

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Box
        sx={{
          width: 10,
          height: 10,
          borderRadius: "50%",
          bgcolor: color,
          border: "1px solid",
          borderColor: "divider",
        }}
      />
      <Typography variant="caption">{label}</Typography>
    </Stack>
  );
}

function reservationColor(r?: Reservation) {
  if (!r) return "#ffffff"; // Libre: blanc
  if (r.statut === "arrivee") return "#E57373"; // Occupée
  if (r.statut === "confirmee") return "#FCE8C7"; // Réservée
  if (r.statut === "en_attente") return "#FFF6BF"; // En attente
  return "#FCE8C7";
}

function roomStatusColor(statut: string) {
  if (statut === "maintenance") return "#BDBDBD"; // Hors service
  return "#ffffff"; // Libre
}

function intervalFor(view: View, base: Date) {
  if (view === "month") {
    const start = startOfMonth(base);
    const end = endOfMonth(base);
    return { start, end };
  }
  if (view === "week") {
    const start = startOfWeek(base, { weekStartsOn: 1 });
    const end = endOfWeek(base, { weekStartsOn: 1 });
    return { start, end };
  }
  const start = startOfDay(base);
  const end = addHours(start, 24);
  return { start, end };
}

function Calendar({
  view,
  dateRef,
  statusFilter,
}: {
  view: View;
  dateRef: Date;
  statusFilter: "all" | "libre" | "reservee" | "occupee" | "maintenance";
}) {
  const { data: res } = useHebergementReservations();
  const range = intervalFor(view, dateRef);

  function roomDerivedStatus(roomId: string) {
    const room = chambresData.find((c) => c.id === roomId)!;
    if (room.statut === "maintenance") return "maintenance" as const;
    const has = (res || []).some(
      (r) =>
        r.type === "hebergement" &&
        r.chambreId === roomId &&
        isWithinInterval(new Date(r.dateDebut), range),
    );
    if (has) return "reservee" as const;
    return "libre" as const;
  }

  const rooms = chambresData.filter((c) =>
    statusFilter === "all" ? true : roomDerivedStatus(c.id) === statusFilter,
  );

  function hasReservation(cId: string, dStart: Date, dEnd: Date) {
    const r = (res || []).find(
      (rr) =>
        rr.type === "hebergement" &&
        rr.chambreId === cId &&
        isWithinInterval(new Date(rr.dateDebut), { start: dStart, end: dEnd }),
    );
    return r;
  }

  const DAY_W = 120;
  const HOUR_W = 80;

  if (view === "month") {
    const start = startOfMonth(dateRef);
    const end = endOfMonth(dateRef);
    const days = eachDayOfInterval({ start, end });
    return (
      <Box sx={{ minWidth: 160 + days.length * DAY_W }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: `160px repeat(${days.length}, ${DAY_W}px)`,
            gap: 1,
            px: 1,
          }}
        >
          <Box />
          {days.map((d) => (
            <Box
              key={d.toISOString()}
              sx={{ textAlign: "center", color: "text.secondary" }}
            >
              {format(d, "d")}
            </Box>
          ))}
          {rooms.map((c) => (
            <Fragment key={c.id}>
              <Box sx={{ py: 1, fontWeight: 700 }}>
                {c.numero}
                <Typography
                  variant="caption"
                  sx={{ display: "block" }}
                  color="text.secondary"
                >
                  {c.categorie}
                </Typography>
              </Box>
              {days.map((d, i) => {
                const r = hasReservation(c.id, d, addDays(d, 1));
                return (
                  <Box
                    key={`${c.id}-${i}`}
                    sx={{
                      height: 28,
                      borderRadius: 1,
                      bgcolor: r
                        ? reservationColor(r)
                        : roomStatusColor(c.statut),
                      border: "1px dashed",
                      borderColor: "divider",
                    }}
                  />
                );
              })}
            </Fragment>
          ))}
        </Box>
      </Box>
    );
  }

  if (view === "week") {
    const start = startOfWeek(dateRef, { weekStartsOn: 1 });
    const days = Array.from({ length: 7 }).map((_, i) => addDays(start, i));
    return (
      <Box sx={{ minWidth: 160 + 7 * DAY_W }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: `160px repeat(7, ${DAY_W}px)`,
            gap: 1,
            px: 1,
          }}
        >
          <Box />
          {days.map((d) => (
            <Box
              key={d.toISOString()}
              sx={{ textAlign: "center", color: "text.secondary" }}
            >
              {format(d, "EEE d", { locale: fr })}
            </Box>
          ))}
          {rooms.map((c) => (
            <Fragment key={c.id}>
              <Box sx={{ py: 1, fontWeight: 700 }}>
                {c.numero}
                <Typography
                  variant="caption"
                  sx={{ display: "block" }}
                  color="text.secondary"
                >
                  {c.categorie}
                </Typography>
              </Box>
              {days.map((d, i) => {
                const r = hasReservation(c.id, d, addDays(d, 1));
                return (
                  <Box
                    key={`${c.id}-${i}`}
                    sx={{
                      height: 28,
                      borderRadius: 1,
                      bgcolor: r
                        ? reservationColor(r)
                        : roomStatusColor(c.statut),
                      border: "1px dashed",
                      borderColor: "divider",
                    }}
                  />
                );
              })}
            </Fragment>
          ))}
        </Box>
      </Box>
    );
  }

  const start = startOfDay(dateRef);
  const hours = Array.from({ length: 24 }).map((_, i) => setHours(start, i));
  return (
    <Box sx={{ minWidth: 160 + 24 * HOUR_W }}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: `160px repeat(24, ${HOUR_W}px)`,
          gap: 1,
          px: 1,
        }}
      >
        <Box />
        {hours.map((h, i) => (
          <Box key={i} sx={{ textAlign: "center", color: "text.secondary" }}>
            {format(h, "HH")}
          </Box>
        ))}
        {rooms.map((c) => (
          <Fragment key={c.id}>
            <Box sx={{ py: 1, fontWeight: 700 }}>
              {c.numero}
              <Typography
                variant="caption"
                sx={{ display: "block" }}
                color="text.secondary"
              >
                {c.categorie}
              </Typography>
            </Box>
            {hours.map((h, i) => {
              const r = hasReservation(c.id, h, addHours(h, 1));
              return (
                <Box
                  key={`${c.id}-${i}`}
                  sx={{
                    height: 28,
                    borderRadius: 1,
                    bgcolor: r
                      ? reservationColor(r)
                      : roomStatusColor(c.statut),
                    border: "1px dashed",
                    borderColor: "divider",
                  }}
                />
              );
            })}
          </Fragment>
        ))}
      </Box>
    </Box>
  );
}

export default function GestionChambres() {
  const { data: list } = useHebergementReservations();
  const update = useUpdateHebergementReservation();
  const create = useCreateHebergementReservation();
  const [open, setOpen] = useState<Reservation | null>(null);
  const [view, setView] = useState<View>("month");
  const [dateRef, setDateRef] = useState<Date>(startOfMonth(new Date()));
  const [statusFilter, setStatusFilter] = useState<
    "all" | "libre" | "reservee" | "occupee" | "maintenance"
  >("all");
  const location = useLocation() as any;
  const navigate = useNavigate();

  useEffect(() => {
    const state = location.state as any;
    if (state?.createReservation) {
      const clientId = state.createReservation.clientId as string;
      const todayISO = new Date().toISOString();
      const draft: Reservation = {
        id: `temp-${Date.now()}`,
        type: "hebergement",
        clientId,
        chambreId: "",
        dateDebut: todayISO,
        gracePeriodMinutes: 0,
        statut: "en_attente",
      } as Reservation;
      setOpen(draft);
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);

  function label() {
    if (view === "month") return format(dateRef, "LLLL yyyy", { locale: fr });
    if (view === "week") return `Semaine ${getISOWeek(dateRef)}`;
    return format(dateRef, "dd LLLL yyyy", { locale: fr });
  }

  function handleNew() {
    const todayISO = new Date().toISOString();
    const draft: Reservation = {
      id: `temp-${Date.now()}`,
      type: "hebergement",
      clientId: "",
      chambreId: "",
      dateDebut: todayISO,
      gracePeriodMinutes: 0,
      statut: "en_attente",
    } as Reservation;
    setOpen(draft);
  }

  return (
    <Box>
      <Typography variant="h4" fontWeight={800} mb={2}>
        Hébergement — Gestion des chambres
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={1}
              justifyContent="space-between"
              sx={{ mb: 1 }}
            >
              <Stack direction="row" spacing={1}>
                <Chip
                  size="small"
                  label="Mensuel"
                  color={view === "month" ? "primary" : "default"}
                  variant={view === "month" ? "filled" : "outlined"}
                  onClick={() => setView("month")}
                />
                <Chip
                  size="small"
                  label="Hebdo"
                  color={view === "week" ? "primary" : "default"}
                  variant={view === "week" ? "filled" : "outlined"}
                  onClick={() => setView("week")}
                />
                <Chip
                  size="small"
                  label="Jour"
                  color={view === "day" ? "primary" : "default"}
                  variant={view === "day" ? "filled" : "outlined"}
                  onClick={() => setView("day")}
                />
                <Chip
                  size="small"
                  label="Aujourd'hui"
                  variant="outlined"
                  onClick={() => setDateRef(new Date())}
                />
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip size="small" label={label()} />
                <Chip
                  size="small"
                  label="◀"
                  onClick={() =>
                    setDateRef((d) =>
                      view === "month"
                        ? addDays(d, -30)
                        : view === "week"
                          ? addDays(d, -7)
                          : addDays(d, -1),
                    )
                  }
                />
                <Chip
                  size="small"
                  label="▶"
                  onClick={() =>
                    setDateRef((d) =>
                      view === "month"
                        ? addDays(d, 30)
                        : view === "week"
                          ? addDays(d, 7)
                          : addDays(d, 1),
                    )
                  }
                />
                <Select
                  size="small"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                >
                  <MenuItem value="all">Statut: Tous</MenuItem>
                  <MenuItem value="libre">Libre</MenuItem>
                  <MenuItem value="reservee">Réservée</MenuItem>
                  <MenuItem value="occupee">Occupée</MenuItem>
                  <MenuItem value="maintenance">Hors service</MenuItem>
                </Select>
              </Stack>
            </Stack>
            <Box sx={{ overflowX: "auto" }}>
              <Calendar
                view={view}
                dateRef={dateRef}
                statusFilter={statusFilter}
              />
            </Box>
            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              <Legend color="#ffffff" label="Libre" />
              <Legend color="#FCE8C7" label="Réservée" />
              <Legend color="#E57373" label="Occupée" />
              <Legend color="#BDBDBD" label="Hors service" />
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ mb: 1 }}
            >
              <Typography fontWeight={800}>Réservations — Liste</Typography>
              <Stack direction="row" spacing={1}>
                <Button variant="outlined">Export</Button>
                <Button variant="contained" onClick={handleNew}>
                  Nouvelle réservation
                </Button>
              </Stack>
            </Stack>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 140px 140px 140px 120px 100px",
                px: 1,
                py: 1,
                color: "text.secondary",
                fontWeight: 700,
              }}
            >
              <Box>Client</Box>
              <Box>Arrivée</Box>
              <Box>Départ</Box>
              <Box>Chambre</Box>
              <Box>Statut</Box>
              <Box>Action</Box>
            </Box>
            {(list || []).map((r) => (
              <Box
                key={r.id}
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr 140px 140px 140px 120px 100px",
                  px: 1,
                  py: 1,
                  alignItems: "center",
                  borderTop: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Box>{r.clientId}</Box>
                <Box>{format(new Date(r.dateDebut), "dd/MM/yyyy")}</Box>
                <Box>
                  {r.dateFin ? format(new Date(r.dateFin), "dd/MM/yyyy") : "-"}
                </Box>
                <Box>
                  {chambresData.find((c) => c.id === r.chambreId)?.numero ??
                    "-"}
                </Box>
                <Box>{r.statut}</Box>
                <Box>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => setOpen(r)}
                  >
                    Voir
                  </Button>
                </Box>
              </Box>
            ))}
          </Paper>
        </Grid>
      </Grid>

      <Drawer anchor="right" open={!!open} onClose={() => setOpen(null)}>
        <Box sx={{ width: 420, p: 2 }}>
          <Typography variant="h6" fontWeight={800}>
            Réservation
          </Typography>
          <Divider sx={{ my: 1 }} />
          {!open && (
            <Typography color="text.secondary">
              Sélectionnez une réservation
            </Typography>
          )}
          {open && (
            <EditReservation
              r={open}
              onClose={() => setOpen(null)}
              onSave={(p) => {
                if (String(p.id).startsWith("temp-")) {
                  const { id, ...payload } = p as any;
                  create.mutate(payload as any, {
                    onSuccess: () => setOpen(null),
                  });
                } else {
                  (update as any).mutate(p as any, {
                    onSuccess: () => setOpen(null),
                  });
                }
              }}
            />
          )}
        </Box>
      </Drawer>
    </Box>
  );
}

function Ariary({ value }: { value: number }) {
  return <>{value.toLocaleString("fr-MG")} Ar</>;
}

function EditReservation({
  r,
  onSave,
  onClose,
}: {
  r: Reservation;
  onSave: (p: Partial<Reservation> & { id: string }) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    clientId: r.clientId || "",
    chambreId: r.chambreId || "",
    dateDebut: r.dateDebut,
    dateFin: r.dateFin || "",
    statut: r.statut,
  });
  const [lines, setLines] = useState<
    { label: string; qte: number; prix: number }[]
  >([{ label: "Nuitée", qte: 1, prix: 120000 }]);
  const total = lines.reduce((a, b) => a + b.qte * b.prix, 0);

  function changeLine(i: number, key: "label" | "qte" | "prix", v: any) {
    setLines((ls) =>
      ls.map((l, idx) =>
        idx === i
          ? { ...l, [key]: key === "label" ? v : parseInt(v || "0", 10) }
          : l,
      ),
    );
  }

  return (
    <Stack spacing={1}>
      <TextField
        size="small"
        label="Client"
        value={form.clientId}
        onChange={(e) => setForm({ ...form, clientId: e.target.value })}
      />
      <Select
        size="small"
        value={form.chambreId}
        onChange={(e) => setForm({ ...form, chambreId: e.target.value })}
      >
        {chambresData.map((c) => (
          <MenuItem key={c.id} value={c.id}>
            {c.numero} · {c.categorie}
          </MenuItem>
        ))}
      </Select>
      <TextField
        size="small"
        type="date"
        label="Arrivée"
        value={form.dateDebut.slice(0, 10)}
        onChange={(e) =>
          setForm({
            ...form,
            dateDebut: new Date(e.target.value).toISOString(),
          })
        }
      />
      <TextField
        size="small"
        type="date"
        label="Départ"
        value={(form.dateFin || "").slice(0, 10)}
        onChange={(e) =>
          setForm({ ...form, dateFin: new Date(e.target.value).toISOString() })
        }
      />
      <Select
        size="small"
        value={form.statut}
        onChange={(e) => setForm({ ...form, statut: e.target.value as any })}
      >
        <MenuItem value="en_attente">En attente</MenuItem>
        <MenuItem value="confirmee">Confirmée</MenuItem>
        <MenuItem value="arrivee">Occupée</MenuItem>
        <MenuItem value="terminee">Terminée</MenuItem>
        <MenuItem value="annulee">Annulée</MenuItem>
      </Select>

      <Divider />
      <Typography fontWeight={700}>Facture liée</Typography>
      {lines.map((l, i) => (
        <Stack key={i} direction="row" spacing={1} alignItems="center">
          <TextField
            size="small"
            value={l.label}
            onChange={(e) => changeLine(i, "label", e.target.value)}
          />
          <TextField
            size="small"
            type="number"
            value={l.qte}
            onChange={(e) => changeLine(i, "qte", e.target.value)}
            sx={{ width: 90 }}
          />
          <TextField
            size="small"
            type="number"
            value={l.prix}
            onChange={(e) => changeLine(i, "prix", e.target.value)}
            sx={{ width: 120 }}
          />
          <Typography>
            = <Ariary value={l.qte * l.prix} />
          </Typography>
        </Stack>
      ))}
      <Button
        variant="outlined"
        onClick={() =>
          setLines((ls) => [...ls, { label: "Article", qte: 1, prix: 0 }])
        }
      >
        Ajouter une ligne
      </Button>
      <Typography>
        <b>Total:</b> <Ariary value={total} />
      </Typography>

      <Stack direction="row" spacing={1}>
        <Button variant="outlined" onClick={onClose}>
          Annuler
        </Button>
        <Button
          variant="contained"
          onClick={() => onSave({ id: r.id, ...form })}
        >
          Valider
        </Button>
      </Stack>
    </Stack>
  );
}
