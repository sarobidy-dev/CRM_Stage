import { ApiResponse } from "@/types/campagne.type"
import {HistoriqueAction } from "@/types/historiqueAction.type"


const apiUrl = process.env.NEXT_PUBLIC_API_URL

export async function getAllHistoriques(): Promise<ApiResponse<HistoriqueAction[]>> {
  const res = await fetch(`${apiUrl}/historiqueActions`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  })
  if (!res.ok) throw new Error("Erreur lors de la récupération des historiques")
  return await res.json()
}
export interface StatistiqueData {
  gagnes: number
  encours: number
  perdus: number
}

export interface NombreEntreprisesActivesResponse {
  nombre_entreprises_actives_aujourdhui: number;
}

export async function getNombreEntreprisesActivesAujourdHui(): Promise<NombreEntreprisesActivesResponse> {
  const res = await fetch(`${apiUrl}/historiqueActions/nombre-entreprises-actives-aujourdhui`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Erreur lors de la récupération du nombre d'entreprises actives aujourd'hui: ${res.status} ${errorText}`);
  }

  const data = await res.json();
  return data as NombreEntreprisesActivesResponse;
}

export async function getStatistiques(campagne_id?: number | null): Promise<StatistiqueData> {
  try {
    const url = `${apiUrl}/historiqueActions/statistiques${campagne_id ? `?campagne_id=${campagne_id}` : ""}`;
    console.log(`Fetching statistics from: ${url}`); // Log URL for debugging
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!res.ok) {
      const errorText = await res.text(); // Get response body for more context
      console.error(`HTTP error! Status: ${res.status}, Response: ${errorText}`);
      throw new Error(`Erreur lors de la récupération des statistiques: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    console.log('Statistics received:', data); // Log response for debugging
    return data as StatistiqueData;
  } catch (error) {
    console.error('Erreur dans getStatistiques:', error);
    throw new Error(`Erreur lors de la récupération des statistiques: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
}
export async function createHistorique(data: Omit<HistoriqueAction, "id">): Promise<ApiResponse<HistoriqueAction>> {
  const res = await fetch(`${apiUrl}/historiqueActions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),

    
  } )
    console.log("donnees",data);
  if (!res.ok) {
    let errorMessage = "Erreur lors de la création de l'historique"
    try {
      const errorData = await res.json()
      errorMessage = errorData.message || JSON.stringify(errorData)
    } catch (e) {
      // ignore erreur JSON parse
    }
    throw new Error(errorMessage)
  }

  return await res.json()
}



export async function updateHistorique(id: number, data: Partial<HistoriqueAction>): Promise<ApiResponse<HistoriqueAction>> {
  const res = await fetch(`${apiUrl}/historiqueActions/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error("Erreur lors de la modification de l'historique")
  return await res.json()
}

export async function deleteHistorique(id: number): Promise<ApiResponse<null>> {
  const res = await fetch(`${apiUrl}/historiqueActions/${id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  })
  if (!res.ok) throw new Error("Erreur lors de la suppression de l'historique")
  return await res.json()
}