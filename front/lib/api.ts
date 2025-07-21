// // API functions to interact with your FastAPI backend

// const API_BASE_URL = "http://127.0.0.1:8000"

// export interface Contact {
//   nom: string
//   prenom: string
//   entreprise: string
//   telephone: string
//   email: string
//   adresse: string
//   fonction: string
//   source: string
//   secteur: string
//   type: string
//   photo_de_profil: string
//   id_contact: number
//   id_utilisateur: number
// }

// export async function fetchContacts(): Promise<Contact[]> {
//   try {
//     const response = await fetch(`${API_BASE_URL}/contactS`)
//     if (!response.ok) {
//       throw new Error("Failed to fetch contacts")
//     }
//     return await response.json()
//   } catch (error) {
//     console.error("Error fetching contacts:", error)
//     throw error
//   }
// }

// export async function createContact(contact: Omit<Contact, "id_contact" | "id_utilisateur">): Promise<Contact> {
//   try {
//     const response = await fetch(`${API_BASE_URL}/contacts`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(contact),
//     })
//     if (!response.ok) {
//       throw new Error("Failed to create contact")
//     }
//     return await response.json()
//   } catch (error) {
//     console.error("Error creating contact:", error)
//     throw error
//   }
// }

// export async function updateContact(id: number, contact: Partial<Contact>): Promise<Contact> {
//   try {
//     const response = await fetch(`${API_BASE_URL}/contacts/${id}`, {
//       method: "PUT",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(contact),
//     })
//     if (!response.ok) {
//       throw new Error("Failed to update contact")
//     }
//     return await response.json()
//   } catch (error) {
//     console.error("Error updating contact:", error)
//     throw error
//   }
// }

// export async function deleteContact(id: number): Promise<void> {
//   try {
//     const response = await fetch(`${API_BASE_URL}/contacts/${id}`, {
//       method: "DELETE",
//     })
//     if (!response.ok) {
//       throw new Error("Failed to delete contact")
//     }
//   } catch (error) {
//     console.error("Error deleting contact:", error)
//     throw error
//   }
// }
