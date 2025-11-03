import { Avatar, Box, Button, Chip, List, ListItemButton, ListItemText, Paper, Stack, TextField, Typography, Grid } from "@mui/material";
import { clients, reservations } from "@/services/mock";
import { useMemo, useState, useEffect } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function HebergementClients() {
  const [q, setQ] = useState("");
  const list = useMemo(() => clients.filter(c => c.nom.toLowerCase().includes(q.toLowerCase())), [q]);
  const [selectedId, setSelectedId] = useState(list[0]?.id || "");
  const selected = list.find(c=>c.id===selectedId) || null;
  const history = useMemo(() => reservations.filter(r => r.clientId===selectedId), [selectedId]);

  // Form state qui se met à jour dynamiquement
  const [formData, setFormData] = useState({
    nom: "",
    type: "",
    email: "",
    telephone: "",
    adresse: "",
    pays: "",
    tags: "",
    reference: ""
  });

  // Mettre à jour le formulaire quand le client sélectionné change
  useEffect(() => {
    if (selected) {
      setFormData({
        nom: selected.nom || "",
        type: selected.type || "",
        email: selected.email || "",
        telephone: selected.telephone || "",
        adresse: selected.adresse || "",
        pays: selected.pays || "Madagascar",
        tags: selected.tags || "",
        reference: selected.reference || ""
      });
    }
  }, [selected]);

  return (
    <Box>
      <Typography variant="h4" fontWeight={800} mb={2}>Hébergement — Clients</Typography>
      <Box sx={{ display:'grid', gridTemplateColumns:{ xs:'1fr', md:'320px 1fr'}, gap:2 }}>
        <Paper sx={{ p:2 }}>
          <TextField size="small" placeholder="Rechercher un client" value={q} onChange={e=>setQ(e.target.value)} fullWidth />
          <List dense>
            {list.map(c=> {
              const hist = reservations.filter(r=> r.clientId===c.id);
              const last = hist[hist.length-1];
              return (
                <ListItemButton key={c.id} selected={c.id===selectedId} onClick={()=>setSelectedId(c.id)}>
                  <Avatar sx={{ width:24, height:24, mr:1, fontSize: '0.75rem' }}>{c.nom[0]}</Avatar>
                  <ListItemText 
                    primary={c.nom} 
                    secondary={`Dernière: ${last? format(new Date(last.dateDebut),'dd MMM yyyy', { locale: fr }):'—'}`} 
                    primaryTypographyProps={{ variant: 'body2' }}
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                  <Chip size="small" label={c.type || 'N/A'} variant="outlined" />
                </ListItemButton>
              );
            })}
          </List>
        </Paper>
        <Paper sx={{ p:2 }}>
          {!selected && <Typography color="text.secondary">Sélectionnez un client</Typography>}
          {selected && (
            <Stack spacing={1}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography fontWeight={800}>{selected.nom}</Typography>
                <Stack direction="row" spacing={1}>
                  <Button variant="outlined">E-mail</Button>
                  <Button variant="outlined">Appeler</Button>
                  <Button variant="contained">Nouvelle réservation</Button>
                </Stack>
              </Stack>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField 
                    size="small" 
                    label="Nom complet" 
                    fullWidth
                    value={formData.nom}
                    onChange={(e) => setFormData({...formData, nom: e.target.value})}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField 
                    size="small" 
                    label="Type" 
                    fullWidth
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField 
                    size="small" 
                    label="E-mail" 
                    fullWidth
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField 
                    size="small" 
                    label="Téléphone" 
                    fullWidth
                    value={formData.telephone}
                    onChange={(e) => setFormData({...formData, telephone: e.target.value})}
                  />
                </Grid>
                <Grid item xs={12} md={8}>
                  <TextField 
                    size="small" 
                    label="Adresse" 
                    fullWidth
                    value={formData.adresse}
                    onChange={(e) => setFormData({...formData, adresse: e.target.value})}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField 
                    size="small" 
                    label="Pays" 
                    fullWidth
                    value={formData.pays}
                    onChange={(e) => setFormData({...formData, pays: e.target.value})}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField 
                    size="small" 
                    label="Tags" 
                    fullWidth
                    placeholder="VIP, Direct"
                    value={formData.tags}
                    onChange={(e) => setFormData({...formData, tags: e.target.value})}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField 
                    size="small" 
                    label="Référence" 
                    fullWidth
                    placeholder="CLI-00000"
                    value={formData.reference}
                    onChange={(e) => setFormData({...formData, reference: e.target.value})}
                  />
                </Grid>
              </Grid>
              <Chip 
                size="small" 
                label={`Historique: ${history.length} séjour${history.length > 1 ? 's' : ''}`} 
                color="primary"
                variant="outlined"
              />
              <Box sx={{ mt:2 }}>
                <Typography fontWeight={700} mb={1}>Historique des réservations</Typography>
                {history.length === 0 && (
                  <Typography variant="body2" color="text.secondary">Aucune réservation</Typography>
                )}
                {history.length > 0 && (
                  <Box sx={{ 
                    display:'grid', 
                    gridTemplateColumns:'120px 1fr 140px 140px 120px', 
                    py:0.5,
                    px:1,
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    color: 'text.secondary',
                    borderBottom: '1px solid',
                    borderColor: 'divider'
                  }}>
                    <Box>Type</Box>
                    <Box>Description</Box>
                    <Box>Arrivée</Box>
                    <Box>Départ</Box>
                    <Box>Statut</Box>
                  </Box>
                )}
                {history.map(h => (
                  <Box key={h.id} sx={{ 
                    display:'grid', 
                    gridTemplateColumns:'120px 1fr 140px 140px 120px', 
                    py:1,
                    px:1,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    alignItems: 'center',
                    '&:hover': { bgcolor: 'action.hover' }
                  }}>
                    <Box>
                      <Chip size="small" label={h.type} variant="outlined" />
                    </Box>
                    <Box>
                      <Typography variant="body2">
                        {h.type === 'hebergement' ? `Chambre ${h.chambreId}` : 
                         h.type === 'restaurant' ? `Table ${h.tableId}` : 
                         'Autre'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2">
                        {format(new Date(h.dateDebut), 'dd MMM yyyy', { locale: fr })}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2">
                        {h.dateFin ? format(new Date(h.dateFin), 'dd MMM yyyy', { locale: fr }) : '-'}
                      </Typography>
                    </Box>
                    <Box>
                      <Chip 
                        size="small" 
                        label={h.statut} 
                        color={h.statut === 'terminee' ? 'success' : h.statut === 'arrivee' ? 'primary' : 'default'}
                      />
                    </Box>
                  </Box>
                ))}
              </Box>
              <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                <Button variant="contained">Sauvegarder</Button>
                <Button variant="outlined">Voir les factures</Button>
                <Button variant="outlined">Supprimer</Button>
              </Stack>
            </Stack>
          )}
        </Paper>
      </Box>
    </Box>
  );
}
