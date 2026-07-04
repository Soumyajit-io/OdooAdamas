import datetime
import enum
import uuid
from decimal import Decimal
from typing import Optional

from sqlmodel import JSON, Column, Field, SQLModel, Text, UniqueConstraint
from sqlmodel import Enum as SAEnum


# -----------------
# ENUM Definitions
# -----------------
class UserRole(str, enum.Enum):
    ADMIN = "ADMIN"
    HR = "HR"
    EMPLOYEE = "EMPLOYEE"


class AttendanceStatus(str, enum.Enum):
    PRESENT = "PRESENT"
    ABSENT = "ABSENT"
    HALF_DAY = "HALF_DAY"
    ON_LEAVE = "ON_LEAVE"
    NOT_CHECKED_IN = "NOT_CHECKED_IN"


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


class Company(SQLModel, table=True):
    __tablename__ = "companies"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    company_name: str = Field(max_length=255, nullable=False)
    company_logo_url: Optional[str] = Field(default=None, sa_column=Column(Text))
    created_at: Optional[datetime.datetime] = Field(
        default_factory=lambda: datetime.datetime.now(datetime.timezone.utc)
    )


class User(SQLModel, table=True):
    __tablename__ = "users"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    company_id: uuid.UUID = Field(foreign_key="companies.id", nullable=False)
    role: UserRole = Field(sa_column=Column(SAEnum(UserRole), nullable=False))

    first_name: str = Field(max_length=100)
    last_name: str = Field(max_length=100)
    email: str = Field(max_length=255, unique=True, nullable=False)
    phone: Optional[str] = Field(default=None, max_length=20)

    login_id: str = Field(max_length=50, unique=True, nullable=False)
    password_hash: str = Field(nullable=False)
    is_first_login: bool = Field(default=True)

    profile_picture_url: Optional[str] = Field(default=None, sa_column=Column(Text))
    department: Optional[str] = Field(default=None, max_length=100)
    manager_id: Optional[uuid.UUID] = Field(default=None, foreign_key="users.id")
    location: Optional[str] = Field(default=None, max_length=255)

    current_status: AttendanceStatus = Field(
        sa_column=Column(SAEnum(AttendanceStatus)),
        default=AttendanceStatus.NOT_CHECKED_IN,
    )
    joining_date: datetime.date = Field(default_factory=datetime.date.today)
    is_active: bool = Field(default=True)

    created_at: Optional[datetime.datetime] = Field(
        default_factory=lambda: datetime.datetime.now(datetime.timezone.utc)
    )
    updated_at: Optional[datetime.datetime] = Field(
        default_factory=lambda: datetime.datetime.now(datetime.timezone.utc)
    )


class ResumeInfo(SQLModel, table=True):
    __tablename__ = "resume_info"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="users.id", unique=True, nullable=False)
    about_me: Optional[str] = Field(default=None, sa_column=Column(Text))
    job_love: Optional[str] = Field(default=None, sa_column=Column(Text))
    hobbies: Optional[str] = Field(default=None, sa_column=Column(Text))
    skills: Optional[list[str]] = Field(default=None, sa_column=Column(JSON))
    certifications: Optional[list[str]] = Field(default=None, sa_column=Column(JSON))


class PrivateInfo(SQLModel, table=True):
    __tablename__ = "private_info"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="users.id", unique=True, nullable=False)
    dob: Optional[datetime.date] = Field(default=None)
    address: Optional[str] = Field(default=None, sa_column=Column(Text))
    nationality: Optional[str] = Field(default=None, max_length=100)
    personal_email: Optional[str] = Field(default=None, max_length=255)
    gender: Optional[str] = Field(default=None, max_length=20)
    marital_status: Optional[str] = Field(default=None, max_length=20)

    bank_account_number: Optional[str] = Field(default=None, max_length=100)
    bank_name: Optional[str] = Field(default=None, max_length=255)
    ifsc_code: Optional[str] = Field(default=None, max_length=50)
    uan_no: Optional[str] = Field(default=None, max_length=100)
    emp_code: Optional[str] = Field(default=None, max_length=100)


class SalaryConfig(SQLModel, table=True):
    __tablename__ = "salary_config"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="users.id", unique=True, nullable=False)
    monthly_wage: Decimal = Field(
        default=Decimal("0.00"), max_digits=12, decimal_places=2
    )
    working_days_per_week: int = Field(default=5)
    break_time_mins: int = Field(default=60)


class Attendance(SQLModel, table=True):
    __tablename__ = "attendance"
    __table_args__ = (
        UniqueConstraint("user_id", "date", name="uq_attendance_user_date"),
    )

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="users.id", nullable=False)
    date: datetime.date = Field(nullable=False)
    check_in_time: Optional[datetime.datetime] = Field(default=None)
    check_out_time: Optional[datetime.datetime] = Field(default=None)
    work_hours: Optional[Decimal] = Field(default=None, max_digits=5, decimal_places=2)
    extra_hours: Optional[Decimal] = Field(default=None, max_digits=5, decimal_places=2)
    status: AttendanceStatus = Field(
        sa_column=Column(SAEnum(AttendanceStatus), nullable=False)
    )

    created_at: Optional[datetime.datetime] = Field(
        default_factory=lambda: datetime.datetime.now(datetime.timezone.utc)
    )


class TimeOffRequest(SQLModel, table=True):
    __tablename__ = "time_off_requests"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="users.id", nullable=False)
    leave_type: LeaveType = Field(sa_column=Column(SAEnum(LeaveType), nullable=False))
    start_date: datetime.date = Field(nullable=False)
    end_date: datetime.date = Field(nullable=False)
    requested_days: Decimal = Field(nullable=False, max_digits=5, decimal_places=2)
    attachment_url: Optional[str] = Field(default=None, sa_column=Column(Text))

    status: LeaveStatus = Field(
        sa_column=Column(SAEnum(LeaveStatus)), default=LeaveStatus.PENDING
    )
    reviewed_by: Optional[uuid.UUID] = Field(default=None, foreign_key="users.id")

    created_at: Optional[datetime.datetime] = Field(
        default_factory=lambda: datetime.datetime.now(datetime.timezone.utc)
    )


class LeaveAllocation(SQLModel, table=True):
    __tablename__ = "leave_allocations"
    __table_args__ = (
        UniqueConstraint("user_id", "year", name="uq_allocation_user_year"),
    )

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="users.id", nullable=False)
    year: int = Field(nullable=False)

    total_paid_leaves: Decimal = Field(
        default=Decimal("24.00"), max_digits=5, decimal_places=2
    )
    used_paid_leaves: Decimal = Field(
        default=Decimal("0.00"), max_digits=5, decimal_places=2
    )

    total_sick_leaves: Decimal = Field(
        default=Decimal("7.00"), max_digits=5, decimal_places=2
    )
    used_sick_leaves: Decimal = Field(
        default=Decimal("0.00"), max_digits=5, decimal_places=2
    )


class PublicHoliday(SQLModel, table=True):
    __tablename__ = "public_holidays"
    __table_args__ = (UniqueConstraint("date", name="uq_holiday_date"),)

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    date: datetime.date = Field(nullable=False)
    name: str = Field(max_length=255, nullable=False)
