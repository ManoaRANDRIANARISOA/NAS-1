import { Box, Button, Chip, Grid, Paper, Stack, Typography, Drawer, Divider, Select, MenuItem, TextField, Card, CardContent } from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { addDays, addHours, eachDayOfInterval, endOfMonth, endOfWeek, format, getISOWeek, isWithinInterval, setHours, startOfDay, startOfMonth, startOfWeek } from "date-fns";
import { fr } from "date-fns/locale";
import { useMemo, useState, Fragment } from "react";
import { chambres as chambresData } from "@/services/mock";
import { useHebergementReservations, useUpdateHebergementReservation } from "@/services/api";
import { Reservation } from "@shared/api";

type View = "month" | "week" | "day";

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Box 
        sx={{ 
          width: 10, 
          height: 10, 
          borderRadius: '50%', 
          bgcolor: color,
          border: color === '#FFFFFF' ? '1px solid #ccc' : 'none'
        }} 
      />
      <Typography variant="caption">{label}</Typography>
    </Stack>
  );
}

function reservationColor(r?: Reservation) {
  if (!r) return "#FFFFFF"; // libre - blanc
  if (r.statut === "arrivee") return "#EF5350"; // occupée - rouge
  return "#66BB6A"; // réservée - vert
}

function roomStatusColor(statut: string) {
  if (statut === "maintenance") return "#9E9E9E"; // hors service - gris
  return "#FFFFFF"; // libre si pas de resa - blanc
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

function Calendar({ view, dateRef, statusFilter }: { view: View; dateRef: Date; statusFilter: "all" | "libre" | "reservee" | "occupee" | "maintenance"; }) {
  const { data: res } = useHebergementReservations();
  const range = intervalFor(view, dateRef);

  function roomDerivedStatus(roomId: string) {
    const room = chambresData.find(c=>c.id===roomId)!;
    if (room.statut === "maintenance") return "maintenance" as const;
    const has = (res || []).some(r => r.type==='hebergement' && r.chambreId===roomId && isWithinInterval(new Date(r.dateDebut), range));
    if (has) return "reservee" as const;
    return "libre" as const;
  }

  const rooms = chambresData.filter(c => statusFilter === 'all' ? true : roomDerivedStatus(c.id) === statusFilter);

  function hasReservation(cId: string, dStart: Date, dEnd: Date) {
    // Vérifie si une réservation chevauche la période demandée
    const r = (res || []).find(rr => {
      if (rr.type !== 'hebergement' || rr.chambreId !== cId) return false;
      const resDebut = new Date(rr.dateDebut);
      const resFin = rr.dateFin ? new Date(rr.dateFin) : addDays(resDebut, 1);
      // Vérifie si les intervalles se chevauchent
      return resDebut < dEnd && resFin > dStart;
    });
    return r;
  }

  if (view === 'month') {
    const start = startOfMonth(dateRef);
    const end = endOfMonth(dateRef);
    const days = eachDayOfInterval({ start, end });
    return (
      <Box sx={{ overflowX: 'auto', overflowY: 'visible' }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: `60px repeat(${days.length}, minmax(32px, 1fr))`, gap: 0.5, alignItems: 'center', minWidth: 'max-content' }}>
          <Box sx={{ position: 'sticky', left: 0, bgcolor: 'background.paper', zIndex: 2 }} />
          {days.map((d)=> (
            <Box key={d.toISOString()} sx={{ textAlign:'center', fontSize: '0.75rem', fontWeight: 600, color:'text.secondary', py: 0.5 }}>
              {format(d,'d')}
            </Box>
          ))}
          {rooms.map((c)=> (
            <Fragment key={c.id}>
              <Box sx={{ position: 'sticky', left: 0, bgcolor: 'background.paper', zIndex: 2, py: 0.5, pr: 1, borderTop: '1px solid', borderColor: 'divider' }}>
                <Typography variant="body2" fontWeight={700}>{c.numero}</Typography>
                <Typography variant="caption" color="text.secondary">{c.categorie}</Typography>
              </Box>
              {days.map((d,i)=> {
                const r = hasReservation(c.id, d, addDays(d,1));
                return (
                  <Box 
                    key={`${c.id}-${i}`} 
                    sx={{ 
                      aspectRatio: '1/1',
                      minHeight: 32,
                      bgcolor: r ? reservationColor(r) : roomStatusColor(c.statut),
                      border: '1px solid',
                      borderColor: 'divider',
                      '&:hover': { opacity: 0.8, cursor: 'pointer' }
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

  if (view === 'week') {
    const start = startOfWeek(dateRef, { weekStartsOn: 1 });
    const days = Array.from({length:7}).map((_,i)=> addDays(start,i));
    return (
      <Box sx={{ overflowX: 'auto', overflowY: 'visible' }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: `60px repeat(7, minmax(80px, 1fr))`, gap: 0.5, alignItems: 'center', minWidth: 'max-content' }}>
          <Box sx={{ position: 'sticky', left: 0, bgcolor: 'background.paper', zIndex: 2 }} />
          {days.map((d)=> (
            <Box key={d.toISOString()} sx={{ textAlign:'center', fontSize: '0.75rem', fontWeight: 600, color:'text.secondary', py: 0.5 }}>
              {format(d,'EEE d', { locale: fr })}
            </Box>
          ))}
          {rooms.map((c)=> (
            <Fragment key={c.id}>
              <Box sx={{ position: 'sticky', left: 0, bgcolor: 'background.paper', zIndex: 2, py: 0.5, pr: 1, borderTop: '1px solid', borderColor: 'divider' }}>
                <Typography variant="body2" fontWeight={700}>{c.numero}</Typography>
                <Typography variant="caption" color="text.secondary">{c.categorie}</Typography>
              </Box>
              {days.map((d,i)=> {
                const r = hasReservation(c.id, d, addDays(d,1));
                return (
                  <Box 
                    key={`${c.id}-${i}`} 
                    sx={{ 
                      aspectRatio: '1/1',
                      minHeight: 48,
                      bgcolor: r ? reservationColor(r) : roomStatusColor(c.statut),
                      border: '1px solid',
                      borderColor: 'divider',
                      '&:hover': { opacity: 0.8, cursor: 'pointer' }
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

  // day view: 24 hours
  const start = startOfDay(dateRef);
  const hours = Array.from({length:24}).map((_,i)=> setHours(start, i));
  return (
    <Box sx={{ overflowX: 'auto', overflowY: 'visible' }}>
      <Box sx={{ display:'grid', gridTemplateColumns:`60px repeat(24, minmax(40px, 1fr))`, gap: 0.5, alignItems: 'center', minWidth: 'max-content' }}>
        <Box sx={{ position: 'sticky', left: 0, bgcolor: 'background.paper', zIndex: 2 }} />
        {hours.map((h,i)=> (
          <Box key={i} sx={{ textAlign:'center', fontSize: '0.7rem', fontWeight: 600, color:'text.secondary', py: 0.5 }}>
            {format(h,'HH')}
          </Box>
        ))}
        {rooms.map((c)=> (
          <Fragment key={c.id}>
            <Box sx={{ position: 'sticky', left: 0, bgcolor: 'background.paper', zIndex: 2, py: 0.5, pr: 1, borderTop: '1px solid', borderColor: 'divider' }}>
              <Typography variant="body2" fontWeight={700}>{c.numero}</Typography>
              <Typography variant="caption" color="text.secondary">{c.categorie}</Typography>
            </Box>
            {hours.map((h,i)=> {
              const r = hasReservation(c.id, h, addHours(h,1));
              return (
                <Box 
                  key={`${c.id}-${i}`} 
                  sx={{ 
                    aspectRatio: '1/1',
                    minHeight: 32,
                    bgcolor: r ? reservationColor(r) : roomStatusColor(c.statut),
                    border: '1px solid',
                    borderColor: 'divider',
                    '&:hover': { opacity: 0.8, cursor: 'pointer' }
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
  const [open, setOpen] = useState<Reservation | null>(null);
  const [view, setView] = useState<View>('month');
  const [dateRef, setDateRef] = useState<Date>(startOfMonth(new Date()));
  const [statusFilter, setStatusFilter] = useState<"all"|"libre"|"reservee"|"occupee"|"maintenance">('all');

  // Calcul de la chambre la plus occupée (statique pour l'instant, prêt pour données dynamiques)
  const chambresStats = useMemo(() => {
    const stats = chambresData.map(chambre => {
      const reservations = (list || []).filter(r => r.type === 'hebergement' && r.chambreId === chambre.id);
      return {
        chambre: chambre.numero,
        categorie: chambre.categorie,
        totalReservations: reservations.length,
        tauxOccupation: Math.round((reservations.length / 30) * 100) // Simulation
      };
    });
    return stats.sort((a, b) => b.totalReservations - a.totalReservations);
  }, [list]);

  function label() {
    if (view==='month') {
      const formatted = format(dateRef, 'LLLL yyyy', { locale: fr });
      return formatted.charAt(0).toUpperCase() + formatted.slice(1);
    }
    if (view==='week') return `Semaine ${getISOWeek(dateRef)}`;
    const formatted = format(dateRef, 'dd LLLL yyyy', { locale: fr });
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  }

  return (
    <Box>
      <Typography variant="h4" fontWeight={800} mb={2}>Hébergement — Gestion des chambres</Typography>

      {/* Statistique chambre la plus occupée */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'primary.50', border: '1px solid', borderColor: 'primary.200' }}>
            <CardContent>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <TrendingUpIcon color="primary" fontSize="small" />
                <Typography variant="caption" fontWeight={700} color="primary.main">
                  Chambre la plus occupée
                </Typography>
              </Stack>
              {chambresStats[0] && (
                <>
                  <Typography variant="h4" fontWeight={800}>
                    {chambresStats[0].chambre}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    {chambresStats[0].categorie}
                  </Typography>
                  <Typography variant="body2" fontWeight={700} color="primary.main" sx={{ mt: 0.5 }}>
                    {chambresStats[0].tauxOccupation}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Taux d'occupation
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Calendrier */}
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Stack direction={{ xs:'column', md:'row' }} spacing={1} justifyContent="space-between" sx={{ mb: 1 }}>
              <Stack direction="row" spacing={1}>
                <Chip size="small" label="Mensuel" color={view==='month'? 'primary':'default'} variant={view==='month'? 'filled':'outlined'} onClick={()=>setView('month')} />
                <Chip size="small" label="Hebdo" color={view==='week'? 'primary':'default'} variant={view==='week'? 'filled':'outlined'} onClick={()=>setView('week')} />
                <Chip size="small" label="Jour" color={view==='day'? 'primary':'default'} variant={view==='day'? 'filled':'outlined'} onClick={()=>setView('day')} />
                <Chip size="small" label="Aujourd'hui" variant="outlined" onClick={()=> setDateRef(new Date()) } />
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip size="small" label={label()} />
                <Chip size="small" label="◀" onClick={()=> setDateRef(d=> view==='month'? addDays(d, -30): view==='week'? addDays(d,-7): addDays(d,-1)) } />
                <Chip size="small" label="▶" onClick={()=> setDateRef(d=> view==='month'? addDays(d, 30): view==='week'? addDays(d,7): addDays(d,1)) } />
                <Select size="small" value={statusFilter} onChange={(e)=> setStatusFilter(e.target.value as any)}>
                  <MenuItem value="all">Statut: Tous</MenuItem>
                  <MenuItem value="libre">Libre</MenuItem>
                  <MenuItem value="reservee">Réservée</MenuItem>
                  <MenuItem value="occupee">Occupée</MenuItem>
                  <MenuItem value="maintenance">Hors service</MenuItem>
                </Select>
              </Stack>
            </Stack>
            <Calendar view={view} dateRef={dateRef} statusFilter={statusFilter} />
            <Stack direction="row" spacing={2} sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
              <Legend color="#FFFFFF" label="Libre" />
              <Legend color="#66BB6A" label="Réservée" />
              <Legend color="#EF5350" label="Occupée" />
              <Legend color="#9E9E9E" label="Hors service" />
            </Stack>
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
            {(list || []).map((r) => (
              <Box key={r.id} sx={{ display: 'grid', gridTemplateColumns: '1fr 140px 140px 140px 120px 100px', px: 1, py: 1, alignItems: 'center', borderTop: '1px solid', borderColor: 'divider' }}>
                <Box>{r.clientId}</Box>
                <Box>{format(new Date(r.dateDebut), 'dd/MM/yyyy')}</Box>
                <Box>{r.dateFin ? format(new Date(r.dateFin), 'dd/MM/yyyy') : '-'}</Box>
                <Box>{chambresData.find((c) => c.id === r.chambreId)?.numero ?? '-'}</Box>
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
            <EditReservation r={open} onClose={()=> setOpen(null)} onSave={(p)=> update.mutate(p as any, { onSuccess: ()=> setOpen(null) })} />
          )}
        </Box>
      </Drawer>
    </Box>
  );
}

function Ariary({ value }: { value: number }) {
  return <>{value.toLocaleString('fr-MG')} Ar</>;
}

function EditReservation({ r, onSave, onClose }: { r: Reservation; onSave: (p: Partial<Reservation> & { id: string }) => void; onClose: ()=>void }) {
  const [form, setForm] = useState({
    clientId: r.clientId || '',
    chambreId: r.chambreId || '',
    dateDebut: r.dateDebut,
    dateFin: r.dateFin || '',
    statut: r.statut,
  });
  const [lines, setLines] = useState<{ label: string; qte: number; prix: number }[]>([
    { label: 'Nuitée', qte: 1, prix: 120000 },
    { label: 'Petit-déj.', qte: 2, prix: 8000 },
  ]);
  const total = lines.reduce((a,b)=> a + b.qte*b.prix, 0);

  function changeLine(i:number, key: 'label'|'qte'|'prix', v:any){
    setLines(ls=> ls.map((l,idx)=> idx===i? { ...l, [key]: key==='label'? v : parseInt(v||'0',10)} : l));
  }

  return (
    <Stack spacing={1}>
      <TextField size="small" label="Client" value={form.clientId} onChange={(e)=> setForm({ ...form, clientId: e.target.value })} />
      <Select size="small" value={form.chambreId} onChange={(e)=> setForm({ ...form, chambreId: e.target.value })}>
        {chambresData.map(c=> <MenuItem key={c.id} value={c.id}>{c.numero} · {c.categorie}</MenuItem>)}
      </Select>
      <TextField size="small" type="date" label="Arrivée" value={form.dateDebut.slice(0,10)} onChange={(e)=> setForm({ ...form, dateDebut: new Date(e.target.value).toISOString() })} />
      <TextField size="small" type="date" label="Départ" value={(form.dateFin||'').slice(0,10)} onChange={(e)=> setForm({ ...form, dateFin: new Date(e.target.value).toISOString() })} />
      <Select size="small" value={form.statut} onChange={(e)=> setForm({ ...form, statut: e.target.value as any })}>
        <MenuItem value="en_attente">En attente</MenuItem>
        <MenuItem value="confirmee">Confirmée</MenuItem>
        <MenuItem value="arrivee">Occupée</MenuItem>
        <MenuItem value="terminee">Terminée</MenuItem>
        <MenuItem value="annulee">Annulée</MenuItem>
      </Select>

      <Divider />
      <Typography fontWeight={700}>Facture liée</Typography>
      {lines.map((l,i)=> (
        <Stack key={i} direction="row" spacing={1} alignItems="center">
          <TextField size="small" value={l.label} onChange={e=> changeLine(i,'label', e.target.value)} />
          <TextField size="small" type="number" value={l.qte} onChange={e=> changeLine(i,'qte', e.target.value)} sx={{ width:90 }} />
          <TextField size="small" type="number" value={l.prix} onChange={e=> changeLine(i,'prix', e.target.value)} sx={{ width:120 }} />
          <Typography>= <Ariary value={l.qte*l.prix} /></Typography>
        </Stack>
      ))}
      <Button variant="outlined" onClick={()=> setLines(ls=> [...ls, { label:'Article', qte:1, prix:0 }])}>Ajouter une ligne</Button>
      <Typography><b>Total:</b> <Ariary value={total} /></Typography>

      <Stack direction="row" spacing={1}>
        <Button variant="outlined" onClick={onClose}>Annuler</Button>
        <Button variant="contained" onClick={()=> onSave({ id: r.id, ...form })}>Valider</Button>
      </Stack>
    </Stack>
  );
}
