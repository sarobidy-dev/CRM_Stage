import axios from "axios";
import ApiService from "./api.service";
import { Utilisateur } from "@/types/Utilisateur.type";
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
export const fetchUtilisateurs = async (): Promise<Utilisateur[]> => {
    return await ApiService.get(`${apiUrl}/utilisateurs`);
};

const API = process.env.NEXT_PUBLIC_API_URL;

export const createUtilisateur = async (formData: FormData) => {
  const res = await axios.post(`${API}/utilisateurs/`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const updateUtilisateur = async (id: string, formData: FormData) => {
  const res = await axios.put(`${API}/utilisateurs/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};
export const deleteUtilisateur = async (id: string) => {
  const res = await axios.delete(`${API}/utilisateurs/${id}`);
  return res.data;
};
