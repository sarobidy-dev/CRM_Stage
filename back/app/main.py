
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os


from database import engine, Base, test_connection
from api import utilisateur

# Routes
from api import (
    adresse,
    modificationUtilisateur,
    campagne,
    campagneEntreprise,
    contact,
    entreprise,
    haContact,
    historiqueAction,
    projetProspection,
    projetUtilisateur,
    sms,
    email,   
    email_controller, 
    tache,
    gpt
)

# Création du dossier media si nécessaire
os.makedirs("media/photos", exist_ok=True)

# Initialisation de l'application FastAPI
app = FastAPI(title="Video Call Recording API", version="1.0.0")

# Configuration CORS
origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
 


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
app.include_router(email_controller.router)
app.include_router(email.router)
app.include_router(sms.router)
app.include_router(tache.router)
app.include_router(gpt.router)
app.include_router(modificationUtilisateur.router)
app.mount("/media", StaticFiles(directory="media"), name="media")


@app.on_event("startup")
async def on_startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    await test_connection()
    

