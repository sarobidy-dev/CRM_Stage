// app/historique/page.tsx
"use client";

import { useMemo, useState } from "react";
import {
  PhoneIcon,
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";
type Filter = "tous" | "appel" | "email" | "message";

type HistoriqueItem =
  | {
      type: "appel";
      date: string;
      utilisateur: string;
      contact: string;
      details: { duration: number; status: string };
    }
  | {
      type: "email";
      date: string;
      utilisateur: string;
      contact: string;
      details: { subject: string; content: string };
    }
  | {
      type: "message";
      date: string;
      utilisateur: string;
      contact: string;
      details: { content: string };
    };

const historique: HistoriqueItem[] = [
  /* … mêmes données qu’avant … */
];

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
  });

/** Bouton de filtre avec icône et compteur */
function FilterButton({
  label,
  icon: Icon,
  active,
  count,
  onClick,
}: {
  label: string;
  icon: typeof PhoneIcon;
  active: boolean;
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      aria-pressed={active}
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-full border transition
        ${active ? "bg-blue-600 text-white" : "bg-white text-gray-800 hover:bg-gray-100"}
      `}
    >
      <Icon className="h-5 w-5" />
      <span className="capitalize">{label}</span>
      <span
        className={`ml-1 text-xs font-semibold px-2 py-0.5 rounded-full
          ${active ? "bg-blue-500" : "bg-gray-200"}
        `}
      >
        {count}
      </span>
    </button>
  );
}

export default function PageHistorique() {
  const [filter, setFilter] = useState<Filter>("tous");

  const counts = useMemo(() => {
    const base = { appel: 0, email: 0, message: 0 };
    historique.forEach((h) => (base[h.type] += 1));
    return base;
  }, []);

  const filtered = useMemo(
    () =>
      filter === "tous"
        ? historique
        : historique.filter((item) => item.type === filter),
    [filter]
  );

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold">📋 Historique des interactions</h1>

      {/* Groupe de filtres */}
      <div className="flex flex-wrap gap-3">
     <FilterButton
  label="Tous"
  icon={PhoneIcon}
  active={filter === "tous"}
  count={historique.length}
  onClick={() => setFilter("tous")}
/>
<FilterButton
  label="Appel"
  icon={PhoneIcon}
  active={filter === "appel"}
  count={counts.appel}
  onClick={() => setFilter("appel")}
/>
<FilterButton
  label="Email"
  icon={EnvelopeIcon}
  active={filter === "email"}
  count={counts.email}
  onClick={() => setFilter("email")}
/>
<FilterButton
  label="Message"
  icon={ChatBubbleLeftRightIcon}
  active={filter === "message"}
  count={counts.message}
  onClick={() => setFilter("message")}
/>

      </div>

      {/* Liste des interactions */}
      {filtered.map((item, i) => (
        <div
          key={i}
          className="border rounded-xl p-4 shadow-sm bg-white space-y-1"
        >
          <p className="text-sm text-gray-500">
            {formatDate(item.date)} — {item.utilisateur} → {item.contact}
          </p>

          {item.type === "appel" && (
            <>
              <p className="font-semibold">📞 Appel vidéo</p>
              <p>
                Durée&nbsp;: {item.details.duration}s — Statut&nbsp;:
                {item.details.status}
              </p>
            </>
          )}

          {item.type === "email" && (
            <>
              <p className="font-semibold">✉️ Email</p>
              <p>Sujet&nbsp;: {item.details.subject}</p>
              <p>Contenu&nbsp;: {item.details.content}</p>
            </>
          )}

          {item.type === "message" && (
            <>
              <p className="font-semibold">💬 Message</p>
              <p>{item.details.content}</p>
            </>
          )}
        </div>
      ))}

      {filtered.length === 0 && (
        <p className="text-gray-500">Aucune interaction pour ce filtre.</p>
      )}
    </div>
  );
}
