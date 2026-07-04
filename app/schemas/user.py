from enum import Enum
from typing import Optional

from pydantic import BaseModel, EmailStr


class UserRole(str, Enum):
    ADMIN = "ADMIN"
    EMPLOYEE = "EMPLOYEE"


class UserBasicInfo(BaseModel):
    id: str
    employee_id: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: EmailStr
    job_title: Optional[str] = None
    role: UserRole


class UserResponse(BaseModel):
    id: str
    employee_id: Optional[str] = None
    email: EmailStr
    role: UserRole
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    profile_picture_url: Optional[str] = None
    job_title: Optional[str] = None


class UserUpdateSelf(BaseModel):
    phone: Optional[str] = None
    address: Optional[str] = None


class UserUpdateAdmin(BaseModel):
    employee_id: Optional[str] = None
    job_title: Optional[str] = None
    role: Optional[UserRole] = None
