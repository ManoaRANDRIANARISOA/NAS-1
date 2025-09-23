import {
  Box,
  Button,
  Chip,
  Drawer,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useMemo, useState } from "react";
import {
  useTables,
  useEndOfService,
  useTodayRestoReservations,
  useCreateClient,
  useCreateRestoReservation,
} from "@/services/api";
import { Reservation, TableResto } from "@shared/api";
import { TableStatus } from "@/components/StatusChip";
import AssignTableDialog from "@/components/AssignTableDialog";
import CommandesModal from "@/components/CommandesModal";
import { format } from "date-fns";

export default function RestoPlan() {
  const { data: tables } = useTables();
  const todayRes = useTodayRestoReservations();
  const [selected, setSelected] = useState<TableResto | null>(null);
  const [assignOpen, setAssignOpen] = useState(false);
  const [orderOpen, setOrderOpen] = useState(false);
  const end = useEndOfService();

  const [service, setService] = useState<"today" | "dej" | "diner">("today");
  const [cap, setCap] = useState<"all" | "2" | "4p">("all");

  const filteredTables = useMemo(() => {
    let list = tables ?? [];
    if (cap === "2") list = list.filter((t) => t.capacite <= 2);
    if (cap === "4p") list = list.filter((t) => t.capacite >= 4);
    return list;
  }, [tables, cap]);

  function infoForTable(t: TableResto) {
    const r = (todayRes.data ?? [])
      .filter((r) => r.tableId === t.id)
      .sort((a, b) => (a.heure || "").localeCompare(b.heure || ""));
    const now = new Date();
    const current = r.find((rr) => rr.statut === "arrivee");
    if (current) return { label: `Depuis ${current.heure}` };
    const upcoming = r.find(
      (rr) =>
        rr.statut !== "terminee" && (rr.heure || "") >= format(now, "HH:mm"),
    );
    if (upcoming) return { label: `Prochaine: ${upcoming.heure}` };
    return { label: "" };
  }

  const selectedReservationId = selected?.assignedReservationId ?? "";

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
          Plan de salle
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button
            variant={service === "today" ? "contained" : "outlined"}
            onClick={() => setService("today")}
          >
            Aujourd'hui
          </Button>
          <Button
            variant={service === "dej" ? "contained" : "outlined"}
            onClick={() => setService("dej")}
          >
            Déj
          </Button>
          <Button
            variant={service === "diner" ? "contained" : "outlined"}
            onClick={() => setService("diner")}
          >
            Dîner
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() =>
              document
                .getElementById("new-resa")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            Nouvelle réservation
          </Button>
          <Button
            variant="contained"
            onClick={() => end.mutate()}
            disabled={end.isPending}
          >
            Fin de service
          </Button>
        </Stack>
      </Box>

      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        <Chip
          label="Capacité 2"
          color={cap === "2" ? "primary" : "default"}
          onClick={() => setCap("2")}
          variant={cap === "2" ? "filled" : "outlined"}
        />
        <Chip
          label="Capacité 4+"
          color={cap === "4p" ? "primary" : "default"}
          onClick={() => setCap("4p")}
          variant={cap === "4p" ? "filled" : "outlined"}
        />
        <Chip
          label="Toutes"
          color={cap === "all" ? "primary" : "default"}
          onClick={() => setCap("all")}
          variant={cap === "all" ? "filled" : "outlined"}
        />
      </Stack>

      <Grid container spacing={2}>
        {filteredTables.map((t) => (
          <Grid item key={t.id} xs={6} sm={4} md={3} lg={2}>
            <Paper
              onClick={() => setSelected(t)}
              sx={{ p: 2, cursor: "pointer", "&:hover": { boxShadow: 3 } }}
            >
              <Typography variant="subtitle1" fontWeight={800}>
                {t.numero}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t.capacite} pers · {t.emplacement}
              </Typography>
              <Box sx={{ mt: 1 }}>
                <TableStatus value={t.statut} />
              </Box>
              <Typography variant="caption" color="text.secondary">
                {infoForTable(t).label}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <ReservationsList />
      <NewReservationForm />

      <Drawer
        anchor="right"
        open={!!selected}
        onClose={() => setSelected(null)}
      >
        <Box sx={{ width: 360, p: 3 }}>
          <Typography variant="h6" fontWeight={800}>
            {selected?.numero}
          </Typography>
          <Typography color="text.secondary">
            Capacité: {selected?.capacite}
          </Typography>
          <Box sx={{ mt: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Button variant="outlined" onClick={() => setAssignOpen(true)}>
              Assigner
            </Button>
            <Button
              variant="contained"
              onClick={() => setOrderOpen(true)}
              disabled={!selectedReservationId}
            >
              Commandes
            </Button>
            <Button
              color="warning"
              variant="outlined"
              onClick={() => setSelected(null)}
            >
              Fermer
            </Button>
          </Box>
        </Box>
      </Drawer>

      {selected && (
        <AssignTableDialog
          open={assignOpen}
          onClose={() => setAssignOpen(false)}
          tableId={selected.id}
        />
      )}
      {selectedReservationId && (
        <CommandesModal
          open={orderOpen}
          onClose={() => setOrderOpen(false)}
          reservationId={selectedReservationId}
        />
      )}
    </Box>
  );
}

function ReservationsList() {
  const res = useTodayRestoReservations();
  const { data: tables } = useTables();
  return (
    <Box sx={{ mt: 3 }}>
      <Paper sx={{ p: 2 }}>
        <Typography fontWeight={800} mb={1}>
          Réservations — Aujourd'hui
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 120px 120px 100px 100px",
            px: 1,
            py: 1,
            fontWeight: 700,
            color: "text.secondary",
          }}
        >
          <Box>Client</Box>
          <Box>Heure</Box>
          <Box>Couverts</Box>
          <Box>Table</Box>
          <Box>Action</Box>
        </Box>
        {(res.data ?? []).map((r) => (
          <Box
            key={r.id}
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 120px 120px 100px 100px",
              px: 1,
              py: 1,
              alignItems: "center",
              borderTop: "1px solid",
              borderColor: "divider",
            }}
          >
            <Box>{r.clientId}</Box>
            <Box>{r.heure}</Box>
            <Box>{r.nbPersonnes}</Box>
            <Box>{tables?.find((t) => t.id === r.tableId)?.numero ?? "-"}</Box>
            <Box>
              <Button
                size="small"
                variant="outlined"
                onClick={() =>
                  (
                    document.getElementById("open-orders-" + r.id) as any
                  )?.click()
                }
              >
                Ouvrir
              </Button>
            </Box>
          </Box>
        ))}
      </Paper>
    </Box>
  );
}

function NewReservationForm() {
  const createClient = useCreateClient();
  const createResa = useCreateRestoReservation();
  const { data: tables } = useTables();
  const [form, setForm] = useState({
    nom: "",
    telephone: "",
    date: format(new Date(), "yyyy-MM-dd"),
    heure: "19:00",
    nb: 4,
    table: "",
  });

  async function save() {
    const client = await createClient.mutateAsync({
      nom: form.nom,
      telephone: form.telephone,
    });
    const date = new Date(form.date + "T" + form.heure + ":00");
    await createResa.mutateAsync({
      clientId: client.id,
      dateDebut: date.toISOString(),
      heure: form.heure,
      nbPersonnes: form.nb,
      tableId: form.table || undefined,
    });
  }

  return (
    <Box id="new-resa" sx={{ mt: 3 }}>
      <Paper sx={{ p: 2 }}>
        <Typography fontWeight={800} mb={2}>
          Réservation — Nouveau
        </Typography>
        <Stack direction={{ xs: "column", md: "row" }} spacing={1} sx={{ '& .MuiTextField-root': { flex: 1, minWidth: 180 }, flexWrap: 'wrap' }}>
          <TextField
            size="small"
            fullWidth
            label="Nom du client"
            value={form.nom}
            onChange={(e) => setForm({ ...form, nom: e.target.value })}
          />
          <TextField
            size="small"
            fullWidth
            label="Téléphone"
            value={form.telephone}
            onChange={(e) => setForm({ ...form, telephone: e.target.value })}
          />
          <TextField
            size="small"
            fullWidth
            type="date"
            label="Date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />
        </Stack>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={1}
          sx={{ mt: 1, '& .MuiTextField-root': { flex: 1, minWidth: 160 }, flexWrap: 'wrap' }}
        >
          <TextField
            size="small"
            fullWidth
            label="Heure"
            value={form.heure}
            onChange={(e) => setForm({ ...form, heure: e.target.value })}
          />
          <TextField
            size="small"
            fullWidth
            type="number"
            label="Couverts"
            value={form.nb}
            onChange={(e) =>
              setForm({ ...form, nb: parseInt(e.target.value || "0", 10) })
            }
          />
          <FormControl size="small" sx={{ minWidth: 160, flex: 1 }}>
            <InputLabel>Table</InputLabel>
            <Select
              label="Table"
              value={form.table}
              onChange={(e) => setForm({ ...form, table: e.target.value })}
            >
              <MenuItem value="">Aucune</MenuItem>
              {tables?.map((t) => (
                <MenuItem key={t.id} value={t.id}>
                  {t.numero}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
          <Button variant="outlined">Dupliquer</Button>
          <Button variant="contained" onClick={save}>
            Enregistrer
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
