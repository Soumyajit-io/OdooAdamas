from datetime import date
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class PayrollResponse(BaseModel):
    id: UUID
    user_id: str
    base_salary: float
    allowances: float
    deductions: float
    net_salary: float
    pay_period_start: date
    pay_period_end: date


class PayrollUpdateAdmin(BaseModel):
    base_salary: Optional[float] = None
    allowances: Optional[float] = None
    deductions: Optional[float] = None
