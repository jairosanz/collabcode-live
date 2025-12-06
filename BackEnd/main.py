from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from typing import Dict
from nanoid import generate as nanoid

from models import (
    Room, CodeExecutionResult, CodeExecutionResult,
    UpdateCodeRequest, UpdateLanguageRequest, ExecuteCodeRequest,
    ConnectedUsersResponse
)

app = FastAPI(title="CollabCode API", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for now
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Welcome to CollabCode API", "docs": "/docs"}

# In-memory storage
rooms: Dict[str, Room] = {}

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

@app.post("/rooms", response_model=Room, status_code=status.HTTP_201_CREATED)
async def create_room():
    room_id = nanoid(size=10)
    room = Room(
        id=room_id,
        code=get_default_code(),
        language="javascript",
        createdAt=datetime.now(),
        connectedUsers=1
    )
    rooms[room_id] = room
    return room

@app.get("/rooms/{room_id}", response_model=Room)
async def get_room(room_id: str):
    if room_id not in rooms:
        # Create it if it doesn't exist (mock behavior matching frontend api.ts)
        room = Room(
            id=room_id,
            code=get_default_code(),
            language="javascript",
            createdAt=datetime.now(),
            connectedUsers=1
        )
        rooms[room_id] = room
        return room
    return rooms[room_id]

@app.post("/rooms/{room_id}/join", response_model=Room)
async def join_room(room_id: str):
    if room_id not in rooms:
       # If room doesn't exist, create it via get logic
       # Recursing to get_room is async, so we just call the logic or helper
       # Let's just use the same logic
        room = Room(
            id=room_id,
            code=get_default_code(),
            language="javascript",
            createdAt=datetime.now(),
            connectedUsers=1
        )
        rooms[room_id] = room
        return room
    
    rooms[room_id].connectedUsers += 1
    return rooms[room_id]

@app.post("/rooms/{room_id}/leave")
async def leave_room(room_id: str):
    if room_id in rooms and rooms[room_id].connectedUsers > 0:
        rooms[room_id].connectedUsers -= 1
    return {"message": "Left room"}

@app.put("/rooms/{room_id}/code")
async def update_room_code(room_id: str, request: UpdateCodeRequest):
    if room_id in rooms:
        rooms[room_id].code = request.code
    return {"message": "Code updated"}

@app.put("/rooms/{room_id}/language")
async def update_room_language(room_id: str, request: UpdateLanguageRequest):
    if room_id in rooms:
        rooms[room_id].language = request.language
    return {"message": "Language updated"}

@app.get("/rooms/{room_id}/users/count", response_model=ConnectedUsersResponse)
async def get_connected_users(room_id: str):
    count = 1
    if room_id in rooms:
        count = rooms[room_id].connectedUsers
    return ConnectedUsersResponse(count=count)

@app.post("/execute", response_model=CodeExecutionResult)
async def execute_code(request: ExecuteCodeRequest):
    # Mock execution
    return CodeExecutionResult(
        output=f"Executed {request.language} code.\n\n[Mock Output]\nHello World!",
        error=None
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
