from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class Room(BaseModel):
    id: str
    code: str
    language: str
    createdAt: datetime
    connectedUsers: int

class CodeExecutionResult(BaseModel):
    output: str
    error: Optional[str] = None

class CreateRoomRequest(BaseModel):
    pass 

class UpdateCodeRequest(BaseModel):
    code: str

class UpdateLanguageRequest(BaseModel):
    language: str

class ExecuteCodeRequest(BaseModel):
    code: str
    language: str
    roomId: str

class ConnectedUsersResponse(BaseModel):
    count: int
