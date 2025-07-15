from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

# Database & Models
from database import engine, Base, test_connection

# Routes
from api import (
    Utilisateur
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
app.include_router(Utilisateur.router)
# app.include_router(contact.router)
# app.include_router(entreprise.router)
# app.include_router(interaction.router)
# app.include_router(opportunite.router)
# app.include_router(tache.router)
# app.include_router(email_controller.router)
# app.include_router(video_calls.router)

app.mount("/media", StaticFiles(directory="media"), name="media")

# Création des tables à la startup
@app.on_event("startup")
async def on_startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    await test_connection()
    

