import type { Adresse, AdresseResponse } from "@/types/Adresse.type"

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}


const apiUrl = process.env.NEXT_PUBLIC_API_URL

export async function getAllAdresses(): Promise<ApiResponse<Adresse[]>> {
  const res = await fetch(`${apiUrl}/adresses`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })

  if (!res.ok) {
    throw new Error("Erreur lors de la récupération des adresses")
  }

  const data = (await res.json()) as ApiResponse<Adresse[]>
  return data
}

export async function postAdresse(adresse: Omit<Adresse, 'id'>): Promise<ApiResponse<Adresse>> {
  const res = await fetch(`${apiUrl}/adresses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(adresse),
  });

  if (!res.ok) {
    throw new Error("Erreur lors de l'ajout de l'adresse");
  }

  const data = (await res.json()) as ApiResponse<Adresse>;
  return data;
}