import { useMemo } from "react";
import { useAppSelector } from "@/store";

export type Role =
  | "admin"
  | "reception"
  | "chef_salle"
  | "serveur"
  | "cuisine"
  | "bar"
  | "comptoir"
  | "economat"
  | "comptable"
  | "direction";

export const useRBAC = () => {
  const role = useAppSelector((s) => s.session.role);

  const menu = useMemo(() => {
    const base = [{ label: "Dashboard", path: "/dashboard" }];
    const hebergement = [
      { label: "Planning", path: "/hebergement/planning" },
      { label: "Réservations", path: "/hebergement/reservations" },
      { label: "Clients", path: "/hebergement/clients" },
      { label: "Linge", path: "/hebergement/linge" },
      { label: "Tarifs", path: "/hebergement/tarifs" },
    ];
    const resto = [
      { label: "Plan de salle", path: "/resto/plan" },
      { label: "Menu", path: "/resto/menu" },
      { label: "Événements", path: "/resto/evenements" },
    ];
    const stock = [
      { label: "Produits", path: "/stock/produits" },
      { label: "Mouvements", path: "/stock/mouvements" },
      { label: "Alertes", path: "/stock/alertes" },
    ];
    const billing = [{ label: "Factures", path: "/facturation/factures" }];
    const rapports = [{ label: "Rapports", path: "/rapports" }];
    const admin = [
      { label: "Utilisateurs & Rôles", path: "/admin/utilisateurs" },
      { label: "Paramètres", path: "/parametres" },
    ];

    const map: Record<
      Role,
      { label: string; children: { label: string; path: string }[] }[]
    > = {
      admin: [
        { label: "Hébergement", children: hebergement },
        { label: "Restaurant", children: resto },
        { label: "Économat", children: stock },
        { label: "Facturation", children: billing },
        { label: "Rapports", children: rapports },
        { label: "Administration", children: admin },
      ],
      reception: [
        { label: "Hébergement", children: hebergement },
        {
          label: "Restaurant",
          children: resto.filter((i) => ["/resto/plan"].includes(i.path)),
        },
        { label: "Facturation", children: billing },
      ],
      chef_salle: [{ label: "Restaurant", children: resto }],
      serveur: [{ label: "Restaurant", children: resto }],
      cuisine: [{ label: "Restaurant", children: resto }],
      bar: [{ label: "Restaurant", children: resto }],
      comptoir: [
        { label: "Restaurant", children: resto },
        { label: "Facturation", children: billing },
      ],
      economat: [{ label: "Économat", children: stock }],
      comptable: [
        { label: "Facturation", children: billing },
        { label: "Rapports", children: rapports },
      ],
      direction: [
        { label: "Hébergement", children: hebergement },
        { label: "Restaurant", children: resto },
        { label: "Économat", children: stock },
        { label: "Facturation", children: billing },
        { label: "Rapports", children: rapports },
      ],
    };

    return { base, sections: map[role] ?? [] };
  }, [role]);

  return { role, menu };
};
