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
  Card,
  CardContent,
} from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import { useMemo, useState, useEffect } from "react";
import {
  useTables,
  useEndOfService,
  useTodayRestoReservations,
  useCreateClient,
  useCreateRestoReservation,
  useUpdateRestoReservation,
  useDeleteRestoReservation,
  useClients,
} from "@/services/api";
import { Reservation, TableResto } from "@shared/api";
import { TableStatus } from "@/components/StatusChip";
import AssignTableDialog from "@/components/AssignTableDialog";
import CommandesModal from "@/components/CommandesModal";
import { format } from "date-fns";

type ReservationMode = "new" | "view" | null;

export default function RestoPlan() {
  const { data: tables } = useTables();
  const todayRes = useTodayRestoReservations();
  const [selected, setSelected] = useState<TableResto | null>(null);
  const [assignOpen, setAssignOpen] = useState(false);
  const [orderOpen, setOrderOpen] = useState(false);
  const end = useEndOfService();

  const [service, setService] = useState<"today" | "dej" | "diner">("today");
  const [cap, setCap] = useState<"all" | "2" | "4p">("all");
  
  // État pour gérer le mode de réservation (nouvelle ou vue d'une existante)
  const [reservationMode, setReservationMode] = useState<ReservationMode>(null);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);

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

  // Statistiques (statique pour l'instant, prêt pour données dynamiques du backend)
  const topTableStats = useMemo(() => {
    // Simulation - à remplacer par vraies données du backend
    return {
      numero: "T-05",
      totalReservations: 87,
      tauxOccupation: 78
    };
  }, []);

  const topDishStats = useMemo(() => {
    // Simulation - à remplacer par vraies données du backend
    return {
      nom: "Zebu Roti",
      category: "Plat principal",
      totalCommandes: 142,
      tauxCommande: 34
    };
  }, []);

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
          {/* Boutons temporairement cachés */}
          {/* <Button
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
          </Button> */}
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              setReservationMode("new");
              setSelectedReservation(null);
              document
                .getElementById("new-resa")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            Nouvelle réservation
          </Button>
          {/* <Button
            variant="contained"
            onClick={() => end.mutate()}
            disabled={end.isPending}
          >
            Fin de service
          </Button> */}
        </Stack>
      </Box>

      {/* Statistiques */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'primary.50', border: '1px solid', borderColor: 'primary.200' }}>
            <CardContent>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <TrendingUpIcon color="primary" fontSize="small" />
                <Typography variant="caption" fontWeight={700} color="primary.main">
                  Table la plus occupée
                </Typography>
              </Stack>
              <Typography variant="h4" fontWeight={800}>
                {topTableStats.numero}
              </Typography>
              <Typography variant="body2" fontWeight={700} color="primary.main" sx={{ mt: 0.5 }}>
                {topTableStats.tauxOccupation}%
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {topTableStats.totalReservations} réservations ce mois
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'secondary.50', border: '1px solid', borderColor: 'secondary.200' }}>
            <CardContent>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <RestaurantIcon color="secondary" fontSize="small" />
                <Typography variant="caption" fontWeight={700} color="secondary.main">
                  Plat le plus pris
                </Typography>
              </Stack>
              <Typography variant="h5" fontWeight={800}>
                {topDishStats.nom}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                {topDishStats.category}
              </Typography>
              <Typography variant="body2" fontWeight={700} color="secondary.main" sx={{ mt: 0.5 }}>
                {topDishStats.totalCommandes} commandes
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {topDishStats.tauxCommande}% du total
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

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

      <ReservationsList 
        onViewReservation={(reservation) => {
          setReservationMode("view");
          setSelectedReservation(reservation);
          document
            .getElementById("new-resa")
            ?.scrollIntoView({ behavior: "smooth" });
        }}
      />
      <NewReservationForm 
        mode={reservationMode}
        selectedReservation={selectedReservation}
        onDelete={() => {
          // TODO: Implémenter la suppression avec le backend
          setReservationMode(null);
          setSelectedReservation(null);
          alert("Réservation supprimée (à implémenter avec le backend)");
        }}
      />

      <Drawer
        anchor="right"
        open={!!selected}
        onClose={() => setSelected(null)}
      >
        <Box sx={{ width: 360, p: 3, paddingTop: 10 }}>
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

function ReservationsList({ onViewReservation }: { onViewReservation: (reservation: Reservation) => void }) {
  const res = useTodayRestoReservations();
  const { data: tables } = useTables();
  const { data: clients } = useClients();
  
  const getClientName = (clientId: string) => {
    const client = clients?.find((c) => c.id === clientId);
    return client?.nom || clientId;
  };
  
  return (
    <Box sx={{ mt: 3 }}>
      <Paper sx={{ p: 2 }}>
        <Typography fontWeight={800} mb={1}>
          Liste Réservation
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
            <Box>{getClientName(r.clientId)}</Box>
            <Box>{r.heure}</Box>
            <Box>{r.nbPersonnes}</Box>
            <Box>{tables?.find((t) => t.id === r.tableId)?.numero ?? "-"}</Box>
            <Box>
              <Button
                size="small"
                variant="outlined"
                onClick={() => onViewReservation(r)}
              >
                Voir
              </Button>
            </Box>
          </Box>
        ))}
      </Paper>
    </Box>
  );
}

function NewReservationForm({ 
  mode, 
  selectedReservation,
  onDelete 
}: { 
  mode: ReservationMode;
  selectedReservation: Reservation | null;
  onDelete: () => void;
}) {
  const createClient = useCreateClient();
  const createResa = useCreateRestoReservation();
  const updateResa = useUpdateRestoReservation();
  const deleteResa = useDeleteRestoReservation();
  const { data: tables } = useTables();
  const { data: clients } = useClients();
  
  const [form, setForm] = useState({
    nom: "",
    telephone: "",
    date: format(new Date(), "yyyy-MM-dd"),
    heure: "19:00",
    nb: 4,
    table: "",
  });

  // Synchroniser le formulaire quand une réservation est sélectionnée
  useEffect(() => {
    if (mode === "view" && selectedReservation) {
      const client = clients?.find((c) => c.id === selectedReservation.clientId);
      setForm({
        nom: client?.nom || "",
        telephone: client?.telephone || "",
        date: selectedReservation.dateDebut 
          ? format(new Date(selectedReservation.dateDebut), "yyyy-MM-dd") 
          : format(new Date(), "yyyy-MM-dd"),
        heure: selectedReservation.heure || "19:00",
        nb: selectedReservation.nbPersonnes || 4,
        table: selectedReservation.tableId || "",
      });
    } else if (mode === "new") {
      // Réinitialiser pour une nouvelle réservation
      setForm({
        nom: "",
        telephone: "",
        date: format(new Date(), "yyyy-MM-dd"),
        heure: "19:00",
        nb: 4,
        table: "",
      });
    }
  }, [mode, selectedReservation, clients]);

  async function save() {
    if (mode === "view" && selectedReservation) {
      // Mode édition: mettre à jour la réservation existante
      const date = new Date(form.date + "T" + form.heure + ":00");
      await updateResa.mutateAsync({
        id: selectedReservation.id,
        dateDebut: date.toISOString(),
        heure: form.heure,
        nbPersonnes: form.nb,
        tableId: form.table || undefined,
      });
      // Mettre à jour le client si nécessaire (pour l'instant on ne gère pas ça)
    } else {
      // Mode création: créer une nouvelle réservation
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
  }
  
  async function handleDelete() {
    if (selectedReservation) {
      await deleteResa.mutateAsync({ id: selectedReservation.id });
      onDelete();
    }
  }

  return (
    <Box id="new-resa" sx={{ mt: 3 }}>
      <Paper sx={{ p: 2 }}>
        <Typography fontWeight={800} mb={2}>
          Détails Réservation
        </Typography>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={1}
          sx={{
            "& .MuiTextField-root": { flex: 1, minWidth: 180 },
            flexWrap: "wrap",
          }}
        >
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
          sx={{
            mt: 1,
            "& .MuiTextField-root": { flex: 1, minWidth: 160 },
            flexWrap: "wrap",
          }}
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
          <Button 
            variant="contained" 
            onClick={save}
            disabled={createResa.isPending || updateResa.isPending}
          >
            {mode === "view" ? "Mettre à jour" : "Enregistrer"}
          </Button>
          {/* Afficher le bouton Supprimer uniquement en mode "view" (réservation existante) */}
          {mode === "view" && selectedReservation && (
            <Button 
              variant="contained" 
              color="error"
              onClick={handleDelete}
              disabled={deleteResa.isPending}
            >
              Supprimer
            </Button>
          )}
        </Stack>
      </Paper>
    </Box>
  );
}
