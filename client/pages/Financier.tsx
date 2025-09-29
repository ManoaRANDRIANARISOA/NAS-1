import { Add } from "@mui/icons-material";
import {
  Box,
  Button,
  Chip,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useMemo, useState } from "react";
import {
  useCreateFacture,
  useFactures,
  useUpdateFacture,
} from "@/services/api";
import { Facture } from "@shared/api";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  LineChart,
  Line,
} from "recharts";

const occData = [
  { name: "ch1", value: 80 },
  { name: "ch2", value: 65 },
  { name: "ch3", value: 92 },
  { name: "ch4", value: 74 },
];
const restoResa = [
  { name: "L", v: 12 },
  { name: "M", v: 16 },
  { name: "M ", v: 10 },
  { name: "J", v: 8 },
  { name: "V", v: 20 },
  { name: "S", v: 25 },
  { name: "D", v: 14 },
];

function statutChip(s: Facture["statut"]) {
  if (s === "payee") return <Chip size="small" color="success" label="Payée" />;
  if (s === "annulee")
    return <Chip size="small" color="default" label="Annulée" />;
  return <Chip size="small" color="warning" label="Envoyée" />;
}

export default function Financier() {
  const { data: factures } = useFactures();
  const create = useCreateFacture();
  const update = useUpdateFacture();

  const [q, setQ] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);

  const list = useMemo(
    () =>
      (factures || []).filter(
        (f) =>
          f.clientNom.toLowerCase().includes(q.toLowerCase()) ||
          f.numero.toLowerCase().includes(q.toLowerCase()),
      ),
    [factures, q],
  );

  const selected = list.find((f) => f.id === selectedId) || list[0] || null;

  const [draft, setDraft] = useState({
    clientNom: "",
    source: "Hebergement" as Facture["source"],
    description: "Nuitée",
    qte: 1,
    pu: 100000,
  });

  function createNow() {
    if (!draft.clientNom) return;
    create.mutate({
      clientNom: draft.clientNom,
      date: new Date().toISOString(),
      source: draft.source,
      lignes: [
        { description: draft.description, qte: draft.qte, pu: draft.pu },
      ],
      statut: "emisee",
    });
    setShowNew(false);
    setDraft({
      clientNom: "",
      source: "Hebergement",
      description: "Nuitée",
      qte: 1,
      pu: 100000,
    });
  }

  const ttc30 = (factures || []).reduce((s, f) => s + f.totalTTC, 0);
  const payees = (factures || [])
    .filter((f) => f.statut === "payee")
    .reduce((s, f) => s + f.totalTTC, 0);
  const enRetard = (factures || [])
    .filter((f) => f.statut === "emisee")
    .reduce((s, f) => s + f.totalTTC, 0);

  return (
    <Box>
      <Typography variant="h4" fontWeight={800} mb={2}>
        Financier
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography fontWeight={700} mb={1}>
              Filtres
            </Typography>
            <TextField
              size="small"
              placeholder="Rechercher une facture, client, réf..."
              fullWidth
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap" }}>
              <Chip size="small" label="Brouillon" variant="outlined" />
              <Chip size="small" label="Envoyée" variant="outlined" />
              <Chip size="small" label="Payée" variant="outlined" />
              <Chip size="small" label="En retard" variant="outlined" />
            </Stack>
          </Paper>
          <Paper sx={{ p: 2 }}>
            <Typography fontWeight={700} mb={1}>
              Actions rapides
            </Typography>
            <Stack spacing={1}>
              <Button
                startIcon={<Add />}
                variant="contained"
                onClick={() => setShowNew(true)}
              >
                Nouvelle facture
              </Button>
              <Button variant="outlined">Exporter PDF</Button>
              <Button variant="outlined">Relancer impayés</Button>
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} md={9}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: "wrap" }}>
              <Chip label={`Total (30j) ${ttc30.toLocaleString()} Ar`} />
              <Chip
                label={`Payées ${payees.toLocaleString()} Ar`}
                color="success"
              />
              <Chip
                label={`En attente ${enRetard.toLocaleString()} Ar`}
                color="warning"
              />
              {create.isPending && <Chip label="Enregistrement..." />}
            </Stack>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 160px 140px 120px",
                px: 1,
                py: 1,
                color: "text.secondary",
                fontWeight: 700,
              }}
            >
              <Box>Facture</Box>
              <Box>Date</Box>
              <Box>Montant</Box>
              <Box>Statut</Box>
            </Box>
            {list.map((f) => (
              <Box
                key={f.id}
                onClick={() => setSelectedId(f.id)}
                sx={{
                  cursor: "pointer",
                  display: "grid",
                  gridTemplateColumns: "1fr 160px 140px 120px",
                  px: 1,
                  py: 1,
                  borderTop: "1px solid",
                  borderColor: "divider",
                  alignItems: "center",
                  bgcolor: selected?.id === f.id ? "action.hover" : undefined,
                }}
              >
                <Box>
                  <Typography fontWeight={700}>{f.numero}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {f.clientNom} · {f.source}
                  </Typography>
                </Box>
                <Box>{new Date(f.date).toLocaleDateString()}</Box>
                <Box>{f.totalTTC.toLocaleString()} Ar</Box>
                <Box>{statutChip(f.statut)}</Box>
              </Box>
            ))}
          </Paper>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography fontWeight={700} mb={1}>
              Détail facture sélectionnée
            </Typography>
            {!selected && (
              <Typography color="text.secondary">
                Sélectionnez une facture
              </Typography>
            )}
            {selected && (
              <>
                <Stack
                  direction={{ xs: "column", md: "row" }}
                  spacing={2}
                  sx={{ mb: 1 }}
                >
                  <TextField
                    size="small"
                    label="Numéro"
                    value={selected.numero}
                    InputProps={{ readOnly: true }}
                  />
                  <TextField
                    size="small"
                    label="Date"
                    value={new Date(selected.date).toLocaleDateString()}
                    InputProps={{ readOnly: true }}
                  />
                  <TextField
                    size="small"
                    label="Client"
                    value={selected.clientNom}
                    InputProps={{ readOnly: true }}
                  />
                  <TextField
                    size="small"
                    label="Source"
                    value={selected.source}
                    InputProps={{ readOnly: true }}
                  />
                </Stack>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "1fr 80px 100px 120px",
                    px: 1,
                    py: 1,
                    color: "text.secondary",
                    fontWeight: 700,
                  }}
                >
                  <Box>Article</Box>
                  <Box>Qté</Box>
                  <Box>Prix</Box>
                  <Box>Total</Box>
                </Box>
                {selected.lignes.map((l, i) => (
                  <Box
                    key={i}
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "1fr 80px 100px 120px",
                      px: 1,
                      py: 1,
                      borderTop: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Box>{l.description}</Box>
                    <Box>{l.qte}</Box>
                    <Box>{l.pu.toLocaleString()} Ar</Box>
                    <Box>{(l.qte * l.pu).toLocaleString()} Ar</Box>
                  </Box>
                ))}
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ mt: 1 }}
                >
                  <Chip
                    label={`Total ${selected.totalTTC.toLocaleString()} Ar`}
                    color="primary"
                  />
                  {selected.statut === "emisee" && (
                    <Button
                      variant="contained"
                      onClick={() =>
                        update.mutate({ id: selected.id, statut: "payee" })
                      }
                    >
                      Marquer comme payée
                    </Button>
                  )}
                </Stack>
              </>
            )}
          </Paper>
          <Paper sx={{ p: 2 }}>
            <Typography fontWeight={700} mb={1}>
              Rapports
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  Réservations resto (7j)
                </Typography>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={restoResa}>
                    <XAxis dataKey="name" />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="v"
                      stroke="#6E8EF5"
                      strokeWidth={3}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  Taux d’occupation par chambre
                </Typography>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={occData}>
                    <XAxis dataKey="name" />
                    <Tooltip />
                    <Bar dataKey="value" fill="#81C784" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  Revenus par activité
                </Typography>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={(factures || []).reduce((acc: any[], f) => {
                    const k = f.source;
                    const i = acc.findIndex((x) => x.name === k);
                    if (i >= 0) acc[i].v += f.totalTTC; else acc.push({ name: k, v: f.totalTTC });
                    return acc;
                  }, [])}>
                    <XAxis dataKey="name" />
                    <Tooltip formatter={(v: any) => `${Number(v).toLocaleString()} Ar`} />
                    <Bar dataKey="v" fill="#6E8EF5" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {showNew && (
        <Paper
          sx={{
            p: 2,
            position: "fixed",
            right: 16,
            bottom: 16,
            width: { xs: "90%", md: 420 },
            zIndex: 50,
          }}
          elevation={6}
        >
          <Typography fontWeight={700} mb={1}>
            Créer une facture
          </Typography>
          <Stack spacing={1}>
            <TextField
              size="small"
              label="Client"
              value={draft.clientNom}
              onChange={(e) =>
                setDraft((d) => ({ ...d, clientNom: e.target.value }))
              }
            />
            <TextField
              size="small"
              label="Source"
              value={draft.source}
              onChange={(e) =>
                setDraft((d) => ({ ...d, source: e.target.value as any }))
              }
            />
            <TextField
              size="small"
              label="Article"
              value={draft.description}
              onChange={(e) =>
                setDraft((d) => ({ ...d, description: e.target.value }))
              }
            />
            <Stack direction="row" spacing={1}>
              <TextField
                size="small"
                type="number"
                label="Qté"
                value={draft.qte}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    qte: parseInt(e.target.value || "0", 10),
                  }))
                }
              />
              <TextField
                size="small"
                type="number"
                label="Prix"
                value={draft.pu}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    pu: parseInt(e.target.value || "0", 10),
                  }))
                }
              />
            </Stack>
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Button variant="text" onClick={() => setShowNew(false)}>
                Annuler
              </Button>
              <Button variant="contained" onClick={createNow}>
                Enregistrer
              </Button>
            </Stack>
          </Stack>
        </Paper>
      )}
    </Box>
  );
}
