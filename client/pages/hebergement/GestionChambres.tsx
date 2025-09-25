import { Box, Button, Chip, Grid, Paper, Stack, Typography, List, ListItemButton, ListItemText, Drawer, Divider } from "@mui/material";
import { addDays, format, startOfMonth } from "date-fns";
import { useMemo, useState } from "react";
import { chambres, reservations } from "@/services/mock";
import { Reservation } from "@shared/api";

function PlanningMensuel() {
  const base = startOfMonth(new Date());
  const days = Array.from({ length: 14 }).map((_, i) => addDays(base, i));
  function cell(r: Reservation, d: Date) {
    if (r.type !== "hebergement" || !r.chambreId) return false;
    const debut = new Date(r.dateDebut);
    const fin = new Date(r.dateFin || r.dateDebut);
    return d >= debut && d < fin;
  }
  return (
    <Box>
      <Box sx={{ display: "grid", gridTemplateColumns: `160px repeat(${days.length}, 1fr)`, gap: 1, px: 1 }}>
        <Box />
        {days.map((d) => (
          <Box key={d.toISOString()} sx={{ textAlign: "center", color: "text.secondary" }}>{format(d, "d")}</Box>
        ))}
        {chambres.map((c) => (
          <>
            <Box key={c.id} sx={{ py: 1, fontWeight: 700 }}>{c.numero}<Typography variant="caption" sx={{ display: 'block' }} color="text.secondary">{c.categorie}</Typography></Box>
            {days.map((d, idx) => (
              <Box key={`${c.id}-${idx}`} sx={{ height: 28, borderRadius: 1, bgcolor: (() => {
                const r = reservations.find((rr) => rr.type === 'hebergement' && rr.chambreId === c.id);
                if (!r) return "transparent";
                return cell(r, d) ? "#FCE8C7" : "transparent";
              })(), border: "1px dashed", borderColor: "divider" }} />
            ))}
          </>
        ))}
      </Box>
      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
        <Legend color="#81C784" label="Libre" />
        <Legend color="#FCE8C7" label="Réservée" />
        <Legend color="#FFD54F" label="En nettoyage" />
        <Legend color="#BDBDBD" label="Hors service" />
      </Stack>
    </Box>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: color }} />
      <Typography variant="caption">{label}</Typography>
    </Stack>
  );
}

export default function GestionChambres() {
  const list = useMemo(() => reservations.filter((r) => r.type === 'hebergement'), []);
  const [open, setOpen] = useState<Reservation | null>(null);

  return (
    <Box>
      <Typography variant="h4" fontWeight={800} mb={2}>Hébergement — Gestion des chambres</Typography>

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
              <Chip size="small" label="Mensuel" color="primary" />
              <Chip size="small" label="Hebdo" variant="outlined" />
              <Chip size="small" label="Jour" variant="outlined" />
              <Chip size="small" label="Aujourd'hui" variant="outlined" />
            </Stack>
            <PlanningMensuel />
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
              <Typography fontWeight={800}>Réservations — Liste</Typography>
              <Stack direction="row" spacing={1}>
                <Button variant="outlined">Export</Button>
                <Button variant="contained">Nouvelle réservation</Button>
              </Stack>
            </Stack>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 140px 140px 140px 120px 100px', px: 1, py: 1, color: 'text.secondary', fontWeight: 700 }}>
              <Box>Client</Box><Box>Arrivée</Box><Box>Départ</Box><Box>Chambre</Box><Box>Statut</Box><Box>Action</Box>
            </Box>
            {list.map((r) => (
              <Box key={r.id} sx={{ display: 'grid', gridTemplateColumns: '1fr 140px 140px 140px 120px 100px', px: 1, py: 1, alignItems: 'center', borderTop: '1px solid', borderColor: 'divider' }}>
                <Box>{r.clientId}</Box>
                <Box>{format(new Date(r.dateDebut), 'dd/MM/yyyy')}</Box>
                <Box>{r.dateFin ? format(new Date(r.dateFin), 'dd/MM/yyyy') : '-'}</Box>
                <Box>{chambres.find((c) => c.id === r.chambreId)?.numero ?? '-'}</Box>
                <Box>{r.statut}</Box>
                <Box><Button size="small" variant="outlined" onClick={() => setOpen(r)}>Voir</Button></Box>
              </Box>
            ))}
          </Paper>
        </Grid>
      </Grid>

      <Drawer anchor="right" open={!!open} onClose={() => setOpen(null)}>
        <Box sx={{ width: 420, p: 2 }}>
          <Typography variant="h6" fontWeight={800}>Réservation</Typography>
          <Divider sx={{ my: 1 }} />
          {!open && <Typography color="text.secondary">Sélectionnez une réservation</Typography>}
          {open && (
            <Stack spacing={1}>
              <Typography fontWeight={700}>{open.clientId} · {chambres.find(c=>c.id===open.chambreId)?.numero}</Typography>
              <Typography variant="body2" color="text.secondary">Arrivée: {format(new Date(open.dateDebut),'dd/MM/yyyy')} · Départ: {open.dateFin?format(new Date(open.dateFin),'dd/MM/yyyy'):'-'}</Typography>
              <Chip size="small" label={open.statut} />
              <Divider />
              <Typography fontWeight={700}>Facture liée</Typography>
              <Box sx={{ display:'grid', gridTemplateColumns:'1fr 60px 60px 60px', gap:1, fontSize:14 }}>
                <Box>Date</Box><Box>Qté</Box><Box>Prix</Box><Box>Total</Box>
                <Box>Nuitée</Box><Box>1</Box><Box>120€</Box><Box>120€</Box>
                <Box>Petit-déj.</Box><Box>2</Box><Box>8€</Box><Box>16€</Box>
              </Box>
              <Typography sx={{ mt: 1 }}><b>Total:</b> 136€</Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                <Button variant="outlined">Imprimer</Button>
                <Button variant="contained">Éditer la facture</Button>
              </Stack>
            </Stack>
          )}
        </Box>
      </Drawer>
    </Box>
  );
}
