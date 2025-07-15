from pydantic import BaseModel


class CampagneEntrepriseCreate(BaseModel):
    entreprise_id: int
    campagne_id: int


class CampagneEntrepriseRead(BaseModel):
    id: int
    entreprise_id: int
    campagne_id: int

    class Config:
        orm_mode = True
