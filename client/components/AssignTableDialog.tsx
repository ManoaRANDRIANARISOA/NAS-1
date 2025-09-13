import {
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";
import { useRestoReservations, useAssignTable } from "@/services/api";

export default function AssignTableDialog({
  open,
  onClose,
  tableId,
}: {
  open: boolean;
  onClose: () => void;
  tableId: string;
}) {
  const { data: reservations } = useRestoReservations();
  const assign = useAssignTable();

  const withoutTable = reservations?.filter((r) => !r.tableId) ?? [];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Assigner une réservation</DialogTitle>
      <DialogContent>
        {withoutTable.length === 0 && (
          <Typography color="text.secondary">
            Aucune réservation sans table.
          </Typography>
        )}
        <List>
          {withoutTable.map((r) => (
            <ListItemButton
              key={r.id}
              onClick={async () => {
                await assign.mutateAsync({ tableId, reservationId: r.id });
                onClose();
              }}
            >
              <ListItemText
                primary={`${r.heure} · ${r.nbPersonnes ?? 0} pers`}
                secondary={r.clientId}
              />
            </ListItemButton>
          ))}
        </List>
      </DialogContent>
    </Dialog>
  );
}
