from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

# Database & Models
from database import engine, Base, test_connection

# Routes
from api import (
    adresse,
    campagne,
    campagneEntreprise,
    contact,
    entreprise,
    haContact,
    historiqueAction,
    projetProspection,
    projetUtilisateur,
    utilisateur   
)

# Création du dossier media si nécessaire
os.makedirs("media/photos", exist_ok=True)

# Initialisation de l'application FastAPI
app = FastAPI(title="Video Call Recording API", version="1.0.0")

# Configuration CORS
origins = ["http://localhost:3000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
 
# Inclusion des routes

app.include_router(adresse.router)
app.include_router(campagne.router)
app.include_router(campagneEntreprise.router)
app.include_router(contact.router)
app.include_router(entreprise.router)
app.include_router(haContact.router)
app.include_router(historiqueAction.router)
app.include_router(projetProspection.router)
app.include_router(projetUtilisateur.router)
app.include_router(utilisateur.router)


app.mount("/media", StaticFiles(directory="media"), name="media")

# Création des tables à la startup
@app.on_event("startup")
async def on_startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    await test_connection()
    

