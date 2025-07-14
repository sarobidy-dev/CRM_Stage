from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.interaction import Interaction
from app.schemas.interaction import InteractionCreate

async def create_interaction(session: AsyncSession, interaction_data: dict):
    interaction = Interaction(**interaction_data)
    session.add(interaction)
    await session.commit()
    await session.refresh(interaction)
    return interaction

async def get_interactions(session: AsyncSession):
    result = await session.execute(select(Interaction))
    return result.scalars().all()

async def get_interaction(session: AsyncSession, interaction_id: int):
    result = await session.execute(select(Interaction).where(Interaction.id_interaction == interaction_id))
    return result.scalar_one_or_none()

async def delete_interaction(session: AsyncSession, interaction_id: int):
    interaction = await get_interaction(session, interaction_id)
    if interaction:
        await session.delete(interaction)
        await session.commit()
        return True
    return False
