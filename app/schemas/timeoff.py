import uuid
from datetime import date
from decimal import Decimal
from typing import List, Optional

from pydantic import BaseModel

from app.models import LeaveStatus, LeaveType


class TimeOffRequestCreate(BaseModel):
    leave_type: LeaveType
    start_date: date
    end_date: date
    attachment_url: Optional[str] = None


class TimeOffRequestResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    leave_type: LeaveType
    start_date: date
    end_date: date
    requested_days: Decimal
    attachment_url: Optional[str]
    status: LeaveStatus
    reviewed_by: Optional[uuid.UUID]


class LeaveAllocationResponse(BaseModel):
    year: int
    total_paid_leaves: Decimal
    used_paid_leaves: Decimal
    total_sick_leaves: Decimal
    used_sick_leaves: Decimal


class MyTimeOffResponse(BaseModel):
    allocation: Optional[LeaveAllocationResponse]
    requests: List[TimeOffRequestResponse]
