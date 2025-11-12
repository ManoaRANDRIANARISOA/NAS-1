import {
  Box,
  Button,
  Chip,
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
import { useMemo, useState, useEffect, Fragment } from "react";
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
// Modals latéraux retirés selon demande
import { format } from "date-fns";

type ReservationMode = "new" | "view" | null;

export default function RestoPlan() {
  const { data: tables } = useTables();
  const todayRes = useTodayRestoReservations();
  // Drawer/modal latéral retiré
  const end = useEndOfService();

  const [service, setService] = useState<"today" | "dej" | "diner">("today");
  const [cap, setCap] = useState<"all" | "2" | "4p">("all");
  
  // État pour gérer le mode de réservation (nouvelle ou vue d'une existante)
  const [reservationMode, setReservationMode] = useState<ReservationMode>(null);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);

  // Pré-remplissage du formulaire lors d'un clic dans la vue journalière
  const [initialNewHour, setInitialNewHour] = useState<string | undefined>();
  const [initialNewTableId, setInitialNewTableId] = useState<string | undefined>();
  function setInitialNew(payload: { heure?: string; tableId?: string }) {
    setInitialNewHour(payload.heure);
    setInitialNewTableId(payload.tableId);
  }

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

  // const selectedReservationId = selected?.assignedReservationId ?? ""; // retiré

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
        <Box>
          <Typography variant="h4" fontWeight={800}>
            Plan de salle
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Total couverts: {(tables ?? []).reduce((sum, t) => sum + (t.capacite || 0), 0)}
          </Typography>
        </Box>
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

      {/* Vue journalière des disponibilités */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography fontWeight={800} mb={1}>Disponibilités — Vue journalière</Typography>
        {filteredTables.length === 0 && (
          <Typography color="text.secondary">Aucune table pour ce filtre</Typography>
        )}
        {filteredTables.length > 0 && (
          <Box sx={{ display: 'grid', gridTemplateColumns: `140px repeat(${12}, 1fr)`, gap: 0.5 }}>
            <Box />
            {Array.from({ length: 12 }, (_, i) => `${String(i + 10).padStart(2, '0')}:00`).map((h) => (
              <Box key={h} sx={{ textAlign: 'center', fontSize: '0.75rem', color: 'text.secondary' }}>{h}</Box>
            ))}
            {filteredTables.map((t) => (
              <Fragment key={t.id}>
                <Box sx={{ py: 0.5, fontWeight: 700 }}>
                  {t.numero}
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    {t.capacite} pers · {t.emplacement || 'Intérieur'}
                  </Typography>
                </Box>
                {Array.from({ length: 12 }, (_, i) => `${String(i + 10).padStart(2, '0')}:00`).map((h) => {
                  const res = (todayRes.data ?? []).find((r) => r.tableId === t.id && (r.heure || "").startsWith(h));
                  const status: 'libre' | 'reservee' | 'occupee' = res
                    ? (res.statut === 'arrivee' ? 'occupee' : 'reservee')
                    : 'libre';
                  const bg = status === 'libre' ? '#FFFFFF' : status === 'reservee' ? '#66BB6A' : '#EF5350';
                  const label = res
                    ? (status === 'occupee' ? `Depuis ${res.heure}` : `Réservé ${res.heure}`)
                    : '';
                  return (
                    <Box
                      key={`${t.id}-${h}`}
                      onClick={() => {
                        if (res) {
                          setReservationMode('view');
                          setSelectedReservation(res);
                        } else {
                          setReservationMode('new');
                          setSelectedReservation(null);
                          setInitialNew({ heure: h, tableId: t.id });
                        }
                        document.getElementById('new-resa')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      sx={{
                        height: 34,
                        border: '1px solid',
                        borderColor: 'divider',
                        bgcolor: bg,
                        cursor: 'pointer',
                        '&:hover': { opacity: 0.88 }
                      }}
                    >
                      {!!label && (
                        <Typography variant="caption" sx={{ px: 0.5, color: status === 'libre' ? 'text.secondary' : 'common.white' }}>
                          {label}
                        </Typography>
                      )}
                    </Box>
                  );
                })}
              </Fragment>
            ))}
          </Box>
        )}
        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
          <Chip size="small" label="Libre" variant="outlined" sx={{ bgcolor: '#FFFFFF' }} />
          <Chip size="small" label="Réservée" color="success" variant="outlined" />
          <Chip size="small" label="Occupée" color="error" variant="outlined" />
        </Stack>
      </Paper>

      <Grid container spacing={2}>
        {filteredTables.map((t) => (
          <Grid item key={t.id} xs={6} sm={4} md={3} lg={2}>
            <Paper sx={{ p: 2 }}>
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
        initialHour={initialNewHour}
        initialTableId={initialNewTableId}
      />

      {/* Drawer et modals supprimés pour une interface simplifiée */}
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
  onDelete,
  initialHour,
  initialTableId
}: { 
  mode: ReservationMode;
  selectedReservation: Reservation | null;
  onDelete: () => void;
  initialHour?: string;
  initialTableId?: string;
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

  const todayStr = format(new Date(), "yyyy-MM-dd");
  const nowStr = format(new Date(), "HH:mm");

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
        heure: initialHour || "19:00",
        nb: 4,
        table: initialTableId || "",
      });
    }
  }, [mode, selectedReservation, clients, initialHour, initialTableId]);

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
            type="time"
            label="Heure"
            value={form.heure}
            onChange={(e) => setForm({ ...form, heure: e.target.value })}
            inputProps={{ step: 300, min: form.date === todayStr ? nowStr : undefined }}
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
                  {t.numero} — {t.capacite} pers · {t.emplacement || 'Intérieur'}
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
