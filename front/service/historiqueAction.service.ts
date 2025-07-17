import { ApiResponse, HistoriqueAction } from "@/types/HistoriqueAction.type"


const apiUrl = process.env.NEXT_PUBLIC_API_URL

export async function getAllHistoriques(): Promise<ApiResponse<HistoriqueAction[]>> {
  const res = await fetch(`${apiUrl}/historiqueActions`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  })
  if (!res.ok) throw new Error("Erreur lors de la récupération des historiques")
  return await res.json()
}

export async function createHistorique(data: Omit<HistoriqueAction, "id">): Promise<ApiResponse<HistoriqueAction>> {
  const res = await fetch(`${apiUrl}/historiqueActions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error("Erreur lors de la création de l'historique")
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