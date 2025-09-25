import { Box, Paper, Stack, TextField, Typography } from "@mui/material";
import { chambres } from "@/services/mock";
import { useState } from "react";

export default function HebergementTarifs() {
  const [rows, setRows] = useState(chambres.map(c => ({ id:c.id, numero:c.numero, categorie:c.categorie, tarif:c.tarif_base })));
  function update(id:string, tarif:number){ setRows(rs => rs.map(r => r.id===id? {...r, tarif}: r)); }
  return (
    <Box>
      <Typography variant="h4" fontWeight={800} mb={2}>Hébergement — Tarifs</Typography>
      <Paper sx={{ p:2 }}>
        <Box sx={{ display:'grid', gridTemplateColumns:'120px 1fr 160px', px:1, py:1, color:'text.secondary', fontWeight:700 }}>
          <Box>Chambre</Box><Box>Catégorie</Box><Box>Tarif base (Ar)</Box>
        </Box>
        {rows.map(r => (
          <Box key={r.id} sx={{ display:'grid', gridTemplateColumns:'120px 1fr 160px', px:1, py:1, borderTop:'1px solid', borderColor:'divider', alignItems:'center' }}>
            <Box>{r.numero}</Box>
            <Box>{r.categorie}</Box>
            <TextField size="small" type="number" value={r.tarif} onChange={(e)=> update(r.id, parseInt(e.target.value||'0',10))} />
          </Box>
        ))}
      </Paper>
    </Box>
  );
}
