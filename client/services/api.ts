import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  commandes,
  endOfService,
  factures,
  menu,
  reservations,
  stockProduits,
  tables,
  evenements,
} from "./mock";
import {
  Commande,
  MenuItem,
  Reservation,
  TableResto,
  Evenement,
} from "@shared/api";

export const keys = {
  tables: ["tables"] as const,
  reservations: ["reservations"] as const,
  commandes: ["commandes"] as const,
  factures: ["factures"] as const,
  stock: ["stock"] as const,
  menu: ["menu"] as const,
  events: ["events"] as const,
};

export function useStockProduits() {
  return useQuery({
    queryKey: keys.stock,
    queryFn: async () => stockProduits,
  });
}

export function useCreateStockProduit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (
      payload: Omit<import("@shared/api").StockProduit, "id">,
    ) => {
      const created = {
        id: `s-${Date.now()}`,
        ...payload,
      } as import("@shared/api").StockProduit;
      (await import("./mock")).stockProduits.push(created);
      return created;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.stock }),
  });
}

export function useUpdateStockProduit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (
      payload: Partial<import("@shared/api").StockProduit> & { id: string },
    ) => {
      const list = (await import("./mock"))
        .stockProduits as any as import("@shared/api").StockProduit[];
      const i = list.findIndex((p) => p.id === payload.id);
      if (i >= 0) list[i] = { ...list[i], ...payload };
      return list[i];
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.stock }),
  });
}

export function useDeleteStockProduit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const list = (await import("./mock"))
        .stockProduits as any as import("@shared/api").StockProduit[];
      const i = list.findIndex((p) => p.id === id);
      if (i >= 0) list.splice(i, 1);
      return true;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.stock }),
  });
}

export function useEvenements() {
  return useQuery({
    queryKey: keys.events,
    queryFn: async (): Promise<Evenement[]> => evenements,
  });
}

export function useCreateEvenement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Omit<Evenement, "id">) => {
      const ev: Evenement = { id: `ev-${Date.now()}`, ...payload };
      (await import("./mock")).evenements.push(ev as any);
      return ev;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.events }),
  });
}

export function useUpdateEvenement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Evenement> & { id: string }) => {
      const list = (await import("./mock")).evenements as any as Evenement[];
      const i = list.findIndex((e) => e.id === payload.id);
      if (i >= 0) list[i] = { ...list[i], ...payload };
      return list[i];
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.events }),
  });
}

export function useTables() {
  return useQuery({ queryKey: keys.tables, queryFn: async () => tables });
}

export function useRestoReservations() {
  return useQuery({
    queryKey: keys.reservations,
    queryFn: async () => reservations.filter((r) => r.type === "restaurant"),
  });
}

export function useHebergementReservations() {
  return useQuery({
    queryKey: [...keys.reservations, "hebergement"],
    queryFn: async () => reservations.filter((r) => r.type === "hebergement"),
  });
}

export function useUpdateHebergementReservation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Reservation> & { id: string }) => {
      const list = (await import("./mock"))
        .reservations as any as Reservation[];
      const i = list.findIndex((e) => e.id === payload.id);
      if (i >= 0) list[i] = { ...list[i], ...payload };
      return list[i];
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.reservations }),
  });
}

export function useCreateHebergementReservation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (
      payload: Omit<Reservation, "id" | "type" | "gracePeriodMinutes"> & {
        type?: "hebergement";
      },
    ) => {
      const r: Reservation = {
        id: `h-${Date.now()}`,
        type: "hebergement",
        gracePeriodMinutes: 0,
        ...payload,
      } as Reservation;
      (await import("./mock")).reservations.push(r);
      return r;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.reservations }),
  });
}

export function useTodayRestoReservations() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return useQuery({
    queryKey: [...keys.reservations, "today"],
    queryFn: async () =>
      reservations.filter(
        (r) =>
          r.type === "restaurant" &&
          new Date(r.dateDebut).setHours(0, 0, 0, 0) === today.getTime(),
      ),
  });
}

export function useCreateClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      nom,
      telephone,
    }: {
      nom: string;
      telephone: string;
    }) => {
      const id = `c-${Date.now()}`; // in-memory
      const c = { id, nom, telephone } as any;
      (await import("./mock")).clients.push(c);
      return c;
    },
  });
}

export function useCreateRestoReservation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (
      payload: Pick<
        Reservation,
        "clientId" | "dateDebut" | "heure" | "nbPersonnes" | "tableId"
      >,
    ) => {
      const id = `r-${Date.now()}`;
      const r: Reservation = {
        id,
        type: "restaurant",
        statut: "confirmee",
        gracePeriodMinutes: 15,
        ...payload,
      } as Reservation;
      (await import("./mock")).reservations.push(r);
      if (r.tableId) {
        const t = tables.find((t) => t.id === r.tableId);
        if (t) {
          t.assignedReservationId = r.id;
          t.statut = "reservee";
        }
      }
      return r;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.reservations });
      qc.invalidateQueries({ queryKey: keys.tables });
    },
  });
}

export function useReservationCommandes(reservationId: string) {
  return useQuery({
    queryKey: [...keys.commandes, reservationId],
    queryFn: async () =>
      commandes.filter((c) => c.reservationId === reservationId),
    enabled: !!reservationId,
  });
}

export function useMenuItems() {
  return useQuery({
    queryKey: keys.menu,
    queryFn: async (): Promise<MenuItem[]> => menu,
  });
}

export function useUpdateMenuItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<MenuItem> & { id: string }) => {
      const idx = menu.findIndex((m) => m.id === payload.id);
      if (idx >= 0) menu[idx] = { ...menu[idx], ...payload } as MenuItem;
      return menu[idx];
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.menu }),
  });
}

export function useCreateMenuItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (
      payload: Pick<MenuItem, "nom" | "categorieId" | "prix"> &
        Partial<Pick<MenuItem, "photoUrl" | "enabled">>,
    ) => {
      const it: MenuItem = {
        id: `m${Date.now()}`,
        enabled: true,
        ...payload,
      } as MenuItem;
      (await import("./mock")).menu.push(it as any);
      return it;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.menu }),
  });
}

export function useAddCommande() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (
      payload: Pick<Commande, "reservationId" | "menuItemId" | "quantite">,
    ) => {
      const created: Commande = {
        id: `o-${Date.now()}`,
        createdAt: new Date().toISOString(),
        statut: "saisie",
        ...payload,
      };
      commandes.push(created);
      return created;
    },
    onSuccess: (_d, v) =>
      qc.invalidateQueries({ queryKey: [...keys.commandes, v.reservationId] }),
  });
}

export function useSendBatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ reservationId }: { reservationId: string }) => {
      commandes
        .filter(
          (c) => c.reservationId === reservationId && c.statut === "saisie",
        )
        .forEach((c) => (c.statut = "envoyee"));
    },
    onSuccess: (_r, v) =>
      qc.invalidateQueries({ queryKey: [...keys.commandes, v.reservationId] }),
  });
}

export function useMarkServed() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ reservationId }: { reservationId: string }) => {
      commandes
        .filter(
          (c) => c.reservationId === reservationId && c.statut === "envoyee",
        )
        .forEach((c) => (c.statut = "servie"));
    },
    onSuccess: (_r, v) =>
      qc.invalidateQueries({ queryKey: [...keys.commandes, v.reservationId] }),
  });
}

export function useCancelCommande() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, motif }: { id: string; motif?: string }) => {
      const c = commandes.find((c) => c.id === id);
      if (c) {
        c.statut = "annulee";
        c.motifAnnulation = motif;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.commandes }),
  });
}

export function useEndOfService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => endOfService(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.commandes });
      qc.invalidateQueries({ queryKey: keys.stock });
    },
  });
}

export function useAssignTable() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { tableId: string; reservationId: string }) => {
      // Collision: same table, same hour
      const r = reservations.find((r) => r.id === payload.reservationId);
      const collision = reservations.some(
        (rr) =>
          rr.id !== r?.id &&
          rr.tableId === payload.tableId &&
          rr.heure === r?.heure,
      );
      if (collision) throw new Error("Collision de table pour ce créneau");
      const t = tables.find((t) => t.id === payload.tableId);
      if (t)
        ((t.assignedReservationId = payload.reservationId),
          (t.statut = "reservee"));
      if (r) r.tableId = payload.tableId;
      return t as TableResto;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.tables });
      qc.invalidateQueries({ queryKey: keys.reservations });
    },
  });
}

export function useFactures() {
  return useQuery({
    queryKey: keys.factures,
    queryFn: async () => factures,
  });
}

export function useCreateFacture() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (
      payload: Omit<
        import("@shared/api").Facture,
        "id" | "numero" | "totalTTC"
      > & { totalTTC?: number },
    ) => {
      const total =
        payload.totalTTC ??
        payload.lignes.reduce((s, l) => s + l.qte * l.pu, 0);
      const created: import("@shared/api").Facture = {
        id: `f-${Date.now()}`,
        numero: `NAS-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, "0")}`,
        totalTTC: total,
        ...payload,
      };
      (await import("./mock")).factures.push(created);
      return created;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.factures }),
  });
}

export function useUpdateFacture() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (
      payload: Partial<import("@shared/api").Facture> & { id: string },
    ) => {
      const list = (await import("./mock")).factures as any as import("@shared/api").Facture[];
      const i = list.findIndex((f) => f.id === payload.id);
      if (i >= 0) list[i] = { ...list[i], ...payload };
      return list[i];
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.factures }),
  });
}

export function useClients() {
  return useQuery({
    queryKey: ["clients"],
    queryFn: async () => (await import("./mock")).clients,
  });
}
