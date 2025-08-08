"use client"

<<<<<<< HEAD
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getAllContacts } from '@/service/Contact.service';
import { TacheOut, TacheCreate, TacheUpdate } from '@/types/Tache.type';
import { Contact } from '@/types/Contact.type';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
=======
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
>>>>>>> 8b2940889050358626fa300ab5200aa6a170e0bb
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
<<<<<<< HEAD
} from '@/components/ui/dialog'; // Removed DialogTrigger
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';
import { Pencil, Trash2, Search, Calendar, Phone, BellRing } from 'lucide-react'; // Removed PlusCircle
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createTache, deleteTache, getTachesByContact, updateTache } from '@/service/tache.service';
import Navbar from '@/components/navbarLink/nav';

export default function TachePage() {
  const [taches, setTaches] = useState<TacheOut[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentTache, setCurrentTache] = useState<TacheOut | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedContactFilterId, setSelectedContactFilterId] = useState<string>('all');
  const [displayedPhoneNumber, setDisplayedPhoneNumber] = useState<string | null>(null);
  const [reminders, setReminders] = useState<TacheOut[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false); // Nouveau state pour contrôler la lecture audio

  // Initialisation de l'audio
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio('/musique/alerte.mp3');
      audioRef.current.loop = true;
    }
  }, []);

  // Fonction pour récupérer les contacts
  const fetchContacts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllContacts();
      if (Array.isArray(data)) {
        setContacts(data);
      } else if (data && typeof data === "object" && Array.isArray((data as any).data)) {
        setContacts((data as any).data);
      } else {
        throw new Error("Format de réponse invalide pour les contacts.");
      }
    } catch (err) {
      console.error("Erreur lors du chargement des contacts:", err);
      setError("Échec du chargement des contacts.");
      setContacts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fonction pour récupérer les tâches (dépend du filtre de contact)
  const fetchTaches = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let data: TacheOut[] = [];
      if (selectedContactFilterId === 'all') {
        const allContactsTaches: TacheOut[] = [];
        for (const contact of contacts) {
          try {
            const tachesForContact = await getTachesByContact(contact.id);
            allContactsTaches.push(...tachesForContact);
          } catch (e) {
            console.warn(`Could not fetch tasks for contact ${contact.id}:`, e);
          }
        }
        data = allContactsTaches;
      } else {
        data = await getTachesByContact(parseInt(selectedContactFilterId));
      }

      const enrichedTaches = data.map(tache => {
        const contact = contacts.find(c => c.id === tache.contact_id);
        return {
          ...tache,
          contact_name: contact ? `${contact.nom} ${contact.prenom}` : 'Contact Inconnu',
          contact_phone: contact ? contact.telephone : null,
        };
      });
      setTaches(enrichedTaches);
    } catch (err) {
      setError('Failed to fetch tasks. Please check your API connection.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [selectedContactFilterId, contacts]);

  // Effet pour charger les contacts au montage
  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  // Effet pour charger les tâches lorsque les contacts sont chargés ou le filtre change
  useEffect(() => {
    if (contacts.length > 0 || selectedContactFilterId === 'all') {
      fetchTaches();
    }
  }, [fetchTaches, contacts, selectedContactFilterId]);

  const handleCreateOrUpdateTache = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget as HTMLFormElement);
    const titre = formData.get('titre') as string;
    const description = formData.get('description') as string;
    const date_echeance = formData.get('date_echeance') as string;
    const statut = formData.get('statut') as string;
    const contact_id = parseInt(formData.get('contact_id') as string);

    const tacheData: TacheCreate | TacheUpdate = {
      titre,
      description: description || null,
      date_echeance: date_echeance || null,
      statut,
      contact_id,
    };

    try {
      if (currentTache) {
        await updateTache(currentTache.id, tacheData as TacheUpdate);
      } else {
        // This branch should ideally not be hit if creation is only from ContactsPage
        await createTache(tacheData as TacheCreate);
      }
      setIsDialogOpen(false);
      setTimeout(() => fetchTaches(), 100); // Delayed re-fetch
    } catch (err) {
      setError(`Failed to ${currentTache ? 'update' : 'create'} task.`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTache = async (id: number) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await deleteTache(id);
      setTimeout(() => fetchTaches(), 100); // Delayed re-fetch
    } catch (err) {
      setError('Failed to delete task.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    try {
      let filteredTaches: TacheOut[] = [];
      if (selectedContactFilterId === 'all') {
        const allContactsTaches: TacheOut[] = [];
        for (const contact of contacts) {
          try {
            const tachesForContact = await getTachesByContact(contact.id);
            allContactsTaches.push(...tachesForContact);
          } catch (e) {
            console.warn(`Could not fetch tasks for contact ${contact.id}:`, e);
          }
        }
        filteredTaches = allContactsTaches;
      } else {
        filteredTaches = await getTachesByContact(parseInt(selectedContactFilterId));
      }

      filteredTaches = filteredTaches.map(tache => {
        const contact = contacts.find(c => c.id === tache.contact_id);
        return {
          ...tache,
          contact_name: contact ? `${contact.nom} ${contact.prenom}` : 'Contact Inconnu',
          contact_phone: contact ? contact.telephone : null,
        };
      });

      if (searchTerm) {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        filteredTaches = filteredTaches.filter(tache =>
          tache.titre.toLowerCase().includes(lowerCaseSearchTerm) ||
          (tache.description && tache.description.toLowerCase().includes(lowerCaseSearchTerm))
        );
      }

      if (startDate || endDate) {
        filteredTaches = filteredTaches.filter(tache => {
          if (!tache.date_echeance) return false;
          const tacheDate = new Date(tache.date_echeance);
          let matchesStartDate = true;
          let matchesEndDate = true;

          if (startDate) {
            const start = new Date(startDate);
            matchesStartDate = tacheDate >= start;
          }
          if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            matchesEndDate = tacheDate <= end;
          }
          return matchesStartDate && matchesEndDate;
        });
      }
      setTaches(filteredTaches);
    } catch (err) {
      setError('Failed to perform search.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetSearch = () => {
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
    setSelectedContactFilterId('all');
    fetchTaches();
  };

  // openCreateDialog is no longer called from this page
  // const openCreateDialog = () => {
  //   setCurrentTache(null);
  //   setIsDialogOpen(true);
  // };

  const openEditDialog = (tache: TacheOut) => {
    setCurrentTache(tache);
    setIsDialogOpen(true);
  };

  const handleCallContact = async (tache: TacheOut) => {
    if (!tache.contact_phone) {
      alert("Numéro de téléphone non disponible pour ce contact.");
      return;
    }
    setDisplayedPhoneNumber(tache.contact_phone);
    try {
      // Optimistic update: update local state immediately
      setTaches(prevTaches =>
        prevTaches.map(t =>
          t.id === tache.id ? { ...t, statut: 'terminée' } : t
        )
      );
      // Call API to update status
      await updateTache(tache.id, { statut: 'terminée' });
      // Re-fetch to ensure consistency, but not immediately blocking
      setTimeout(() => fetchTaches(), 100);
    } catch (err) {
      setError('Failed to update task status.');
      console.error(err);
      // Revert optimistic update if API call fails
      setTaches(prevTaches =>
        prevTaches.map(t =>
          t.id === tache.id ? { ...t, statut: tache.statut } : t
        )
      );
    }
  };

  // Logique de l'horloge de rappel: identifie les rappels et met à jour l'état `reminders`
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const activeReminders: TacheOut[] = [];

      taches.forEach(tache => {
        // Seules les tâches non terminées et non annulées peuvent être des rappels
        if (tache.date_echeance && tache.statut !== 'terminée' && tache.statut !== 'en cours') {
          const dueDate = new Date(tache.date_echeance);
          if (dueDate <= now) {
            activeReminders.push(tache);
          }
        }
      });

      // Met à jour la liste des rappels en s'assurant qu'elle ne contient que les rappels actifs
      setReminders(prevReminders => {
        const currentActiveIds = new Set(activeReminders.map(r => r.id));
        // Garde les rappels qui sont toujours actifs et ajoute les nouveaux
        const filteredPrev = prevReminders.filter(r => currentActiveIds.has(r.id));
        const newOnes = activeReminders.filter(r => !prevReminders.some(pr => pr.id === r.id));
        return [...filteredPrev, ...newOnes];
      });

    }, 1000);

    return () => clearInterval(interval);
  }, [taches]); // Dépend de `taches` pour que la logique de rappel se rafraîchisse avec les dernières données

  // Effet pour contrôler la lecture/pause de l'audio en fonction de l'état `reminders`
  useEffect(() => {
    if (audioRef.current) {
      if (reminders.length > 0 && !isAudioPlaying) {
        audioRef.current.play().catch(e => console.error("Error playing audio:", e));
        setIsAudioPlaying(true);
      } else if (reminders.length === 0 && isAudioPlaying) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setIsAudioPlaying(false);
      }
    }
  }, [reminders, isAudioPlaying]); // Dépend de `reminders` et `isAudioPlaying`

  const dismissReminder = async (id: number) => {
    const taskToDismiss = taches.find(t => t.id === id);
    if (!taskToDismiss) return;

    // Optimistic update: remove from reminders list and update main tasks list
    setReminders(prev => prev.filter(r => r.id !== id));
    setTaches(prevTaches =>
      prevTaches.map(t =>
        t.id === id ? { ...t, statut: 'en cours' } : t
      )
    );

    try {
      await updateTache(id, { statut: 'en cours' });
      // Re-fetch to ensure consistency after successful API call
      setTimeout(() => fetchTaches(), 100);
    } catch (err) {
      setError('Failed to dismiss reminder and update task status.');
      console.error(err);
      // Revert optimistic update if API call fails
      setTaches(prevTaches =>
        prevTaches.map(t =>
          t.id === id ? { ...t, statut: taskToDismiss.statut } : t
        )
      );
      // Re-add to reminders if update failed
      setReminders(prev => [...prev, taskToDismiss]);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Navbar />
      <div className="container w-full mx-auto p-4 md:p-8">
        {/* Section des rappels */}
        {reminders.length > 0 && (
          <Card className="mb-6 bg-red-50 border-red-200 text-red-800 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-bold flex items-center">
                <BellRing className="mr-2 h-6 w-6 animate-pulse" /> Rappels de Tâches !
              </CardTitle>
            </CardHeader>
            <CardContent>
              {reminders.map(r => (
                <div key={r.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-2 border-b last:border-b-0 last:pb-0">
                  <p className="mb-2 sm:mb-0">
                    <span className="font-semibold">{r.titre}</span> (Contact: {r.contact_name}) - Échéance: {r.date_echeance ? format(new Date(r.date_echeance), 'dd/MM/yyyy HH:mm') : 'N/A'}
                  </p>
                  <Button variant="outline" size="sm" onClick={() => dismissReminder(r.id)}>
                    Ignorer
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Affichage du numéro de téléphone à appeler */}
        {displayedPhoneNumber && (
          <Card className="mb-6 bg-blue-50 border-blue-200 text-blue-800 shadow-lg">
            <CardContent className="p-4 flex items-center justify-between">
              <p className="font-semibold text-lg flex items-center">
                <Phone className="mr-2 h-5 w-5" /> Numéro à appeler : <span className="ml-2 font-mono text-xl">{displayedPhoneNumber}</span>
              </p>
              <Button variant="ghost" size="icon" onClick={() => setDisplayedPhoneNumber(null)}>
                X
              </Button>
            </CardContent>
          </Card>
        )}

        <Card className="mb-6">
          <CardHeader className="flex flex-col md:flex-row md:justify-between md:items-center">
            <CardTitle className="text-2xl font-bold mb-4 md:mb-0">Gestion des Tâches</CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              {/* The DialogTrigger and "Ajouter une Tâche" button are removed from here */}
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>{currentTache ? 'Modifier la Tâche' : 'Ajouter une Nouvelle Tâche'}</DialogTitle>
                  <DialogDescription>
                    {currentTache ? 'Modifiez les détails de la tâche.' : 'Remplissez les informations pour créer une nouvelle tâche.'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateOrUpdateTache} className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="titre" className="text-right">
                      Titre
                    </Label>
                    <Input
                      id="titre"
                      name="titre"
                      defaultValue={currentTache?.titre || ''}
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      name="description"
                      defaultValue={currentTache?.description || ''}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="date_echeance" className="text-right">
                      Date d'échéance
                    </Label>
                    <Input
                      id="date_echeance"
                      name="date_echeance"
                      type="datetime-local"
                      defaultValue={currentTache?.date_echeance ? format(new Date(currentTache.date_echeance), "yyyy-MM-dd'T'HH:mm") : ''}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="statut" className="text-right">
                      Statut
                    </Label>
                    <Select name="statut" defaultValue={currentTache?.statut || 'en attente'}>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Sélectionner un statut" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en attente">En attente</SelectItem>
                        <SelectItem value="en cours">En cours</SelectItem>
                        <SelectItem value="terminée">Terminée</SelectItem>
                        <SelectItem value="annulée">Annulée</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="contact_id" className="text-right">
                      Contact
                    </Label>
                    <Select
                      name="contact_id"
                      defaultValue={currentTache?.contact_id?.toString() || (contacts.length > 0 ? contacts[0].id.toString() : '')}
                      required
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Sélectionner un contact" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.isArray(contacts) && contacts.length > 0 ? (
                          contacts.map((contact) => (
                            <SelectItem key={`contact-${contact.id}`} value={contact.id.toString()}>
                              {contact.nom} {contact.prenom}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem disabled value="none">Aucun contact disponible</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={loading}>
                      {loading ? 'Enregistrement...' : (currentTache ? 'Enregistrer les modifications' : 'Créer la Tâche')}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Select
                  value={selectedContactFilterId}
                  onValueChange={setSelectedContactFilterId}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Filtrer par contact" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les contacts</SelectItem>
                    {contacts.map((contact) => (
                      <SelectItem key={`filter-${contact.id}`} value={contact.id.toString()}>
                        {contact.nom} {contact.prenom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="relative flex-1">
                <Input
                  type="text"
                  placeholder="Rechercher par titre ou description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
              <div className="relative flex-1">
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="pl-10"
                />
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Label htmlFor="startDate" className="sr-only">Date de début</Label>
              </div>
              <div className="relative flex-1">
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="pl-10"
                />
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Label htmlFor="endDate" className="sr-only">Date de fin</Label>
              </div>
              <Button onClick={handleSearch} disabled={loading}>
                Rechercher
              </Button>
              <Button variant="outline" onClick={handleResetSearch} disabled={loading}>
                Réinitialiser
              </Button>
            </div>

            {loading && <p className="text-center text-muted-foreground">Chargement des tâches...</p>}
            {error && <p className="text-center text-destructive">{error}</p>}

            {!loading && !error && taches.length === 0 && (
              <p className="text-center text-muted-foreground">Aucune tâche trouvée.</p>
            )}

            {!loading && !error && taches.length > 0 && (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[150px]">Titre</TableHead>
                      <TableHead className="hidden md:table-cell">Description</TableHead>
                      <TableHead className="w-[120px]">Statut</TableHead>
                      <TableHead className="w-[150px]">Date d'échéance</TableHead>
                      <TableHead className="w-[150px]">Contact</TableHead>
                      <TableHead className="w-[150px]">Date de Création</TableHead>
                      <TableHead className="text-right w-[150px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {taches.map((tache) => (
                      <TableRow key={tache.id}>
                        <TableCell className="font-medium">{tache.titre}</TableCell>
                        <TableCell className="hidden md:table-cell max-w-[200px] truncate">
                          {tache.description || 'N/A'}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              tache.statut === 'terminée' ? 'bg-green-100 text-green-800' :
                              tache.statut === 'en cours' ? 'bg-blue-100 text-blue-800' :
                              tache.statut === 'annulée' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {tache.statut}
                          </span>
                        </TableCell>
                        <TableCell>
                          {tache.date_echeance ? format(new Date(tache.date_echeance), 'dd/MM/yyyy HH:mm') : 'N/A'}
                        </TableCell>
                        <TableCell>
                          {tache.contact_name || 'N/A'}
                        </TableCell>
                        <TableCell>
                          {format(new Date(tache.date_creation), 'dd/MM/yyyy HH:mm')}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(tache)}
                              aria-label="Edit task"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteTache(tache.id)}
                              aria-label="Delete task"
                            >
                              <Trash2 className="h-4 w-4" />
=======
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Calendar,
  Clock,
  Phone,
  User,
  Building2,
  Target,
  Bell,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Edit3,
  Save,
  X,
  Mail,
  CalendarPlus,
  PhoneCall,
  Send,
  History,
  Users,
  MapPin,
} from "lucide-react"
import Navbar from "@/components/navbarLink/nav"

interface Task {
  titre: string
  description: string
  date_echeance: string
  est_recurrente: boolean
  rappel: string
  statut: "à faire" | "en cours" | "terminé" | "annulé"
  id_opportunite: number
}

interface Opportunity {
  id: number
  nom: string
  client: string
  entreprise: string
  valeur: number
  probabilite: number
  etape: string
  telephone: string
  email: string
  adresse: string
}

interface CallLog {
  id: number
  date: string
  duree: string
  type: "entrant" | "sortant" | "manqué"
  notes: string
  resultat: string
}

interface Meeting {
  id: number
  titre: string
  date: string
  heure: string
  duree: string
  lieu: string
  participants: string[]
  notes: string
}

interface Email {
  id: number
  destinataire: string
  sujet: string
  contenu: string
  date_envoi: string
  statut: "brouillon" | "envoyé" | "lu"
}

export default function TaskPage() {
  const [task, setTask] = useState<Task>({
    titre: "Contacter client pour relance",
    description: "Appeler le client pour relancer le contrat",
    date_echeance: "2025-07-10",
    est_recurrente: false,
    rappel: "2025-07-08T10:00:00",
    statut: "à faire",
    id_opportunite: 1,
  })

  const [opportunity] = useState<Opportunity>({
    id: 1,
    nom: "Contrat logiciel entreprise",
    client: "Jean Dupont",
    entreprise: "TechCorp Solutions",
    valeur: 25000,
    probabilite: 75,
    etape: "Négociation",
    telephone: "+33 1 23 45 67 89",
    email: "jean.dupont@techcorp.fr",
    adresse: "123 Avenue des Champs, 75008 Paris",
  })

  const [isEditing, setIsEditing] = useState(false)
  const [notes, setNotes] = useState("")
  const [newNote, setNewNote] = useState("")

  // États pour les modales
  const [isCallDialogOpen, setIsCallDialogOpen] = useState(false)
  const [isMeetingDialogOpen, setIsMeetingDialogOpen] = useState(false)
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false)

  // États pour les formulaires
  const [callForm, setCallForm] = useState({
    type: "sortant" as "entrant" | "sortant" | "manqué",
    duree: "",
    notes: "",
    resultat: "",
    planifier_rappel: false,
    date_rappel: "",
  })

  const [meetingForm, setMeetingForm] = useState({
    titre: "",
    date: "",
    heure: "",
    duree: "60",
    lieu: "",
    type: "presentiel" as "presentiel" | "visio" | "telephone",
    participants: "",
    notes: "",
    rappel: true,
  })

  const [emailForm, setEmailForm] = useState({
    destinataire: opportunity.email,
    cc: "",
    sujet: "",
    contenu: "",
    priorite: "normale" as "basse" | "normale" | "haute",
    demander_accuse: false,
  })

  // Historique des interactions
  const [callHistory] = useState<CallLog[]>([
    {
      id: 1,
      date: "2025-01-05",
      duree: "15 min",
      type: "sortant",
      notes: "Discussion sur les besoins techniques",
      resultat: "Intéressé, demande un devis détaillé",
    },
    {
      id: 2,
      date: "2025-01-03",
      duree: "8 min",
      type: "entrant",
      notes: "Questions sur les fonctionnalités",
      resultat: "Planification d'une démo",
    },
  ])

  const [meetingHistory] = useState<Meeting[]>([
    {
      id: 1,
      titre: "Présentation solution",
      date: "2025-01-02",
      heure: "14:00",
      duree: "90 min",
      lieu: "Bureaux client",
      participants: ["Jean Dupont", "Marie Martin", "Commercial A"],
      notes: "Présentation bien reçue, questions sur l'intégration",
    },
  ])

  const [emailHistory] = useState<Email[]>([
    {
      id: 1,
      destinataire: "jean.dupont@techcorp.fr",
      sujet: "Proposition commerciale - Solution CRM",
      contenu: "Bonjour Jean, Suite à notre échange...",
      date_envoi: "2025-01-04",
      statut: "lu",
    },
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "à faire":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "en cours":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "terminé":
        return "bg-green-100 text-green-800 border-green-200"
      case "annulé":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "à faire":
        return <AlertCircle className="h-4 w-4" />
      case "en cours":
        return <Clock className="h-4 w-4" />
      case "terminé":
        return <CheckCircle2 className="h-4 w-4" />
      case "annulé":
        return <X className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("fr-FR", {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleStatusChange = (newStatus: string) => {
    setTask((prev) => ({ ...prev, statut: newStatus as Task["statut"] }))
  }

  const addNote = () => {
    if (newNote.trim()) {
      const timestamp = new Date().toLocaleString("fr-FR")
      setNotes((prev) => prev + `[${timestamp}] ${newNote}\n`)
      setNewNote("")
    }
  }

  const handleCallSubmit = () => {
    console.log("Enregistrement de l'appel:", callForm)
    // Ici vous ajouteriez la logique pour sauvegarder l'appel
    setIsCallDialogOpen(false)
    setCallForm({
      type: "sortant",
      duree: "",
      notes: "",
      resultat: "",
      planifier_rappel: false,
      date_rappel: "",
    })
  }

  const handleMeetingSubmit = () => {
    console.log("Planification de la réunion:", meetingForm)
    // Ici vous ajouteriez la logique pour créer la réunion
    setIsMeetingDialogOpen(false)
    setMeetingForm({
      titre: "",
      date: "",
      heure: "",
      duree: "60",
      lieu: "",
      type: "presentiel",
      participants: "",
      notes: "",
      rappel: true,
    })
  }

  const handleEmailSubmit = () => {
    console.log("Envoi de l'email:", emailForm)
    // Ici vous ajouteriez la logique pour envoyer l'email
    setIsEmailDialogOpen(false)
    setEmailForm({
      destinataire: opportunity.email,
      cc: "",
      sujet: "",
      contenu: "",
      priorite: "normale",
      demander_accuse: false,
    })
  }

  return (
    <div className="flex min-h-screen bg-gray-100 text-gray-800">
      <Navbar />
      <div className="min-h-screen bg-gray-50 p-4 w-full">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestion de Tâche</h1>
              <p className="text-gray-600 mt-1">Suivi et gestion des activités commerciales</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
                <Edit3 className="h-4 w-4 mr-2" />
                {isEditing ? "Annuler" : "Modifier"}
              </Button>
              {isEditing && (
                <Button onClick={() => setIsEditing(false)}>
                  <Save className="h-4 w-4 mr-2" />
                  Sauvegarder
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Détails de la tâche */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle className="text-xl">{task.titre}</CardTitle>
                      <CardDescription>{task.description}</CardDescription>
                    </div>
                    <Badge className={`${getStatusColor(task.statut)} flex items-center gap-1`}>
                      {getStatusIcon(task.statut)}
                      {task.statut}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">Date d'échéance</p>
                        <p className="text-sm text-gray-600">{formatDate(task.date_echeance)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Bell className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">Rappel</p>
                        <p className="text-sm text-gray-600">{formatDateTime(task.rappel)}</p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <label className="text-sm font-medium">Changer le statut</label>
                    <Select value={task.statut} onValueChange={handleStatusChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="à faire">À faire</SelectItem>
                        <SelectItem value="en cours">En cours</SelectItem>
                        <SelectItem value="terminé">Terminé</SelectItem>
                        <SelectItem value="annulé">Annulé</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Notes et commentaires */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Notes et Commentaires
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Textarea
                      placeholder="Ajouter une note..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      rows={3}
                    />
                    <Button onClick={addNote} size="sm">
                      Ajouter une note
                    </Button>
                  </div>
                  {notes && (
                    <div className="bg-gray-50 p-3 rounded-md">
                      <h4 className="font-medium mb-2">Historique des notes</h4>
                      <pre className="text-sm text-gray-700 whitespace-pre-wrap">{notes}</pre>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Historique des interactions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5" />
                    Historique des Interactions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="calls" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="calls">Appels</TabsTrigger>
                      <TabsTrigger value="meetings">Réunions</TabsTrigger>
                      <TabsTrigger value="emails">Emails</TabsTrigger>
                    </TabsList>

                    <TabsContent value="calls" className="space-y-3">
                      {callHistory.map((call) => (
                        <div key={call.id} className="border rounded-lg p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-blue-500" />
                              <span className="font-medium">
                                {call.type === "sortant"
                                  ? "Appel sortant"
                                  : call.type === "entrant"
                                    ? "Appel entrant"
                                    : "Appel manqué"}
                              </span>
                            </div>
                            <div className="text-sm text-gray-500">
                              {new Date(call.date).toLocaleDateString("fr-FR")} - {call.duree}
                            </div>
                          </div>
                          <p className="text-sm text-gray-600">{call.notes}</p>
                          <p className="text-sm font-medium text-green-600">Résultat: {call.resultat}</p>
                        </div>
                      ))}
                    </TabsContent>

                    <TabsContent value="meetings" className="space-y-3">
                      {meetingHistory.map((meeting) => (
                        <div key={meeting.id} className="border rounded-lg p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-purple-500" />
                              <span className="font-medium">{meeting.titre}</span>
                            </div>
                            <div className="text-sm text-gray-500">
                              {new Date(meeting.date).toLocaleDateString("fr-FR")} à {meeting.heure}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="h-3 w-3" />
                            {meeting.lieu} - {meeting.duree}
                          </div>
                          <p className="text-sm text-gray-600">{meeting.notes}</p>
                          <div className="text-xs text-gray-500">Participants: {meeting.participants.join(", ")}</div>
                        </div>
                      ))}
                    </TabsContent>

                    <TabsContent value="emails" className="space-y-3">
                      {emailHistory.map((email) => (
                        <div key={email.id} className="border rounded-lg p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-green-500" />
                              <span className="font-medium">{email.sujet}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={email.statut === "lu" ? "default" : "secondary"}>{email.statut}</Badge>
                              <span className="text-sm text-gray-500">
                                {new Date(email.date_envoi).toLocaleDateString("fr-FR")}
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600">À: {email.destinataire}</p>
                          <p className="text-sm text-gray-600">{email.contenu.substring(0, 100)}...</p>
                        </div>
                      ))}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar - Informations liées */}
            <div className="space-y-6">
              {/* Opportunité liée */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Opportunité Liée
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium">Nom de l'opportunité</p>
                      <p className="text-sm text-gray-600">{opportunity.nom}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <User className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">Contact</p>
                        <p className="text-sm text-gray-600">{opportunity.client}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Building2 className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">Entreprise</p>
                        <p className="text-sm text-gray-600">{opportunity.entreprise}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">Téléphone</p>
                        <p className="text-sm text-gray-600">{opportunity.telephone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">Email</p>
                        <p className="text-sm text-gray-600">{opportunity.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">Adresse</p>
                        <p className="text-sm text-gray-600">{opportunity.adresse}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-sm font-medium">Valeur</p>
                        <p className="text-sm text-gray-600">{opportunity.valeur.toLocaleString("fr-FR")} €</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Probabilité</p>
                        <p className="text-sm text-gray-600">{opportunity.probabilite}%</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Étape</p>
                      <Badge variant="outline">{opportunity.etape}</Badge>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full bg-transparent">
                    Voir l'opportunité
                  </Button>
                </CardContent>
              </Card>

              {/* Actions rapides */}
              <Card>
                <CardHeader>
                  <CardTitle>Actions Rapides</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {/* Appeler le client */}
                  <Dialog open={isCallDialogOpen} onOpenChange={setIsCallDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                        <Phone className="h-4 w-4 mr-2" />
                        Appeler le client
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <PhoneCall className="h-5 w-5" />
                          Enregistrer un appel
                        </DialogTitle>
                        <DialogDescription>
                          Enregistrez les détails de votre appel avec {opportunity.client}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Type d'appel</Label>
                            <Select
                              value={callForm.type}
                              onValueChange={(value: "entrant" | "sortant" | "manqué") =>
                                setCallForm((prev) => ({ ...prev, type: value }))
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="sortant">Appel sortant</SelectItem>
                                <SelectItem value="entrant">Appel entrant</SelectItem>
                                <SelectItem value="manqué">Appel manqué</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Durée (minutes)</Label>
                            <Input
                              type="number"
                              placeholder="15"
                              value={callForm.duree}
                              onChange={(e) => setCallForm((prev) => ({ ...prev, duree: e.target.value }))}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Notes de l'appel</Label>
                          <Textarea
                            placeholder="Résumé de la conversation..."
                            value={callForm.notes}
                            onChange={(e) => setCallForm((prev) => ({ ...prev, notes: e.target.value }))}
                            rows={3}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Résultat / Prochaines étapes</Label>
                          <Textarea
                            placeholder="Que s'est-il passé ? Quelles sont les prochaines étapes ?"
                            value={callForm.resultat}
                            onChange={(e) => setCallForm((prev) => ({ ...prev, resultat: e.target.value }))}
                            rows={2}
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="rappel"
                            checked={callForm.planifier_rappel}
                            onCheckedChange={(checked) => setCallForm((prev) => ({ ...prev, planifier_rappel: checked }))}
                          />
                          <Label htmlFor="rappel">Planifier un rappel</Label>
                        </div>
                        {callForm.planifier_rappel && (
                          <div className="space-y-2">
                            <Label>Date du rappel</Label>
                            <Input
                              type="datetime-local"
                              value={callForm.date_rappel}
                              onChange={(e) => setCallForm((prev) => ({ ...prev, date_rappel: e.target.value }))}
                            />
                          </div>
                        )}
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCallDialogOpen(false)}>
                          Annuler
                        </Button>
                        <Button onClick={handleCallSubmit}>Enregistrer l'appel</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  {/* Planifier une réunion */}
                  <Dialog open={isMeetingDialogOpen} onOpenChange={setIsMeetingDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                        <CalendarPlus className="h-4 w-4 mr-2" />
                        Planifier une réunion
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <CalendarPlus className="h-5 w-5" />
                          Planifier une réunion
                        </DialogTitle>
                        <DialogDescription>Organisez une réunion avec {opportunity.client}</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Titre de la réunion</Label>
                          <Input
                            placeholder="Ex: Présentation de la solution"
                            value={meetingForm.titre}
                            onChange={(e) => setMeetingForm((prev) => ({ ...prev, titre: e.target.value }))}
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label>Date</Label>
                            <Input
                              type="date"
                              value={meetingForm.date}
                              onChange={(e) => setMeetingForm((prev) => ({ ...prev, date: e.target.value }))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Heure</Label>
                            <Input
                              type="time"
                              value={meetingForm.heure}
                              onChange={(e) => setMeetingForm((prev) => ({ ...prev, heure: e.target.value }))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Durée (min)</Label>
                            <Select
                              value={meetingForm.duree}
                              onValueChange={(value) => setMeetingForm((prev) => ({ ...prev, duree: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="30">30 min</SelectItem>
                                <SelectItem value="60">1 heure</SelectItem>
                                <SelectItem value="90">1h30</SelectItem>
                                <SelectItem value="120">2 heures</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Type de réunion</Label>
                          <RadioGroup
                            value={meetingForm.type}
                            onValueChange={(value: "presentiel" | "visio" | "telephone") =>
                              setMeetingForm((prev) => ({ ...prev, type: value }))
                            }
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="presentiel" id="presentiel" />
                              <Label htmlFor="presentiel">En présentiel</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="visio" id="visio" />
                              <Label htmlFor="visio">Visioconférence</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="telephone" id="telephone" />
                              <Label htmlFor="telephone">Téléphone</Label>
                            </div>
                          </RadioGroup>
                        </div>
                        <div className="space-y-2">
                          <Label>Lieu / Lien</Label>
                          <Input
                            placeholder={
                              meetingForm.type === "presentiel"
                                ? "Adresse du lieu"
                                : meetingForm.type === "visio"
                                  ? "Lien de la visio"
                                  : "Numéro de téléphone"
                            }
                            value={meetingForm.lieu}
                            onChange={(e) => setMeetingForm((prev) => ({ ...prev, lieu: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Participants (emails séparés par des virgules)</Label>
                          <Input
                            placeholder="jean.dupont@techcorp.fr, marie.martin@techcorp.fr"
                            value={meetingForm.participants}
                            onChange={(e) => setMeetingForm((prev) => ({ ...prev, participants: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Notes / Ordre du jour</Label>
                          <Textarea
                            placeholder="Objectifs de la réunion, points à aborder..."
                            value={meetingForm.notes}
                            onChange={(e) => setMeetingForm((prev) => ({ ...prev, notes: e.target.value }))}
                            rows={3}
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="rappel-meeting"
                            checked={meetingForm.rappel}
                            onCheckedChange={(checked) => setMeetingForm((prev) => ({ ...prev, rappel: checked }))}
                          />
                          <Label htmlFor="rappel-meeting">Envoyer un rappel 24h avant</Label>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsMeetingDialogOpen(false)}>
                          Annuler
                        </Button>
                        <Button onClick={handleMeetingSubmit}>Planifier la réunion</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  {/* Envoyer un email */}
                  <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                        <Mail className="h-4 w-4 mr-2" />
                        Envoyer un email
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <Send className="h-5 w-5" />
                          Composer un email
                        </DialogTitle>
                        <DialogDescription>Envoyer un email à {opportunity.client}</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Destinataire</Label>
                            <Input
                              type="email"
                              value={emailForm.destinataire}
                              onChange={(e) => setEmailForm((prev) => ({ ...prev, destinataire: e.target.value }))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>CC (optionnel)</Label>
                            <Input
                              type="email"
                              placeholder="email1@example.com, email2@example.com"
                              value={emailForm.cc}
                              onChange={(e) => setEmailForm((prev) => ({ ...prev, cc: e.target.value }))}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Sujet</Label>
                          <Input
                            placeholder="Objet de votre email"
                            value={emailForm.sujet}
                            onChange={(e) => setEmailForm((prev) => ({ ...prev, sujet: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Message</Label>
                          <Textarea
                            placeholder="Bonjour Jean,&#10;&#10;J'espère que vous allez bien...&#10;&#10;Cordialement,"
                            value={emailForm.contenu}
                            onChange={(e) => setEmailForm((prev) => ({ ...prev, contenu: e.target.value }))}
                            rows={8}
                            className="min-h-[200px]"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Priorité</Label>
                            <Select
                              value={emailForm.priorite}
                              onValueChange={(value: "basse" | "normale" | "haute") =>
                                setEmailForm((prev) => ({ ...prev, priorite: value }))
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="basse">Basse</SelectItem>
                                <SelectItem value="normale">Normale</SelectItem>
                                <SelectItem value="haute">Haute</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex items-center space-x-2 pt-6">
                            <Switch
                              id="accuse"
                              checked={emailForm.demander_accuse}
                              onCheckedChange={(checked) =>
                                setEmailForm((prev) => ({ ...prev, demander_accuse: checked }))
                              }
                            />
                            <Label htmlFor="accuse">Demander un accusé de réception</Label>
                          </div>
                        </div>

                        {/* Templates d'email */}
                        <div className="space-y-2">
                          <Label>Templates rapides</Label>
                          <div className="flex flex-wrap gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setEmailForm((prev) => ({
                                  ...prev,
                                  sujet: "Suivi de notre échange",
                                  contenu: `Bonjour ${opportunity.client},\n\nJ'espère que vous allez bien.\n\nSuite à notre dernière conversation, je souhaitais faire le point avec vous sur l'avancement de votre projet.\n\nSeriez-vous disponible pour un échange téléphonique cette semaine ?\n\nCordialement,\n[Votre nom]`,
                                }))
                              }
                            >
                              Suivi commercial
>>>>>>> 8b2940889050358626fa300ab5200aa6a170e0bb
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
<<<<<<< HEAD
                              onClick={() => handleCallContact(tache)}
                              disabled={!tache.contact_phone || tache.statut === 'terminée'}
                              aria-label="Call contact"
                            >
                              <Phone className="h-4 w-4 mr-1" /> Rappeler
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
=======
                              onClick={() =>
                                setEmailForm((prev) => ({
                                  ...prev,
                                  sujet: "Proposition commerciale",
                                  contenu: `Bonjour ${opportunity.client},\n\nComme convenu, vous trouverez ci-joint notre proposition commerciale pour votre projet.\n\nN'hésitez pas à me contacter si vous avez des questions.\n\nJe reste à votre disposition pour organiser une présentation détaillée.\n\nCordialement,\n[Votre nom]`,
                                }))
                              }
                            >
                              Proposition
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setEmailForm((prev) => ({
                                  ...prev,
                                  sujet: "Relance - En attente de votre retour",
                                  contenu: `Bonjour ${opportunity.client},\n\nJ'espère que vous allez bien.\n\nJe me permets de revenir vers vous concernant notre proposition envoyée le [date].\n\nAvez-vous eu l'occasion de l'examiner ? Y a-t-il des points que vous souhaiteriez clarifier ?\n\nJe reste à votre entière disposition.\n\nCordialement,\n[Votre nom]`,
                                }))
                              }
                            >
                              Relance
                            </Button>
                          </div>
                        </div>
                      </div>
                      <DialogFooter className="flex gap-2">
                        <Button variant="outline" onClick={() => setIsEmailDialogOpen(false)}>
                          Annuler
                        </Button>
                        <Button variant="outline" onClick={() => console.log("Sauvegarde en brouillon")}>
                          Sauvegarder en brouillon
                        </Button>
                        <Button onClick={handleEmailSubmit}>
                          <Send className="h-4 w-4 mr-2" />
                          Envoyer
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>

              {/* Informations système */}
              <Card>
                <CardHeader>
                  <CardTitle>Informations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>ID Tâche:</span>
                    <span>#{Math.floor(Math.random() * 1000) + 1}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Créée le:</span>
                    <span>{new Date().toLocaleDateString("fr-FR")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Assignée à:</span>
                    <span>Commercial A</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Récurrente:</span>
                    <span>{task.est_recurrente ? "Oui" : "Non"}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>

  )
}


>>>>>>> 8b2940889050358626fa300ab5200aa6a170e0bb
