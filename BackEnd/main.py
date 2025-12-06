from fastapi import FastAPI, HTTPException, status, Depends
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from typing import Dict, Optional
from nanoid import generate as nanoid
import socketio
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update

from models import (
    Room as RoomModel, CodeExecutionResult,
    UpdateCodeRequest, UpdateLanguageRequest, ExecuteCodeRequest,
    ConnectedUsersResponse
)
from db_models import Room as RoomDB
from database import get_db, engine, Base

# Initialize FastAPI
api = FastAPI(title="CollabCode API", version="1.0.0")

# CORS for REST API
api.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Socket.IO
sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')
# Wrap FastAPI with Socket.IO
app = socketio.ASGIApp(sio, api)

# Track which room a socket ID is in for disconnect handling (keep in-memory for ephemeral mapping)
sid_to_room: Dict[str, str] = {}

def get_default_code() -> str:
    return """// Welcome to CodeSync!
// Start coding your solution here.

function solve(input) {
  // Your code here
  console.log("Hello from CodeSync!");
  return input;
}

# Test your solution
console.log(solve("Hello, World!"));
"""

# ==========================================
# Socket.IO Events
# ==========================================

@sio.event
async def connect(sid, environ):
    print(f"Socket connected: {sid}")

@sio.event
async def disconnect(sid):
    print(f"Socket disconnected: {sid}")
    if sid in sid_to_room:
        room_id = sid_to_room[sid]
        del sid_to_room[sid]
        
        # We need a new session here since we are outside of request context
        async with AsyncSession(engine) as session:
            stmt = select(RoomDB).where(RoomDB.id == room_id)
            result = await session.execute(stmt)
            room = result.scalar_one_or_none()
            
            if room:
                if room.connected_users > 0:
                    room.connected_users -= 1
                    await session.commit()
                
                # Broadcast new user count
                await sio.emit('user_count_update', room.connected_users, room=room_id)

@sio.event
async def join_room(sid, room_id):
    print(f"Socket {sid} joining room {room_id}")
    
    async with AsyncSession(engine) as session:
        # Check if room exists
        stmt = select(RoomDB).where(RoomDB.id == room_id)
        result = await session.execute(stmt)
        room = result.scalar_one_or_none()

        # Create room if it doesn't exist
        if not room:
            room = RoomDB(
                id=room_id,
                code=get_default_code(),
                language="javascript",
                created_at=datetime.now(),
                connected_users=0
            )
            session.add(room)
            await session.commit()
        
        await sio.enter_room(sid, room_id)
        sid_to_room[sid] = room_id
        
        # Increment user count
        room.connected_users += 1
        await session.commit()
        
        # Broadcast new user count
        await sio.emit('user_count_update', room.connected_users, room=room_id)

@sio.event
async def leave_room(sid, room_id):
    await sio.leave_room(sid, room_id)
    if sid in sid_to_room:
        del sid_to_room[sid]
    
    async with AsyncSession(engine) as session:
        stmt = select(RoomDB).where(RoomDB.id == room_id)
        result = await session.execute(stmt)
        room = result.scalar_one_or_none()

        if room:
            if room.connected_users > 0:
                room.connected_users -= 1
                await session.commit()
            await sio.emit('user_count_update', room.connected_users, room=room_id)

@sio.event
async def code_change(sid, data):
    # data: {roomId: str, code: str}
    room_id = data.get('roomId')
    new_code = data.get('code')
    
    if room_id and new_code is not None:
        async with AsyncSession(engine) as session:
            stmt = select(RoomDB).where(RoomDB.id == room_id)
            result = await session.execute(stmt)
            room = result.scalar_one_or_none()
            
            if room:
                room.code = new_code
                await session.commit()

        # Broadcast to everyone ELSE in the room
        await sio.emit('code_change', new_code, room=room_id, skip_sid=sid)

@sio.event
async def language_change(sid, data):
    # data: {roomId: str, language: str}
    room_id = data.get('roomId')
    new_lang = data.get('language')
    
    if room_id and new_lang:
        async with AsyncSession(engine) as session:
             stmt = select(RoomDB).where(RoomDB.id == room_id)
             result = await session.execute(stmt)
             room = result.scalar_one_or_none()
             
             if room:
                room.language = new_lang
                await session.commit()
                
        await sio.emit('language_change', new_lang, room=room_id, skip_sid=sid)

# ==========================================
# REST API Routes
# ==========================================

@api.get("/")
async def root():
    return {"message": "Welcome to CollabCode API", "docs": "/docs"}

@api.post("/rooms", response_model=RoomModel, status_code=status.HTTP_201_CREATED)
async def create_room(db: AsyncSession = Depends(get_db)):
    room_id = nanoid(size=10)
    room = RoomDB(
        id=room_id,
        code=get_default_code(),
        language="javascript",
        created_at=datetime.now(),
        connected_users=0
    )
    db.add(room)
    await db.commit()
    await db.refresh(room)
    
    return RoomModel(
        id=room.id,
        code=room.code,
        language=room.language,
        createdAt=room.created_at,
        connectedUsers=room.connected_users
    )

@api.get("/rooms/{room_id}", response_model=RoomModel)
async def get_room(room_id: str, db: AsyncSession = Depends(get_db)):
    stmt = select(RoomDB).where(RoomDB.id == room_id)
    result = await db.execute(stmt)
    room = result.scalar_one_or_none()

    if not room:
         # Create on getter if not exists logic (kept from original)
        room = RoomDB(
            id=room_id,
            code=get_default_code(),
            language="javascript",
            created_at=datetime.now(),
            connected_users=0
        )
        db.add(room)
        await db.commit()
        await db.refresh(room)
    
    return RoomModel(
        id=room.id,
        code=room.code,
        language=room.language,
        createdAt=room.created_at,
        connectedUsers=room.connected_users
    )

# Keep these for compatibility, but Socket.IO handles real-time mostly now
@api.post("/rooms/{room_id}/join", response_model=RoomModel)
async def http_join_room(room_id: str, db: AsyncSession = Depends(get_db)):
    # This might be redundant with socket join, but good for initial fetch
    stmt = select(RoomDB).where(RoomDB.id == room_id)
    result = await db.execute(stmt)
    room = result.scalar_one_or_none()
    
    if not room:
        room = RoomDB(
            id=room_id,
            code=get_default_code(),
            language="javascript",
            created_at=datetime.now(),
            connected_users=0
        )
        db.add(room)
        await db.commit()
        await db.refresh(room)

    return RoomModel(
        id=room.id,
        code=room.code,
        language=room.language,
        createdAt=room.created_at,
        connectedUsers=room.connected_users
    )

@api.post("/rooms/{room_id}/leave")
async def http_leave_room(room_id: str):
    # Stateless leave, mostly no-op if we rely on socket
    return {"message": "Left room"}

@api.put("/rooms/{room_id}/code")
async def update_room_code(room_id: str, request: UpdateCodeRequest, db: AsyncSession = Depends(get_db)):
    stmt = select(RoomDB).where(RoomDB.id == room_id)
    result = await db.execute(stmt)
    room = result.scalar_one_or_none()

    if room:
        room.code = request.code
        await db.commit()
        # We could broadcast from here too if updated via REST
        await sio.emit('code_change', request.code, room=room_id)
    return {"message": "Code updated"}

@api.put("/rooms/{room_id}/language")
async def update_room_language(room_id: str, request: UpdateLanguageRequest, db: AsyncSession = Depends(get_db)):
    stmt = select(RoomDB).where(RoomDB.id == room_id)
    result = await db.execute(stmt)
    room = result.scalar_one_or_none()

    if room:
        room.language = request.language
        await db.commit()
        await sio.emit('language_change', request.language, room=room_id)
    return {"message": "Language updated"}

@api.get("/rooms/{room_id}/users/count", response_model=ConnectedUsersResponse)
async def get_connected_users(room_id: str, db: AsyncSession = Depends(get_db)):
    stmt = select(RoomDB).where(RoomDB.id == room_id)
    result = await db.execute(stmt)
    room = result.scalar_one_or_none()
    
    count = 0
    if room:
        count = room.connected_users
    return ConnectedUsersResponse(count=count)

@api.post("/execute", response_model=CodeExecutionResult)
async def execute_code(request: ExecuteCodeRequest):
    # Mock execution
    result = CodeExecutionResult(
        output=f"Executed {request.language} code.\n\n[Mock Output]\nHello World! (Shared)",
        error=None
    )
    
    # Broadcast to room
    if request.roomId:
        await sio.emit('code_output', result.dict(), room=request.roomId)
        
    return result

if __name__ == "__main__":
    import uvicorn
    # Run the wrapped Socket.IO app
    uvicorn.run(app, host="0.0.0.0", port=8000)
