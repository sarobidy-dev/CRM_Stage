import { ApiResponse, HistoriqueAction } from "@/types/historiqueAction.type"


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

export async function getStatistiques(): Promise<StatistiqueData> {
  const res = await fetch(`${apiUrl}/historiqueActions/statistiques`)
  if (!res.ok) throw new Error("Erreur lors de la récupération des statistiques")
  return await res.json()
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