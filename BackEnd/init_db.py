import asyncio
from database import engine, Base, SessionLocal
from db_models import Room
from datetime import datetime
import argparse

async def init_db(seed: bool = False):
    async with engine.begin() as conn:
        # We don't need to create tables if using Alembic, but for a fresh init script it doesn't hurt to ensure they exist
        # However, we rely on Alembic for schema management now.
        # await conn.run_sync(Base.metadata.create_all)
        pass

    if seed:
        async with SessionLocal() as session:
            # Check if seed room exists
            room = await session.get(Room, "test-room")
            if not room:
                print("Seeding database with test-room...")
                room = Room(
                    id="test-room",
                    code="// Seeded Code\nconsole.log('Hello from Seeded Room');",
                    language="javascript",
                    created_at=datetime.now(),
                    connected_users=0
                )
                session.add(room)
                await session.commit()
                print("Database seeded successfully.")
            else:
                print("Test room already exists.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--seed", action="store_true", help="Seed the database with initial data")
    args = parser.parse_args()
    
    asyncio.run(init_db(seed=args.seed))
