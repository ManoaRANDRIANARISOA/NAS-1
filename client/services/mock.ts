import {
  addDays,
  addHours,
  format,
  startOfMonth,
  startOfToday,
} from "date-fns";
import {
  Chambre,
  Client,
  Commande,
  Facture,
  MenuItem,
  MouvementStock,
  Reservation,
  StockProduit,
  TableResto,
  Evenement,
} from "@shared/api";

export const clients: Client[] = [
  {
    id: "c1",
    nom: "Rabe Andry",
    telephone: "032 11 111 11",
    email: "rabe@example.com",
  },
  { id: "c2", nom: "Hanitra Solo", telephone: "033 22 222 22" },
];

export const chambres: Chambre[] = [
  {
    id: "ch1",
    numero: "CH-1",
    categorie: "standard",
    capacite: 2,
    tarif_base: 80000,
    statut: "libre",
  },
  {
    id: "ch2",
    numero: "CH-2",
    categorie: "suite",
    capacite: 3,
    tarif_base: 150000,
    statut: "libre",
  },
  {
    id: "ch3",
    numero: "CH-3",
    categorie: "familiale",
    capacite: 4,
    tarif_base: 120000,
    statut: "maintenance",
  },
  {
    id: "ch4",
    numero: "CH-4",
    categorie: "standard",
    capacite: 2,
    tarif_base: 80000,
    statut: "occupee",
  },
];

export const tables: TableResto[] = Array.from({ length: 12 }).map((_, i) => {
  const numero = i + 1;
  const caps = [2, 4, 4, 6, 2, 8, 3, 4, 2, 6, 2, 4];
  const zones = ["Intérieur", "Terrasse"] as const;
  return {
    id: `t${numero}`,
    numero: `T${numero}`,
    capacite: caps[i] ?? 4,
    emplacement: zones[i % 2],
    statut:
      numero % 5 === 0 ? "occupee" : numero % 3 === 0 ? "reservee" : "libre",
  };
});

export const menu: MenuItem[] = Array.from({ length: 12 }).map((_, i) => ({
  id: `m${i + 1}`,
  categorieId: i % 3 === 0 ? "plats" : i % 3 === 1 ? "entrees" : "boissons",
  nom: [
    "Ravitoto",
    "Romazava",
    "Poulet coco",
    "Zébu grillé",
    "Brochettes",
    "Sambos",
    "Soupe",
    "Thé glacé",
    "Café",
    "Jus papaye",
    "Salade",
    "Poisson",
  ][i],
  prix: 10000 + i * 2000,
  enabled: ![2, 5, 8].includes(i),
  variants: i % 4 === 0 ? [{ nom: "XL", priceDelta: 3000 }] : undefined,
}));

export const reservations: Reservation[] = [
  // Restaurant (existant)
  {
    id: "r1",
    type: "restaurant",
    clientId: clients[0].id,
    tableId: "t3",
    dateDebut: addHours(startOfToday(), 12).toISOString(),
    heure: "12:10",
    nbPersonnes: 3,
    statut: "arrivee",
    gracePeriodMinutes: 15,
  },
  {
    id: "r2",
    type: "restaurant",
    clientId: clients[1].id,
    tableId: "t10",
    dateDebut: addHours(startOfToday(), 13).toISOString(),
    heure: "13:05",
    nbPersonnes: 4,
    statut: "arrivee",
    gracePeriodMinutes: 15,
  },
  {
    id: "r3",
    type: "restaurant",
    clientId: clients[0].id,
    tableId: "t9",
    dateDebut: addHours(startOfToday(), 18).toISOString(),
    heure: "18:30",
    nbPersonnes: 2,
    statut: "confirmee",
    gracePeriodMinutes: 15,
  },
  // Hébergement (étendu)
  {
    id: "h1",
    type: "hebergement",
    clientId: clients[1].id,
    chambreId: chambres[1].id,
    dateDebut: addDays(startOfToday(), 1).toISOString(),
    dateFin: addDays(startOfToday(), 3).toISOString(),
    statut: "en_attente",
    gracePeriodMinutes: 0,
  },
  {
    id: "h2",
    type: "hebergement",
    clientId: clients[0].id,
    chambreId: chambres[0].id,
    dateDebut: addDays(startOfToday(), -2).toISOString(),
    dateFin: addDays(startOfToday(), 1).toISOString(),
    statut: "arrivee",
    gracePeriodMinutes: 0,
  },
  {
    id: "h3",
    type: "hebergement",
    clientId: clients[0].id,
    chambreId: chambres[3].id,
    dateDebut: addDays(startOfToday(), 5).toISOString(),
    dateFin: addDays(startOfToday(), 8).toISOString(),
    statut: "confirmee",
    gracePeriodMinutes: 0,
  },
  {
    id: "h4",
    type: "hebergement",
    clientId: clients[1].id,
    chambreId: chambres[0].id,
    dateDebut: addDays(startOfToday(), 10).toISOString(),
    dateFin: addDays(startOfToday(), 12).toISOString(),
    statut: "annulee",
    gracePeriodMinutes: 0,
  },
];

// Sync tables with assigned reservations
for (const r of reservations) {
  if (r.type === "restaurant" && r.tableId) {
    const t = tables.find((t) => t.id === r.tableId);
    if (t) {
      t.assignedReservationId = r.id;
      t.statut = r.statut === "arrivee" ? "occupee" : "reservee";
    }
  }
}

export const commandes: Commande[] = [
  {
    id: "o1",
    reservationId: "r1",
    menuItemId: menu[0].id,
    quantite: 2,
    statut: "envoyee",
    createdAt: new Date().toISOString(),
  },
  {
    id: "o2",
    reservationId: "r1",
    menuItemId: menu[1].id,
    quantite: 1,
    statut: "servie",
    createdAt: new Date().toISOString(),
  },
];

export const stockProduits: StockProduit[] = [
  // Hébergement
  { id: "s1", nom: "Draps", famille: "Hebergement", sousCategorie: "linge_lit", unite: "u", stock: 30, seuilMin: 20 },
  { id: "s2", nom: "Savon", famille: "Hebergement", sousCategorie: "entretien", unite: "u", stock: 10, seuilMin: 15 },
  { id: "s4", nom: "Serviettes", famille: "Hebergement", sousCategorie: "linge_salle", unite: "u", stock: 12, seuilMin: 20 },
  { id: "s5", nom: "Shampooing", famille: "Hebergement", sousCategorie: "entretien", unite: "u", stock: 0, seuilMin: 10 },
  // Restaurant (sans "petit_dejeuner")
  { id: "s6", nom: "Huile", famille: "Restaurant", sousCategorie: "cuisine", unite: "L", stock: 3, seuilMin: 5 },
  { id: "s7", nom: "Riz", famille: "Restaurant", sousCategorie: "cuisine", unite: "kg", stock: 18, seuilMin: 15 },
  { id: "s8", nom: "Café", famille: "Restaurant", sousCategorie: "cuisine", unite: "kg", stock: 2, seuilMin: 5 },
];

export const factures: Facture[] = [
  {
    id: "f1",
    numero: "NAS-2025-0001",
    date: new Date().toISOString(),
    clientNom: "Rabe Andry",
    source: "Restaurant",
    lignes: [{ description: "Déjeuner", qte: 3, pu: 15000 }],
    totalTTC: 45000,
    statut: "emisee",
  },
  {
    id: "f2",
    numero: "NAS-2025-0002",
    date: new Date().toISOString(),
    clientNom: "Hanitra Solo",
    source: "Hebergement",
    lignes: [{ description: "Nuitée", qte: 2, pu: 80000 }],
    totalTTC: 160000,
    statut: "payee",
  },
];

export const evenements: Evenement[] = (() => {
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, "0");
  return [
    {
      id: "e1",
      nom: "Jazz du vendredi",
      date: `${y}-${m}-12`,
      heures: "19:00–22:30",
      nb: 40,
      contact: "Chef de salle",
      statut: "planifie",
      notes: "Groupes de 4 privilégiés.",
    },
    {
      id: "e2",
      nom: "Dégustation vins",
      date: `${y}-${m}-15`,
      heures: "18:00–21:00",
      nb: 25,
      contact: "Sommelier",
      statut: "confirme",
    },
    {
      id: "e3",
      nom: "Anniversaire — Famille Ranaivo",
      date: `${y}-${m}-20`,
      heures: "12:00–15:00",
      nb: 30,
      contact: "R. Andriam",
      statut: "planifie",
    },
    {
      id: "e4",
      nom: "Conférence locale",
      date: `${y}-${m}-30`,
      heures: "10:00–12:00",
      nb: 80,
      contact: "Mairie",
      statut: "planifie",
    },
  ];
})();

export function endOfService(): {
  ventesTotal: number;
  commandes: Commande[];
  mouvement: MouvementStock;
} {
  const ventesTotal = commandes.reduce(
    (acc, c) =>
      acc + c.quantite * (menu.find((m) => m.id === c.menuItemId)?.prix ?? 0),
    0,
  );
  const mouvement: MouvementStock = {
    id: `ms-${Date.now()}`,
    produitId: "_aggregat",
    type: "Consommation",
    quantite: ventesTotal,
    note: "Fin de service - agrégat",
    createdAt: new Date().toISOString(),
  };
  return { ventesTotal, commandes, mouvement };
}
