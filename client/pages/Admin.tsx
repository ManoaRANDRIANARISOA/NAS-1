import { Add, Close } from "@mui/icons-material";
import {
  Avatar,
  Box,
  Button,
  Chip,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { useMemo, useState } from "react";

const usersSeed = [
  { id: "u1", nom: "Rina Andriamalala", email: "rina@example.com", role: "Admin", canal: "Tous", derniere: "il y a 5 min", statut: "Actif" },
  { id: "u2", nom: "Hery Rakoto", email: "hery@example.com", role: "Manager", canal: "Hébergement", derniere: "il y a 2 h", statut: "Invité" },
  { id: "u3", nom: "Sariaka Ranaivo", email: "sariaka@example.com", role: "Serveur", canal: "Restaurant", derniere: "il y a 6 h", statut: "Actif" },
  { id: "u4", nom: "Zoé Randria", email: "zoe@example.com", role: "Réception", canal: "Hébergement", derniere: "", statut: "Suspendu" },
];

const roles = [
  { id: "r1", nom: "Admin", utilisateurs: 4, hebergement: "Total", restaurant: "Total", facturation: "Total" },
  { id: "r2", nom: "Manager", utilisateurs: 6, hebergement: "Modif.", restaurant: "Modif.", facturation: "Lecture" },
  { id: "r3", nom: "Serveur", utilisateurs: 8, hebergement: "Aucun", restaurant: "Lecture", facturation: "Aucun" },
  { id: "r4", nom: "Réception", utilisateurs: 6, hebergement: "Lecture", restaurant: "Aucun", facturation: "Création" },
];

export default function AdminPage() {
  const [data, setData] = useState(usersSeed);
  const [q, setQ] = useState("");
  const [selectedRole, setSelectedRole] = useState("Manager");
  const [perm, setPerm] = useState({ hebergement: true, restaurant: true, stock: true, facturation: true, rapports: true });
  const [drawer, setDrawer] = useState<null | { mode: "create" | "edit"; id?: string }>(null);

  const actifs = data.filter((u) => u.statut === "Actif").length;
  const invites = data.filter((u) => u.statut === "Invité").length;
  const suspendus = data.filter((u) => u.statut === "Suspendu").length;

  const filtered = useMemo(
    () => data.filter((u) => `${u.nom} ${u.email}`.toLowerCase().includes(q.toLowerCase())),
    [q, data],
  );

  function onRolePreset(n: string) {
    setSelectedRole(n);
    applyRoleToPerm(n);
  }

  function applyRoleToPerm(role: string) {
    const map: Record<string, typeof perm> = {
      Admin: { hebergement: true, restaurant: true, stock: true, facturation: true, rapports: true },
      Manager: { hebergement: true, restaurant: true, stock: true, facturation: true, rapports: true },
      Serveur: { hebergement: false, restaurant: true, stock: false, facturation: false, rapports: false },
      Réception: { hebergement: true, restaurant: false, stock: true, facturation: true, rapports: true },
    };
    setPerm(map[role] || perm);
  }

  function openCreate() { setDrawer({ mode: "create" }); }
  function openEdit(id: string) { setDrawer({ mode: "edit", id }); }
  function saveUser(payload: any) {
    if (drawer?.mode === "create") setData((d) => [...d, { id: `u${Date.now()}`, derniere: "", ...payload }]);
    else if (drawer?.mode === "edit" && drawer.id) setData((d) => d.map((u) => (u.id === drawer.id ? { ...u, ...payload } : u)));
    setDrawer(null);
  }

  return (
    <Box>
      <Typography variant="h4" fontWeight={800} mb={2}>Utilisateurs & Rôles</Typography>

      <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mb: 2 }}>
        <Paper sx={{ p: 2, flex: 1 }}>
          <Typography fontWeight={700} mb={1}>Filtres</Typography>
          <TextField size="small" placeholder="Rechercher un utilisateur, un rôle..." value={q} onChange={(e) => setQ(e.target.value)} fullWidth />
          <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap" }}>
            <Chip size="small" label={`Actifs ${actifs}`} variant="outlined" />
            <Chip size="small" label={`Invités ${invites}`} variant="outlined" />
            <Chip size="small" label={`Suspendus ${suspendus}`} variant="outlined" />
          </Stack>
        </Paper>
        <Paper sx={{ p: 2, width: { xs: "100%", md: 320 } }}>
          <Typography fontWeight={700} mb={1}>Rôles rapides</Typography>
          <Stack spacing={1}>
            <Button variant="outlined" onClick={() => onRolePreset("Admin")}>Administrateur</Button>
            <Button variant="outlined" onClick={() => onRolePreset("Réception")}>Réception</Button>
            <Button variant="outlined" onClick={() => onRolePreset("Serveur")}>Serveur</Button>
          </Stack>
        </Paper>
      </Stack>

      <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: "wrap" }}>
        <Chip label={`Utilisateurs actifs ${actifs}`} />
        <Chip label="Invitations en attente 3" />
        <Chip label="Dernière connexion il y a 2 h" />
        <Box sx={{ flex: 1 }} />
        <Button startIcon={<Add />} variant="contained" onClick={openCreate}>Nouvel utilisateur</Button>
      </Stack>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography fontWeight={700} mb={1}>Utilisateurs</Typography>
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 140px 140px 160px 100px 100px", px: 1, py: 1, color: "text.secondary", fontWeight: 700 }}>
          <Box>Utilisateur</Box>
          <Box>Rôle</Box>
          <Box>Canal</Box>
          <Box>Dernière activité</Box>
          <Box>Statut</Box>
          <Box>Actions</Box>
        </Box>
        {filtered.map((u) => (
          <Box key={u.id} sx={{ display: "grid", gridTemplateColumns: "1fr 140px 140px 160px 100px 100px", px: 1, py: 1, borderTop: "1px solid", borderColor: "divider", alignItems: "center" }}>
            <Box>
              <Typography fontWeight={700}>{u.nom}</Typography>
              <Typography variant="caption" color="text.secondary">{u.email}</Typography>
            </Box>
            <Box>{u.role}</Box>
            <Box>{u.canal}</Box>
            <Box>{u.derniere || "—"}</Box>
            <Box>
              <Chip size="small" label={u.statut} color={u.statut === "Actif" ? "success" : u.statut === "Invité" ? "warning" : "default"} />
            </Box>
            <Box>
              <Button size="small" onClick={() => openEdit(u.id)}>Gérer</Button>
            </Box>
          </Box>
        ))}
      </Paper>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
          <Typography fontWeight={700}>Permissions du rôle sélectionné</Typography>
          <Stack direction="row" spacing={1}>
            <Select size="small" value={selectedRole} onChange={(e) => { setSelectedRole(e.target.value as any); applyRoleToPerm(e.target.value as string); }}>
              {roles.map((r) => (
                <MenuItem key={r.id} value={r.nom}>{r.nom}</MenuItem>
              ))}
            </Select>
            <Button variant="contained">Enregistrer</Button>
          </Stack>
        </Stack>
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 100px", rowGap: 1, columnGap: 2 }}>
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
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 120px 120px 120px 120px", px: 1, py: 1, color: "text.secondary", fontWeight: 700 }}>
          <Box>Nom du rôle</Box>
          <Box>Utilisateurs</Box>
          <Box>Hébergement</Box>
          <Box>Restaurant</Box>
          <Box>Facturation</Box>
        </Box>
        {roles.map((r) => (
          <Box key={r.id} sx={{ display: "grid", gridTemplateColumns: "1fr 120px 120px 120px 120px", px: 1, py: 1, borderTop: "1px solid", borderColor: "divider" }}>
            <Box>{r.nom}</Box>
            <Box>{r.utilisateurs}</Box>
            <Box>{r.hebergement}</Box>
            <Box>{r.restaurant}</Box>
            <Box>{r.facturation}</Box>
          </Box>
        ))}
      </Paper>

      {drawer && (
        <Paper sx={{ p: 2, position: "fixed", right: 16, top: 80, width: { xs: "90%", md: 420 }, zIndex: 60 }} elevation={6}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
            <Typography fontWeight={700}>{drawer.mode === "create" ? "Nouvel utilisateur" : "Modifier l'utilisateur"}</Typography>
            <IconButton onClick={() => setDrawer(null)}><Close /></IconButton>
          </Stack>
          <UserForm
            initial={drawer.mode === "edit" ? data.find((u) => u.id === drawer.id)! : { nom: "", email: "", role: selectedRole, canal: "Tous", statut: "Actif" }}
            onCancel={() => setDrawer(null)}
            onSave={saveUser}
          />
        </Paper>
      )}
    </Box>
  );
}

function UserForm({ initial, onSave, onCancel }: { initial: any; onSave: (p: any) => void; onCancel: () => void }) {
  const [form, setForm] = useState(initial);
  return (
    <Stack spacing={1}>
      <TextField size="small" label="Nom" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} />
      <TextField size="small" label="E-mail" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      <Select size="small" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
        {roles.map((r) => (
          <MenuItem key={r.id} value={r.nom}>{r.nom}</MenuItem>
        ))}
      </Select>
      <Select size="small" value={form.canal} onChange={(e) => setForm({ ...form, canal: e.target.value })}>
        {["Tous", "Hébergement", "Restaurant"].map((c) => (
          <MenuItem key={c} value={c}>{c}</MenuItem>
        ))}
      </Select>
      <Select size="small" value={form.statut} onChange={(e) => setForm({ ...form, statut: e.target.value })}>
        {["Actif", "Invité", "Suspendu"].map((s) => (
          <MenuItem key={s} value={s}>{s}</MenuItem>
        ))}
      </Select>
      <Stack direction="row" spacing={1}>
        <Button variant="text" onClick={onCancel}>Annuler</Button>
        <Button variant="contained" onClick={() => onSave(form)}>Enregistrer</Button>
      </Stack>
    </Stack>
  );
}
