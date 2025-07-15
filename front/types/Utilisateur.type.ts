// export interface Utilisateur {
//     id_utilisateur: number
//     nom: string
//     prenom: string
//     email: string
// }
export interface Utilisateur{
  id_utilisateur: any;
  nom: string,
  email: string,
  mot2pass: string,
  role: string,
  actif?: boolean,
  photo_profil?: string
}