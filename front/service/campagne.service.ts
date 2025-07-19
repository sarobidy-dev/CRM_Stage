import { ApiResponse, Campagne } from "@/types/campagne.type"


const apiUrl = process.env.NEXT_PUBLIC_API_URL

export async function getAllCampagnes(): Promise<ApiResponse<Campagne[]>> {
  const res = await fetch(`${apiUrl}/campagnes`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  })
  if (!res.ok) throw new Error("Erreur lors de la récupération des campagnes")
  return await res.json()
}

export async function createCampagne(campagne: Omit<Campagne, "id">): Promise<ApiResponse<Campagne>> {
  const res = await fetch(`${apiUrl}/campagnes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(campagne),
  })
  if (!res.ok) throw new Error("Erreur lors de la création de la campagne")
  return await res.json()
}

export async function updateCampagne(id: number, campagne: Partial<Campagne>): Promise<ApiResponse<Campagne>> {
  const res = await fetch(`${apiUrl}/campagnes/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(campagne),
  })
  if (!res.ok) throw new Error("Erreur lors de la modification de la campagne")
  return await res.json()
}

export async function deleteCampagne(id: number): Promise<ApiResponse<null>> {
  const res = await fetch(`${apiUrl}/campagnes/${id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  })
  if (!res.ok) throw new Error("Erreur lors de la suppression de la campagne")
  return await res.json()
}