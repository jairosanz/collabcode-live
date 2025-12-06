from sqlalchemy import String, Text, Integer, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime
from database import Base

class Room(Base):
    __tablename__ = "rooms"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    code: Mapped[str] = mapped_column(Text)
    language: Mapped[str] = mapped_column(String, default="javascript")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)
    connected_users: Mapped[int] = mapped_column(Integer, default=0)
