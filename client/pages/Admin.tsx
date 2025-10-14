import { Add } from "@mui/icons-material";
import {
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";

const users = [
  {
    id: "u1",
    nom: "Rina Andriamalala",
    email: "rina@example.com",
    role: "Admin",
    canal: "Tous",
    derniere: "il y a 5 min",
    statut: "Actif",
  },
  {
    id: "u2",
    nom: "Hery Rakoto",
    email: "hery@example.com",
    role: "Manager",
    canal: "Hébergement",
    derniere: "il y a 2 h",
    statut: "Invité",
  },
  {
    id: "u3",
    nom: "Sariaka Ranaivo",
    email: "sariaka@example.com",
    role: "Serveur",
    canal: "Restaurant",
    derniere: "il y a 6 h",
    statut: "Actif",
  },
  {
    id: "u4",
    nom: "Zoé Randria",
    email: "zoe@example.com",
    role: "Réception",
    canal: "Hébergement",
    derniere: "",
    statut: "Suspendu",
  },
];

const roles = [
  {
    id: "r1",
    nom: "Admin",
    utilisateurs: 4,
    hebergement: "Total",
    restaurant: "Total",
    facturation: "Total",
  },
  {
    id: "r2",
    nom: "Manager",
    utilisateurs: 6,
    hebergement: "Modif.",
    restaurant: "Modif.",
    facturation: "Lecture",
  },
  {
    id: "r3",
    nom: "Serveur",
    utilisateurs: 8,
    hebergement: "Aucun",
    restaurant: "Lecture",
    facturation: "Aucun",
  },
  {
    id: "r4",
    nom: "Réception",
    utilisateurs: 6,
    hebergement: "Lecture",
    restaurant: "Aucun",
    facturation: "Création",
  },
];

export default function AdminPage() {
  const [selectedRole, setSelectedRole] = useState("Manager");
  const [perm, setPerm] = useState({
    hebergement: true,
    restaurant: true,
    stock: true,
    facturation: true,
    rapports: true,
  });

  return (
    <Box>
      <Typography variant="h4" fontWeight={800} mb={2}>
        Utilisateurs & Rôles
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gap: 2,
          mb: 2,
        }}
      >
        <Paper sx={{ p: 2 }}>
          <Typography fontWeight={700} mb={1}>
            Filtres
          </Typography>
          <TextField
            size="small"
            placeholder="Rechercher un utilisateur, un rôle..."
            fullWidth
          />
          <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap" }}>
            <Chip size="small" label="Tous" variant="outlined" />
            <Chip size="small" label="Actifs" variant="outlined" />
            <Chip size="small" label="Invités" variant="outlined" />
            <Chip size="small" label="Suspendus" variant="outlined" />
          </Stack>
        </Paper>
        <Paper sx={{ p: 2 }}>
          <Typography fontWeight={700} mb={1}>
            Rôles rapides
          </Typography>
          <Stack spacing={1}>
            <Button variant="outlined">Administrateur</Button>
            <Button variant="outlined">Réception</Button>
            <Button variant="outlined">Serveur</Button>
          </Stack>
        </Paper>
      </Box>

      <Stack spacing={2}>
        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
          <Chip label="Utilisateurs actifs 24" />
          <Chip label="Invitations en attente 3" />
          <Chip label="Dernière connexion il y a 2 h" />
          <Box sx={{ flex: 1 }} />
          <Button startIcon={<Add />} variant="contained">Nouvel utilisateur</Button>
        </Stack>

        <Paper sx={{ p: 2 }}>
          <Typography fontWeight={700} mb={1}>
            Utilisateurs
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 140px 140px 160px 100px 100px",
              px: 1,
              py: 1,
              color: "text.secondary",
              fontWeight: 700,
            }}
          >
            <Box>Utilisateur</Box>
            <Box>Rôle</Box>
            <Box>Canal</Box>
            <Box>Dernière activité</Box>
            <Box>Statut</Box>
            <Box>Actions</Box>
          </Box>
          {users.map((u) => (
            <Box
              key={u.id}
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 140px 140px 160px 100px 100px",
                px: 1,
                py: 1,
                borderTop: "1px solid",
                borderColor: "divider",
                alignItems: "center",
              }}
            >
              <Box>
                <Typography fontWeight={700}>{u.nom}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {u.email}
                </Typography>
              </Box>
              <Box>{u.role}</Box>
              <Box>{u.canal}</Box>
              <Box>{u.derniere || "—"}</Box>
              <Box>
                <Chip
                  size="small"
                  label={u.statut}
                  color={
                    u.statut === "Actif"
                      ? "success"
                      : u.statut === "Invité"
                        ? "warning"
                        : "default"
                  }
                />
              </Box>
              <Box>
                <Button size="small">Gérer</Button>
              </Box>
            </Box>
          ))}
        </Paper>

        <Paper sx={{ p: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
            <Typography fontWeight={700}>Permissions du rôle sélectionné</Typography>
            <Stack direction="row" spacing={1}>
              <TextField size="small" value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)} />
              <Button variant="contained">Enregistrer</Button>
            </Stack>
          </Stack>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 100px",
              rowGap: 1,
              columnGap: 2,
            }}
          >
            <Typography>Accès hébergement</Typography>
            <Switch checked={perm.hebergement} onChange={(e) => setPerm((p) => ({ ...p, hebergement: e.target.checked }))} />
            <Typography>Accès restaurant</Typography>
            <Switch checked={perm.restaurant} onChange={(e) => setPerm((p) => ({ ...p, restaurant: e.target.checked }))} />
            <Typography>Gestion des stocks</Typography>
            <Switch checked={perm.stock} onChange={(e) => setPerm((p) => ({ ...p, stock: e.target.checked }))} />
            <Typography>Facturation</Typography>
            <Switch checked={perm.facturation} onChange={(e) => setPerm((p) => ({ ...p, facturation: e.target.checked }))} />
            <Typography>Rapports</Typography>
            <Switch checked={perm.rapports} onChange={(e) => setPerm((p) => ({ ...p, rapports: e.target.checked }))} />
          </Box>
        </Paper>

        <Paper sx={{ p: 2 }}>
          <Typography fontWeight={700} mb={1}>Rôles</Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 120px 120px 120px 120px",
              px: 1,
              py: 1,
              color: "text.secondary",
              fontWeight: 700,
            }}
          >
            <Box>Nom du rôle</Box>
            <Box>Utilisateurs</Box>
            <Box>Hébergement</Box>
            <Box>Restaurant</Box>
            <Box>Facturation</Box>
          </Box>
          {roles.map((r) => (
            <Box
              key={r.id}
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 120px 120px 120px 120px",
                px: 1,
                py: 1,
                borderTop: "1px solid",
                borderColor: "divider",
              }}
            >
              <Box>{r.nom}</Box>
              <Box>{r.utilisateurs}</Box>
              <Box>{r.hebergement}</Box>
              <Box>{r.restaurant}</Box>
              <Box>{r.facturation}</Box>
            </Box>
          ))}
        </Paper>
      </Stack>
    </Box>
  );
}
