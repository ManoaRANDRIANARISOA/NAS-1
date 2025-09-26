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
      { label: "Gestion des chambres", path: "/hebergement/gestion" },
      { label: "Clients", path: "/hebergement/clients" },
      { label: "Stock", path: "/hebergement/stock" },
      { label: "Tarifs", path: "/hebergement/tarifs" },
    ];
    const resto = [
      { label: "Plan de salle", path: "/resto/plan" },
      { label: "Menu", path: "/resto/menu" },
      { label: "Stock", path: "/resto/stock" },
      { label: "Événements", path: "/resto/evenements" },
    ];
    const stock: any[] = [];
    const financier = [{ label: "Financier", path: "/financier" }];
    const rapports = [{ label: "Rapports", path: "/rapports" }];
    const admin = [
      { label: "Gestion / Admin", path: "/admin" },
      { label: "Paramètres", path: "/parametres" },
    ];

    const map: Record<
      Role,
      { label: string; children: { label: string; path: string }[] }[]
    > = {
      admin: [
        { label: "Hébergement", children: hebergement },
        { label: "Restaurant", children: resto },
        { label: "Financier", children: financier },
        { label: "Administration", children: admin },
      ],
      reception: [
        { label: "Hébergement", children: hebergement },
        {
          label: "Restaurant",
          children: resto.filter((i) => ["/resto/plan"].includes(i.path)),
        },
        { label: "Financier", children: financier },
      ],
      chef_salle: [{ label: "Restaurant", children: resto }],
      serveur: [{ label: "Restaurant", children: resto }],
      cuisine: [{ label: "Restaurant", children: resto }],
      bar: [{ label: "Restaurant", children: resto }],
      comptoir: [
        { label: "Restaurant", children: resto },
        { label: "Financier", children: financier },
      ],
      economat: [{ label: "Hébergement", children: hebergement }],
      comptable: [{ label: "Financier", children: financier }],
      direction: [
        { label: "Hébergement", children: hebergement },
        { label: "Restaurant", children: resto },
        { label: "Financier", children: financier },
      ],
    };

    return { base, sections: map[role] ?? [] };
  }, [role]);

  return { role, menu };
};
