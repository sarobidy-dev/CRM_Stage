from pydantic import BaseModel


class HAContactCreate(BaseModel):
    ha_id: int
    contact_id: int


class HAContactRead(BaseModel):
    id: int
    ha_id: int
    contact_id: int

    class Config:
        orm_mode = True
