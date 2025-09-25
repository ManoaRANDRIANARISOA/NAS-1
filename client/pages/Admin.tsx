import { Box, Button, Chip, Paper, Stack, TextField, Typography } from "@mui/material";

export default function AdminPage(){
  return (
    <Box>
      <Typography variant="h4" fontWeight={800} mb={2}>Gestion / Admin</Typography>
      <Paper sx={{ p:2, mb:2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb:1 }}>
          <Typography fontWeight={700}>Comptes du staff</Typography>
          <Button variant="contained">Créer un compte</Button>
        </Stack>
        <Box sx={{ display:'grid', gridTemplateColumns:'1fr 160px 160px', px:1, py:1, color:'text.secondary', fontWeight:700 }}>
          <Box>Nom</Box><Box>Identifiant</Box><Box>Rôle</Box>
        </Box>
        {[{n:'Andry',l:'andry',r:'chef_salle'},{n:'Hanitra',l:'hani',r:'economat'}].map((u,i)=> (
          <Box key={i} sx={{ display:'grid', gridTemplateColumns:'1fr 160px 160px', px:1, py:1, borderTop:'1px solid', borderColor:'divider' }}>
            <Box>{u.n}</Box><Box>{u.l}</Box><Box><Chip size="small" label={u.r} /></Box>
          </Box>
        ))}
      </Paper>
      <Paper sx={{ p:2 }}>
        <Typography fontWeight={700} mb={1}>Rôles et permissions</Typography>
        <Box sx={{ display:'grid', gridTemplateColumns:'200px 1fr', rowGap:1, columnGap:2 }}>
          <Typography fontWeight={700}>Économe</Typography><Typography>Accès au Stock uniquement</Typography>
          <Typography fontWeight={700}>Chef resto</Typography><Typography>Réservations resto + Plan de salle</Typography>
          <Typography fontWeight={700}>Admin</Typography><Typography>Tous les modules</Typography>
        </Box>
      </Paper>
    </Box>
  );
}
