import Chip from "@mui/material/Chip";

export function ReservationStatus({
  value,
}: {
  value:
    | "en_attente"
    | "confirmee"
    | "arrivee"
    | "terminee"
    | "annulee"
    | "no_show";
}) {
  const map: Record<
    typeof value,
    { label: string; color: "default" | "info" | "success" | "error" }
  > = {
    en_attente: { label: "En attente", color: "default" },
    confirmee: { label: "Confirmée", color: "info" },
    arrivee: { label: "Arrivée", color: "success" },
    terminee: { label: "Terminée", color: "default" },
    annulee: { label: "Annulée", color: "default" },
    no_show: { label: "No-show", color: "default" },
  } as any;
  const { label, color } = map[value];
  return (
    <Chip
      label={label}
      color={color}
      variant={color === "default" ? "outlined" : "filled"}
      sx={{ bgcolor: color === "default" ? undefined : undefined }}
    />
  );
}

export function TableStatus({
  value,
}: {
  value: "libre" | "reservee" | "occupee";
}) {
  const map = {
    libre: { label: "Libre", color: "default" as const },
    reservee: { label: "Réservée", color: "info" as const },
    occupee: { label: "Occupée", color: "error" as const },
  }[value];
  return (
    <Chip
      label={map.label}
      color={map.color}
      variant={map.color === "default" ? "outlined" : "filled"}
    />
  );
}

export function CommandeStatus({
  value,
}: {
  value: "saisie" | "envoyee" | "servie" | "annulee";
}) {
  const map = {
    saisie: { label: "Saisie", color: "default" as const },
    envoyee: { label: "Envoyée", color: "info" as const },
    servie: { label: "Servie", color: "success" as const },
    annulee: { label: "Annulée", color: "default" as const },
  }[value];
  return (
    <Chip
      label={map.label}
      color={map.color}
      variant={map.color === "default" ? "outlined" : "filled"}
    />
  );
}

export function StockBadge({ value }: { value: "ok" | "bas" | "rupture" }) {
  const map = {
    ok: { label: "OK", color: "default" as const },
    bas: { label: "Bas", color: "warning" as const },
    rupture: { label: "Rupture", color: "error" as const },
  }[value];
  return (
    <Chip
      label={map.label}
      color={map.color}
      variant={map.color === "default" ? "outlined" : "filled"}
    />
  );
}
