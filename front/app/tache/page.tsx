"use client"

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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
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
