from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from typing import Dict
from nanoid import generate as nanoid
import socketio

from models import (
    Room, CodeExecutionResult,
    UpdateCodeRequest, UpdateLanguageRequest, ExecuteCodeRequest,
    ConnectedUsersResponse
)

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

# In-memory storage
rooms: Dict[str, Room] = {}
# Track which room a socket ID is in for disconnect handling
sid_to_room: Dict[str, str] = {}

def get_default_code() -> str:
    return """// Welcome to CodeSync!
// Start coding your solution here.

function solve(input) {
  // Your code here
  console.log("Hello from CodeSync!");
  return input;
}

// Test your solution
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
        
        if room_id in rooms:
            if rooms[room_id].connectedUsers > 0:
                rooms[room_id].connectedUsers -= 1
            
            # Broadcast new user count
            await sio.emit('user_count_update', rooms[room_id].connectedUsers, room=room_id)

@sio.event
async def join_room(sid, room_id):
    print(f"Socket {sid} joining room {room_id}")
    
    # Create room if it doesn't exist (sync with REST logic behaviors)
    if room_id not in rooms:
        room = Room(
            id=room_id,
            code=get_default_code(),
            language="javascript",
            createdAt=datetime.now(),
            connectedUsers=0
        )
        rooms[room_id] = room
    
    await sio.enter_room(sid, room_id)
    sid_to_room[sid] = room_id
    rooms[room_id].connectedUsers += 1
    
    # Broadcast new user count
    await sio.emit('user_count_update', rooms[room_id].connectedUsers, room=room_id)

@sio.event
async def leave_room(sid, room_id):
    await sio.leave_room(sid, room_id)
    if sid in sid_to_room:
        del sid_to_room[sid]
    
    if room_id in rooms:
        if rooms[room_id].connectedUsers > 0:
            rooms[room_id].connectedUsers -= 1
        await sio.emit('user_count_update', rooms[room_id].connectedUsers, room=room_id)

@sio.event
async def code_change(sid, data):
    # data: {roomId: str, code: str}
    room_id = data.get('roomId')
    new_code = data.get('code')
    
    if room_id and new_code is not None:
        if room_id in rooms:
            rooms[room_id].code = new_code
        # Broadcast to everyone ELSE in the room
        await sio.emit('code_change', new_code, room=room_id, skip_sid=sid)

@sio.event
async def language_change(sid, data):
    # data: {roomId: str, language: str}
    room_id = data.get('roomId')
    new_lang = data.get('language')
    
    if room_id and new_lang:
        if room_id in rooms:
            rooms[room_id].language = new_lang
        await sio.emit('language_change', new_lang, room=room_id, skip_sid=sid)

# ==========================================
# REST API Routes
# ==========================================

@api.get("/")
async def root():
    return {"message": "Welcome to CollabCode API", "docs": "/docs"}

@api.post("/rooms", response_model=Room, status_code=status.HTTP_201_CREATED)
async def create_room():
    room_id = nanoid(size=10)
    room = Room(
        id=room_id,
        code=get_default_code(),
        language="javascript",
        createdAt=datetime.now(),
        connectedUsers=0
    )
    rooms[room_id] = room
    return room

@api.get("/rooms/{room_id}", response_model=Room)
async def get_room(room_id: str):
    if room_id not in rooms:
        room = Room(
            id=room_id,
            code=get_default_code(),
            language="javascript",
            createdAt=datetime.now(),
            connectedUsers=0
        )
        rooms[room_id] = room
        return room
    return rooms[room_id]

# Keep these for compatibility, but Socket.IO handles real-time mostly now
@api.post("/rooms/{room_id}/join", response_model=Room)
async def http_join_room(room_id: str):
    # This might be redundant with socket join, but good for initial fetch
    if room_id not in rooms:
         room = Room(
            id=room_id,
            code=get_default_code(),
            language="javascript",
            createdAt=datetime.now(),
            connectedUsers=0
        )
         rooms[room_id] = room
    # We don't increment user count here strictly because HTTP is stateless/short-lived?
    # But the frontend calls this on load. 
    # Let's rely on Socket.IO for accurate "connected" count.
    # We just return the room data.
    return rooms[room_id]

@api.post("/rooms/{room_id}/leave")
async def http_leave_room(room_id: str):
    # Stateless leave, mostly no-op if we rely on socket
    return {"message": "Left room"}

@api.put("/rooms/{room_id}/code")
async def update_room_code(room_id: str, request: UpdateCodeRequest):
    if room_id in rooms:
        rooms[room_id].code = request.code
        # We could broadcast from here too if updated via REST
        await sio.emit('code_change', request.code, room=room_id)
    return {"message": "Code updated"}

@api.put("/rooms/{room_id}/language")
async def update_room_language(room_id: str, request: UpdateLanguageRequest):
    if room_id in rooms:
        rooms[room_id].language = request.language
        await sio.emit('language_change', request.language, room=room_id)
    return {"message": "Language updated"}

@api.get("/rooms/{room_id}/users/count", response_model=ConnectedUsersResponse)
async def get_connected_users(room_id: str):
    count = 0
    if room_id in rooms:
        count = rooms[room_id].connectedUsers
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
