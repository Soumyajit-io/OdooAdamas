import uuid
from datetime import date, datetime
from decimal import Decimal
from typing import List, Optional

from pydantic import BaseModel

from app.models import AttendanceStatus


class AttendanceRecordResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    date: date
    check_in_time: Optional[datetime]
    check_out_time: Optional[datetime]
    work_hours: Optional[Decimal]
    extra_hours: Optional[Decimal]
    status: AttendanceStatus


class MyAttendanceSummaryResponse(BaseModel):
    days_present: int
    leaves_count: int
    total_working_days: int
    records: List[AttendanceRecordResponse]
