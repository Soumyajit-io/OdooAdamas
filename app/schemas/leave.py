from datetime import date, datetime
from enum import Enum
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class LeaveType(str, Enum):
    PAID = "PAID"
    SICK = "SICK"
    UNPAID = "UNPAID"


class LeaveStatus(str, Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"


class LeaveCreate(BaseModel):
    leave_type: LeaveType
    start_date: date
    end_date: date
    remarks: Optional[str] = None


class LeaveResponse(BaseModel):
    id: UUID
    user_id: str
    leave_type: LeaveType
    start_date: date
    end_date: date
    status: LeaveStatus
    remarks: Optional[str] = None
    admin_comments: Optional[str] = None
    created_at: datetime


class LeaveStatusUpdate(BaseModel):
    status: LeaveStatus
    admin_comments: Optional[str] = None
