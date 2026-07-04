import uuid
from datetime import date
from decimal import Decimal
from typing import List, Optional

from pydantic import BaseModel, EmailStr

from app.models import AttendanceStatus, UserRole


class EmployeeCreateRequest(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone: Optional[str] = None
    role: UserRole


class EmployeeResponse(BaseModel):
    id: uuid.UUID
    first_name: str
    last_name: str
    email: str
    login_id: str
    role: UserRole
    current_status: AttendanceStatus
    profile_picture_url: Optional[str]


class ResumeInfoUpdate(BaseModel):
    about_me: Optional[str] = None
    job_love: Optional[str] = None
    hobbies: Optional[str] = None
    skills: Optional[List[str]] = None
    certifications: Optional[List[str]] = None


class PrivateInfoUpdate(BaseModel):
    dob: Optional[date] = None
    address: Optional[str] = None
    nationality: Optional[str] = None
    personal_email: Optional[EmailStr] = None
    gender: Optional[str] = None
    marital_status: Optional[str] = None
    bank_account_number: Optional[str] = None
    bank_name: Optional[str] = None
    ifsc_code: Optional[str] = None
    uan_no: Optional[str] = None
    emp_code: Optional[str] = None


class SalaryConfigUpdate(BaseModel):
    monthly_wage: Decimal
    working_days_per_week: int
    break_time_mins: int
