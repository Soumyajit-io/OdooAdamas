from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime
from enum import Enum
from uuid import UUID
from app.schemas.user import UserBasicInfo

class AttendanceStatus(str, Enum):
    PRESENT = "PRESENT"
    ABSENT = "ABSENT"
    HALF_DAY = "HALF_DAY"
    LEAVE = "LEAVE"

class AttendanceResponse(BaseModel):
    id: UUID
    user_id: str
    date: date
    check_in: Optional[datetime] = None
    check_out: Optional[datetime] = None
    status: AttendanceStatus

class AttendanceResponseAdmin(AttendanceResponse):
    user: Optional[UserBasicInfo] = None
