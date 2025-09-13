import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useAppSelector } from "@/store";
import {
  useMenuItems,
  useReservationCommandes,
  useSendBatch,
  useMarkServed,
  useAddCommande,
  useCancelCommande,
} from "@/services/api";
import { Commande } from "@shared/api";

export default function CommandesModal({
  reservationId,
  open,
  onClose,
}: {
  reservationId: string;
  open: boolean;
  onClose: () => void;
}) {
  const { data: items } = useMenuItems();
  const { data: lines } = useReservationCommandes(reservationId);
  const [newItem, setNewItem] = useState<string>("");
  const [qty, setQty] = useState<number>(1);
  const send = useSendBatch();
  const served = useMarkServed();
  const add = useAddCommande();
  const cancel = useCancelCommande();
  const role = useAppSelector((s) => s.session.role);

  const canSend = useMemo(
    () => role === "serveur" || role === "chef_salle" || role === "comptoir",
    [role],
  );
  const canCancelAfterSend = role === "chef_salle";

  const handleAdd = async () => {
    if (!newItem || qty <= 0) return;
    await add.mutateAsync({
      reservationId,
      menuItemId: newItem,
      quantite: qty,
    });
    setQty(1);
    setNewItem("");
  };

  const handleSend = async () => {
    if (!canSend) return;
    await send.mutateAsync({ reservationId });
  };
  const handleServed = async () => {
    await served.mutateAsync({ reservationId });
  };
  const handleCancel = async (line: Commande) => {
    if (line.statut === "envoyee" && !canCancelAfterSend) {
      alert("Annulation après envoi requiert chef_salle");
      return;
    }
    let motif = "";
    if (line.statut !== "saisie") {
      motif = prompt("Motif annulation?") || "";
    }
    await cancel.mutateAsync({ id: line.id, motif });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Commande</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
          <Select
            size="small"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            displayEmpty
            sx={{ minWidth: 260 }}
          >
            <MenuItem value="">
              <em>Sélectionner un produit...</em>
            </MenuItem>
            {items?.map((i) => (
              <MenuItem key={i.id} value={i.id}>
                {i.nom} — {i.prix} MGA
              </MenuItem>
            ))}
          </Select>
          <TextField
            size="small"
            type="number"
            value={qty}
            onChange={(e) => setQty(parseInt(e.target.value || "0", 10))}
            sx={{ width: 100 }}
          />
          <Button variant="outlined" onClick={handleAdd}>
            Ajouter
          </Button>
        </Box>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Produit</TableCell>
              <TableCell>Qté</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {lines?.map((l) => (
              <TableRow key={l.id}>
                <TableCell>
                  {items?.find((i) => i.id === l.menuItemId)?.nom}
                </TableCell>
                <TableCell>{l.quantite}</TableCell>
                <TableCell>{l.statut}</TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => handleCancel(l)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {!lines?.length && (
          <Typography color="text.secondary" sx={{ mt: 2 }}>
            Aucune ligne
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleSend} variant="contained" disabled={!canSend}>
          Envoyer en cuisine/bar
        </Button>
        <Button onClick={handleServed} color="success" variant="outlined">
          Marquer servi
        </Button>
      </DialogActions>
    </Dialog>
  );
}
