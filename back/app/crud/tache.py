from sqlalchemy.orm import Session
from sqlalchemy.ext.asyncio import AsyncSession
from models.tache import Tache
from schemas.tache import TacheCreate, TacheUpdate

def get_tache(db: Session, id_tache: int):
    return db.query(Tache).filter(Tache.id_tache == id_tache).first()

def get_taches(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Tache).offset(skip).limit(limit).all()

async def create_tache(db: AsyncSession, tache: TacheCreate):
    db_tache = Tache(**tache.dict())
    db.add(db_tache)
    await db.commit()
    await db.refresh(db_tache)
    return db_tache

def update_tache(db: Session, id_tache: int, tache_update: TacheUpdate):
    db_tache = get_tache(db, id_tache)
    if not db_tache:
        return None
    update_data = tache_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_tache, key, value)
    db.commit()
    db.refresh(db_tache)
    return db_tache

def delete_tache(db: Session, id_tache: int):
    db_tache = get_tache(db, id_tache)
    if not db_tache:
        return None
    db.delete(db_tache)
    db.commit()
    return db_tache
