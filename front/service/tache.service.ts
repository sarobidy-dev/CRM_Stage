import { TacheCreate, TacheOut, TacheUpdate } from "@/types/Tache.type";

// Base URL de votre API FastAPI
const API_BASE_URL = 'http://localhost:8000'; // Assurez-vous que c'est la bonne URL de votre backend

// Fonction utilitaire pour extraire un message d'erreur détaillé de la réponse de l'API
async function getDetailedErrorMessage(response: Response): Promise<string> {
  let errorMessage = `Failed with status: ${response.status} - ${response.statusText}`;
  try {
    const errorData = await response.json();
    if (errorData && errorData.detail) {
      if (typeof errorData.detail === 'string') {
        errorMessage = errorData.detail;
      } else if (Array.isArray(errorData.detail)) {
        // Common FastAPI validation error format: [{ "loc": [...], "msg": "field required" }]
        errorMessage = errorData.detail.map((err: any) => err.msg || JSON.stringify(err)).join(', ');
      } else if (typeof errorData.detail === 'object') {
        errorMessage = JSON.stringify(errorData.detail);
      }
    }
  } catch (jsonError) {
    console.error("Failed to parse error response JSON:", jsonError);
    // Fallback to generic message if JSON parsing fails
  }
  return errorMessage;
}

export async function createTache(tache: TacheCreate): Promise<TacheOut> {
  try {
    const response = await fetch(`${API_BASE_URL}/taches/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tache),
    });

    if (!response.ok) {
      const detailedError = await getDetailedErrorMessage(response);
      throw new Error(detailedError);
    }
    return response.json();
  } catch (error: any) {
    console.error("Error creating task:", error);
    throw new Error(`Failed to create task: ${error.message}`);
  }
}

export async function getTachesByContact(contactId: number): Promise<TacheOut[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/taches/contact/${contactId}`);
    if (!response.ok) {
      const detailedError = await getDetailedErrorMessage(response);
      throw new Error(detailedError);
    }
    return response.json();
  } catch (error: any) {
    console.error("Error fetching tasks by contact:", error);
    throw new Error(`Failed to fetch tasks: ${error.message}`);
  }
}

export async function updateTache(tacheId: number, data: TacheUpdate): Promise<TacheOut> {
  try {
    const response = await fetch(`${API_BASE_URL}/taches/${tacheId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const detailedError = await getDetailedErrorMessage(response);
      throw new Error(detailedError);
    }
    return response.json();
  } catch (error: any) {
    console.error(`Error updating task ${tacheId}:`, error);
    throw new Error(`Failed to update task: ${error.message}`);
  }
}

export async function deleteTache(tacheId: number): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/taches/${tacheId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const detailedError = await getDetailedErrorMessage(response);
      throw new Error(detailedError);
    }
  } catch (error: any) {
    console.error(`Error deleting task ${tacheId}:`, error);
    throw new Error(`Failed to delete task: ${error.message}`);
  }
}

export async function searchTaches(contactId: number, query: string): Promise<TacheOut[]> {
  // L'API FastAPI fournie n'a pas d'endpoint de recherche générique.
  // Pour simuler la recherche, nous allons récupérer toutes les tâches et filtrer côté client.
  // Dans une application réelle, vous ajouteriez un endpoint de recherche à votre API FastAPI.
  const allTaches = await getTachesByContact(contactId);
  const lowerCaseQuery = query.toLowerCase();
  return allTaches.filter(tache =>
    tache.titre.toLowerCase().includes(lowerCaseQuery) ||
    (tache.description && tache.description.toLowerCase().includes(lowerCaseQuery))
  );
}

export async function searchTachesByDate(contactId: number, startDate?: string, endDate?: string): Promise<TacheOut[]> {
  // Similaire à la recherche textuelle, nous filtrons côté client.
  const allTaches = await getTachesByContact(contactId);
  return allTaches.filter(tache => {
    if (!tache.date_echeance) return false; // Exclure les tâches sans date d'échéance
    const tacheDate = new Date(tache.date_echeance);
    let matchesStartDate = true;
    let matchesEndDate = true;

    if (startDate) {
      const start = new Date(startDate);
      matchesStartDate = tacheDate >= start;
    }
    if (endDate) {
      const end = new Date(endDate);
      // Pour inclure la fin de la journée, ajoutez 23h59m59s
      end.setHours(23, 59, 59, 999);
      matchesEndDate = tacheDate <= end;
    }
    return matchesStartDate && matchesEndDate;
  });
}
