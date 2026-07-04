from datetime import date, datetime
from enum import Enum
from typing import Optional
from uuid import UUID

from pydantic import BaseModel

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
