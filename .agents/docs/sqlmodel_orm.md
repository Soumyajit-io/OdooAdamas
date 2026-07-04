# FastAPI SQLModel ORM

This document contains the Python implementation of the database schema using `SQLModel`. It aligns perfectly with the specifications detailed in the `architecture.md` file.

### Prerequisites
Make sure to install `sqlmodel`:
```bash
pip install sqlmodel
```

### Models Implementation (`models.py`)

```python
import enum
import uuid
from datetime import date, datetime
from decimal import Decimal
from typing import Optional
from sqlmodel import Field, SQLModel, Column, Text, Enum as SAEnum, UniqueConstraint

# -----------------
# ENUM Definitions
# -----------------
class UserRole(str, enum.Enum):
    ADMIN = "ADMIN"
    EMPLOYEE = "EMPLOYEE"

class AttendanceStatus(str, enum.Enum):
    PRESENT = "PRESENT"
    ABSENT = "ABSENT"
    HALF_DAY = "HALF_DAY"
    LEAVE = "LEAVE"

class LeaveStatus(str, enum.Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"

class LeaveType(str, enum.Enum):
    PAID = "PAID"
    SICK = "SICK"
    UNPAID = "UNPAID"

# -----------------
# Database Models
# -----------------

class User(SQLModel, table=True):
    __tablename__ = "users"
    
    id: str = Field(primary_key=True, description="Clerk User ID (user_xxx)")
    employee_id: str = Field(max_length=20, unique=True, nullable=False)
    email: str = Field(max_length=255, unique=True, nullable=False)
    role: UserRole = Field(sa_column=Column(SAEnum(UserRole), nullable=False))
    
    first_name: Optional[str] = Field(default=None, max_length=100)
    last_name: Optional[str] = Field(default=None, max_length=100)
    phone: Optional[str] = Field(default=None, max_length=20)
    address: Optional[str] = Field(default=None, sa_column=Column(Text))
    profile_picture_url: Optional[str] = Field(default=None, sa_column=Column(Text))
    
    job_title: Optional[str] = Field(default=None, max_length=100)
    department: Optional[str] = Field(default=None, max_length=100)
    joining_date: Optional[date] = Field(default_factory=date.today)
    is_active: bool = Field(default=True)
    
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = Field(default_factory=datetime.utcnow)


class Attendance(SQLModel, table=True):
    __tablename__ = "attendance"
    __table_args__ = (
        UniqueConstraint("user_id", "date", name="uq_attendance_user_date"),
    )

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: str = Field(foreign_key="users.id", nullable=False)
    date: date = Field(nullable=False)
    check_in: Optional[datetime] = Field(default=None)
    check_out: Optional[datetime] = Field(default=None)
    working_hours: Optional[Decimal] = Field(default=None, max_digits=4, decimal_places=2)
    status: AttendanceStatus = Field(sa_column=Column(SAEnum(AttendanceStatus), nullable=False))
    
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)


class LeaveRequest(SQLModel, table=True):
    __tablename__ = "leave_requests"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: str = Field(foreign_key="users.id", nullable=False)
    leave_type: LeaveType = Field(sa_column=Column(SAEnum(LeaveType), nullable=False))
    start_date: date = Field(nullable=False)
    end_date: date = Field(nullable=False)
    status: LeaveStatus = Field(sa_column=Column(SAEnum(LeaveStatus)), default=LeaveStatus.PENDING)
    remarks: Optional[str] = Field(default=None, sa_column=Column(Text))
    
    approved_by: Optional[str] = Field(default=None, foreign_key="users.id")
    admin_comments: Optional[str] = Field(default=None, sa_column=Column(Text))
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)


class Payroll(SQLModel, table=True):
    __tablename__ = "payroll"
    __table_args__ = (
        UniqueConstraint("user_id", "pay_period_start", "pay_period_end", name="uq_payroll_period"),
    )

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: str = Field(foreign_key="users.id", nullable=False)
    
    base_salary: Decimal = Field(nullable=False, max_digits=12, decimal_places=2)
    allowances: Decimal = Field(default=Decimal("0.00"), max_digits=12, decimal_places=2)
    deductions: Decimal = Field(default=Decimal("0.00"), max_digits=12, decimal_places=2)
    net_salary: Decimal = Field(nullable=False, max_digits=12, decimal_places=2)
    
    pay_period_start: date = Field(nullable=False)
    pay_period_end: date = Field(nullable=False)
    generated_at: Optional[datetime] = Field(default_factory=datetime.utcnow)


class Document(SQLModel, table=True):
    __tablename__ = "documents"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: str = Field(foreign_key="users.id", nullable=False)
    document_name: str = Field(max_length=255, nullable=False)
    document_url: str = Field(sa_column=Column(Text), nullable=False)
    uploaded_at: Optional[datetime] = Field(default_factory=datetime.utcnow)


class Announcement(SQLModel, table=True):
    __tablename__ = "announcements"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    title: str = Field(max_length=255, nullable=False)
    content: str = Field(sa_column=Column(Text), nullable=False)
    created_by: Optional[str] = Field(default=None, foreign_key="users.id")
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
```
