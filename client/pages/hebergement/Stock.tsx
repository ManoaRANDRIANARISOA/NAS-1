import { Box, Chip, Paper, Stack, TextField, Typography } from "@mui/material";
import { stockProduits } from "@/services/mock";
import { useMemo, useState } from "react";

type Row = { id: string; nom: string; seuilMin: number; stock: number };

function Section({ title, filter }: { title: string; filter: (sous: string) => boolean }) {
  const base = stockProduits.filter(p => p.famille==='Hebergement' && filter(p.sousCategorie));
  const demo: Row[] = [
    { id: 'd1', nom: `${title} — Lot A`, seuilMin: 10, stock: 6 },
    { id: 'd2', nom: `${title} — Lot B`, seuilMin: 5, stock: 12 },
    { id: 'd3', nom: `${title} — Lot C`, seuilMin: 8, stock: 0 },
  ];
  const rows: Row[] = [...base.map(b=> ({ id:b.id, nom:b.nom, seuilMin:b.seuilMin, stock:b.stock })), ...demo];
  const alerts = rows.filter(r => r.stock <= r.seuilMin);
  const [q, setQ] = useState('');
  const [view, setView] = useState<'all'|'low'|'zero'>('all');
  const filtered = useMemo(()=> rows.filter(r => r.nom.toLowerCase().includes(q.toLowerCase())).filter(r => view==='all'? true : view==='low'? r.stock<=r.seuilMin : r.stock===0), [rows, q, view]);
  return (
    <Paper sx={{ p:2 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb:1 }}>
        <Typography fontWeight={800}>{title}</Typography>
        <Stack direction="row" spacing={1}>
          <Chip size="small" label={`Alertes: ${alerts.length}`} color={alerts.length? 'warning':'default'} />
          <Chip size="small" label="Tous" color={view==='all'? 'primary':'default'} variant={view==='all'? 'filled':'outlined'} onClick={()=>setView('all')} />
          <Chip size="small" label="Bas" color={view==='low'? 'primary':'default'} variant={view==='low'? 'filled':'outlined'} onClick={()=>setView('low')} />
          <Chip size="small" label="Rupture" color={view==='zero'? 'primary':'default'} variant={view==='zero'? 'filled':'outlined'} onClick={()=>setView('zero')} />
          <TextField size="small" placeholder="Rechercher" value={q} onChange={e=>setQ(e.target.value)} />
        </Stack>
      </Stack>
      <Box sx={{ display:'grid', gridTemplateColumns:'1fr 120px 120px', px:1, py:1, color:'text.secondary', fontWeight:700 }}>
        <Box>Produit</Box><Box>Seuil</Box><Box>Stock</Box>
      </Box>
      {filtered.map(r => (
        <Box key={r.id} sx={{ display:'grid', gridTemplateColumns:'1fr 120px 120px', px:1, py:1, borderTop:'1px solid', borderColor:'divider', alignItems:'center' }}>
          <Box>{r.nom}</Box><Box>{r.seuilMin}</Box><Box>{r.stock}</Box>
        </Box>
      ))}
    </Paper>
  );
}

export default function HebergementStock() {
  return (
    <Box>
      <Typography variant="h4" fontWeight={800} mb={2}>Hébergement — Stock</Typography>
      <Stack spacing={2}>
        <Section title="Linge" filter={(c)=> c.startsWith('linge')} />
        <Section title="Petit déjeuner" filter={(c)=> c==='petit_dejeuner'} />
      </Stack>
    </Box>
  );
}
