import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem as MItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import AddIcon from "@mui/icons-material/Add";
import {
  useCreateMenuItem,
  useMenuItems,
  useUpdateMenuItem,
} from "@/services/api";
import { MenuItem as Item } from "@shared/api";

function CategoryChips({
  categories,
  value,
  onChange,
}: {
  categories: { id: string; count: number }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <Stack direction="row" spacing={1} flexWrap="wrap">
      <Chip
        label="Toutes"
        color={value === "all" ? "primary" : "default"}
        variant={value === "all" ? "filled" : "outlined"}
        onClick={() => onChange("all")}
      />
      {categories.map((c) => (
        <Chip
          key={c.id}
          label={`${c.id} (${c.count})`}
          color={value === c.id ? "primary" : "default"}
          variant={value === c.id ? "filled" : "outlined"}
          onClick={() => onChange(c.id)}
        />
      ))}
    </Stack>
  );
}

function Filters({
  value,
  onChange,
}: {
  value: "all" | "on" | "off";
  onChange: (v: "all" | "on" | "off") => void;
}) {
  return (
    <Stack
      direction="row"
      spacing={1}
      justifyContent="flex-end"
      flexWrap="wrap"
    >
      <Chip
        label="Tous"
        variant={value === "all" ? "filled" : "outlined"}
        color={value === "all" ? "primary" : "default"}
        onClick={() => onChange("all")}
      />
      <Chip
        label="Disponibles"
        variant={value === "on" ? "filled" : "outlined"}
        color={value === "on" ? "primary" : "default"}
        onClick={() => onChange("on")}
      />
      <Chip
        label="Indisponibles"
        variant={value === "off" ? "filled" : "outlined"}
        color={value === "off" ? "primary" : "default"}
        onClick={() => onChange("off")}
      />
    </Stack>
  );
}

function ItemCard({
  item,
  selected,
  onClick,
}: {
  item: Item;
  selected: boolean;
  onClick: () => void;
}) {
  const unavailable = !item.enabled;
  return (
    <Paper
      onClick={onClick}
      sx={{
        p: 1.5,
        borderRadius: 2,
        cursor: "pointer",
        border: "1px solid",
        borderColor: selected ? "primary.main" : "divider",
        position: "relative",
        overflow: "hidden",
        opacity: unavailable ? 0.6 : 1,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <img
          src={item.photoUrl || "/placeholder.svg"}
          alt=""
          width={56}
          height={56}
          style={{ borderRadius: 8, objectFit: "cover" }}
        />
        <Box sx={{ flex: 1 }}>
          <Typography fontWeight={700} lineHeight={1.2}>
            {item.nom}
          </Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
            <Chip
              size="small"
              label={unavailable ? "Indisponible" : "Disponible"}
              color={unavailable ? "default" : "success"}
              variant={unavailable ? "outlined" : "filled"}
            />
            <Typography variant="caption" color="text.secondary">
              {item.categorieId}
            </Typography>
          </Stack>
        </Box>
        <Typography fontWeight={800}>
          {item.prix.toLocaleString()} Ar
        </Typography>
      </Box>
    </Paper>
  );
}

export default function RestoMenu() {
  const { data } = useMenuItems();
  const update = useUpdateMenuItem();
  const create = useCreateMenuItem();
  const [selectedId, setSelectedId] = useState<string | null>(
    data?.[0]?.id ?? null,
  );
  const selected = (data || []).find((i) => i.id === selectedId) || null;

  const categories = useMemo(() => {
    const map: Record<string, number> = {};
    (data || []).forEach((i) => {
      map[i.categorieId] = (map[i.categorieId] || 0) + 1;
    });
    return Object.entries(map)
      .map(([id, count]) => ({ id, count }))
      .sort((a, b) => a.id.localeCompare(b.id));
  }, [data]);

  const [cat, setCat] = useState<string>("all");
  const [avail, setAvail] = useState<"all" | "on" | "off">("all");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    let list = data || [];
    if (cat !== "all") list = list.filter((i) => i.categorieId === cat);
    if (avail === "on") list = list.filter((i) => i.enabled);
    if (avail === "off") list = list.filter((i) => !i.enabled);
    if (q.trim())
      list = list.filter((i) => i.nom.toLowerCase().includes(q.toLowerCase()));
    return list;
  }, [data, cat, avail, q]);

  const [cart, setCart] = useState<{ id: string; nom: string; prix: number; qte: number }[]>([]);
  function addToCart(it: Item) {
    setCart((c) => {
      const i = c.findIndex((x) => x.id === it.id);
      if (i >= 0) {
        const copy = [...c];
        copy[i] = { ...copy[i], qte: copy[i].qte + 1 };
        return copy;
      }
      return [...c, { id: it.id, nom: it.nom, prix: it.prix, qte: 1 }];
    });
  }
  function changeQte(id: string, delta: number) {
    setCart((c) => c.map((x) => (x.id === id ? { ...x, qte: Math.max(0, x.qte + delta) } : x)).filter((x) => x.qte > 0));
  }
  const total = cart.reduce((a, b) => a + b.prix * b.qte, 0);

  const [openNew, setOpenNew] = useState(false);
  const [newForm, setNewForm] = useState({
    nom: "",
    categorieId: "entrees",
    prix: 10000,
    photoUrl: "",
  });

  function saveNew() {
    create.mutate(newForm, {
      onSuccess: (it) => {
        setOpenNew(false);
        setSelectedId(it.id);
      },
    });
  }

  function saveField<K extends keyof Item>(k: K, v: Item[K]) {
    if (!selected) return;
    update.mutate({ id: selected.id, [k]: v } as any);
  }

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
        <Typography variant="h4" fontWeight={800}>
          Menu
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<CloudUploadIcon />}>
            Importer
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenNew(true)}
          >
            Nouveau article
          </Button>
        </Stack>
      </Box>

      {/* Header with categories (left) and filters (right) */}
      <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 1.5 }}>
            <CategoryChips
              categories={categories}
              value={cat}
              onChange={setCat}
            />
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 1.5 }}>
            <Filters value={avail} onChange={setAvail} />
          </Paper>
        </Grid>
      </Grid>

      {/* Search */}
      <Paper sx={{ p: 1.5, mb: 2 }}>
        <TextField
          size="small"
          placeholder="Rechercher dans le menu (plats, boissons...)"
          fullWidth
          value={q}
          onChange={(e) => setQ(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      {/* Grid of items + cart aside */}
      <Grid container spacing={1.5}>
        <Grid item xs={12} md={8}>
          <Grid container spacing={1.5}>
            {filtered.map((i) => (
              <Grid key={i.id} item xs={12} sm={6} md={6} lg={4}>
                <div onDoubleClick={() => addToCart(i)}>
                  <ItemCard
                    item={i}
                    selected={selected?.id === i.id}
                    onClick={() => setSelectedId(i.id)}
                  />
                </div>
                <Button size="small" sx={{ mt: 0.5 }} variant="outlined" onClick={() => addToCart(i)}>Ajouter</Button>
              </Grid>
            ))}
          </Grid>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p:2, position:'sticky', top:80 }}>
            <Typography fontWeight={800} mb={1}>Commande</Typography>
            {cart.length===0 && <Typography color="text.secondary">Aucun article</Typography>}
            {cart.map((c)=> (
              <Stack key={c.id} direction="row" spacing={1} alignItems="center" sx={{ py:0.5 }}>
                <Box sx={{ flex:1 }}>{c.nom}</Box>
                <Chip size="small" label={`${c.prix.toLocaleString()} Ar`} />
                <Button size="small" onClick={()=>changeQte(c.id,-1)}>-</Button>
                <Typography>{c.qte}</Typography>
                <Button size="small" onClick={()=>changeQte(c.id,1)}>+</Button>
              </Stack>
            ))}
            <Divider sx={{ my:1 }} />
            <Stack direction="row" justifyContent="space-between" sx={{ mb:1 }}>
              <Typography>Total</Typography>
              <Typography fontWeight={800}>{total.toLocaleString()} Ar</Typography>
            </Stack>
            <Stack direction="row" spacing={1}>
              <Button variant="outlined">Imprimer</Button>
              <Button variant="contained">Générer la facture</Button>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* Details section below */}
      <Box sx={{ mt: 3 }}>
        <Paper sx={{ p: 2 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            mb={1}
          >
            <Typography fontWeight={800}>Détails de l'article</Typography>
            <Stack direction="row" spacing={1}>
              <Button variant="outlined">Dupliquer</Button>
              <Button
                variant="contained"
                onClick={() => selected && update.mutate({ id: selected.id })}
              >
                Enregistrer
              </Button>
            </Stack>
          </Stack>
          {!selected && (
            <Typography color="text.secondary">
              Sélectionnez un article
            </Typography>
          )}
          {selected && (
            <Stack spacing={1.2}>
              <TextField
                size="small"
                label="Nom"
                defaultValue={selected.nom}
                onBlur={(e) => saveField("nom", e.target.value)}
              />
              <TextField
                size="small"
                label="Catégorie"
                defaultValue={selected.categorieId}
                onBlur={(e) => saveField("categorieId", e.target.value)}
              />
              <TextField
                size="small"
                label="Prix (Ar)"
                type="number"
                defaultValue={selected.prix}
                onBlur={(e) =>
                  saveField("prix", parseInt(e.target.value || "0", 10))
                }
              />
              <Stack direction="row" gap={1}>
                <Chip
                  label={selected.enabled ? "Disponible" : "Indisponible"}
                  color={selected.enabled ? "success" : "default"}
                  onClick={() => saveField("enabled", !selected.enabled)}
                />
              </Stack>
              <TextField
                size="small"
                label="URL photo"
                placeholder="https://..."
                defaultValue={selected.photoUrl}
                onBlur={(e) => saveField("photoUrl", e.target.value)}
              />
              <TextField
                size="small"
                label="Description"
                multiline
                minRows={3}
                placeholder="À confirmer"
              />
              <Stack direction="row" gap={1}>
                <Chip label="Détails" variant="outlined" />
                <Chip label="Ingrédients" variant="outlined" />
                <Chip label="Allergènes" variant="outlined" />
              </Stack>
              <Box sx={{ mt: 1 }}>
                <Chip
                  label={`Coût matière: 5 200 Ar`}
                  variant="outlined"
                  sx={{ mr: 1 }}
                />
                <Chip label={`Marge: 58%`} variant="outlined" sx={{ mr: 1 }} />
                <Chip label={`SKU: ENT-001`} variant="outlined" />
              </Box>
            </Stack>
          )}
        </Paper>
      </Box>

      {/* Modal new article */}
      <Dialog
        open={openNew}
        onClose={() => setOpenNew(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Nouveau article</DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} sx={{ mt: 1 }}>
            <TextField
              size="small"
              label="Nom"
              value={newForm.nom}
              onChange={(e) => setNewForm({ ...newForm, nom: e.target.value })}
            />
            <FormControl size="small">
              <InputLabel>Catégorie</InputLabel>
              <Select
                label="Catégorie"
                value={newForm.categorieId}
                onChange={(e) =>
                  setNewForm({
                    ...newForm,
                    categorieId: e.target.value as string,
                  })
                }
              >
                <MItem value="entrees">Entrées</MItem>
                <MItem value="plats">Plats</MItem>
                <MItem value="boissons">Boissons</MItem>
                <MItem value="desserts">Desserts</MItem>
              </Select>
            </FormControl>
            <TextField
              size="small"
              label="Prix (Ar)"
              type="number"
              value={newForm.prix}
              onChange={(e) =>
                setNewForm({
                  ...newForm,
                  prix: parseInt(e.target.value || "0", 10),
                })
              }
            />
            <TextField
              size="small"
              label="URL photo"
              value={newForm.photoUrl}
              onChange={(e) =>
                setNewForm({ ...newForm, photoUrl: e.target.value })
              }
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenNew(false)}>Annuler</Button>
          <Button variant="contained" onClick={saveNew}>
            Créer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
