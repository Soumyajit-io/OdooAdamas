import datetime
import uuid
from decimal import Decimal
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session, select

from app.api.deps import get_current_admin, get_current_user, get_session
from app.models import Attendance, AttendanceStatus, User
from app.schemas.attendance import AttendanceResponse, AttendanceResponseAdmin
from app.schemas.user import UserBasicInfo, UserRole

router = APIRouter()


@router.post(
    "/check-in", response_model=AttendanceResponse, status_code=status.HTTP_201_CREATED
)
async def check_in(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """
    Records a check-in timestamp for the current user today.
    """
    today = datetime.date.today()

    # Check if user already checked in today
    statement = select(Attendance).where(
        Attendance.user_id == current_user.id, Attendance.date == today
    )
    existing_record = session.exec(statement).first()
    if existing_record:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Already checked in today"
        )

    # Create new attendance record
    new_record = Attendance(
        id=uuid.uuid4(),
        user_id=current_user.id,
        date=today,
        check_in=datetime.datetime.utcnow(),
        status=AttendanceStatus.PRESENT,
    )
    session.add(new_record)
    session.commit()
    session.refresh(new_record)
    return new_record


@router.post("/check-out", response_model=AttendanceResponse)
async def check_out(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """
    Records a check-out timestamp for the current user today.
    """
    today = datetime.date.today()

    # Fetch today's check-in record
    statement = select(Attendance).where(
        Attendance.user_id == current_user.id, Attendance.date == today
    )
    record = session.exec(statement).first()

    if not record:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Not checked in"
        )

    if record.check_out is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Already checked out"
        )

    # Record check-out time and calculate working hours
    record.check_out = datetime.datetime.utcnow()
    if record.check_in:
        duration = record.check_out - record.check_in
        hours = Decimal(duration.total_seconds() / 3600.0)
        record.working_hours = round(hours, 2)

    session.add(record)
    session.commit()
    session.refresh(record)
    return record


@router.get("/me", response_model=List[AttendanceResponse])
async def get_own_attendance(
    start_date: Optional[datetime.date] = Query(None),
    end_date: Optional[datetime.date] = Query(None),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """
    Fetches attendance logs for the logged-in user, optionally filtered by date range.
    """
    statement = select(Attendance).where(Attendance.user_id == current_user.id)

    if start_date:
        statement = statement.where(Attendance.date >= start_date)
    if end_date:
        statement = statement.where(Attendance.date <= end_date)

    statement = statement.order_by(Attendance.date.desc())
    records = session.exec(statement).all()
    return records


@router.get("", response_model=List[AttendanceResponseAdmin])
async def get_all_attendance(
    start_date: Optional[datetime.date] = Query(None),
    end_date: Optional[datetime.date] = Query(None),
    user_id: Optional[str] = Query(None),
    admin_user: User = Depends(get_current_admin),
    session: Session = Depends(get_session),
):
    """
    Admin-only endpoint to fetch attendance records of all employees, with filters.
    """
    statement = select(Attendance, User).join(User, Attendance.user_id == User.id)

    if user_id:
        statement = statement.where(Attendance.user_id == user_id)
    if start_date:
        statement = statement.where(Attendance.date >= start_date)
    if end_date:
        statement = statement.where(Attendance.date <= end_date)

    statement = statement.order_by(Attendance.date.desc())
    results = session.exec(statement).all()

    response_list = []
    for attendance, user in results:
        # Construct response with embedded basic user info
        user_info = UserBasicInfo(
            id=user.id,
            employee_id=user.employee_id,
            first_name=user.first_name,
            last_name=user.last_name,
            email=user.email,
            job_title=user.job_title,
            role=UserRole(user.role.value),
            department=user.department,
            joining_date=user.joining_date,
            is_active=user.is_active,
        )
        response_list.append(
            AttendanceResponseAdmin(
                id=attendance.id,
                user_id=attendance.user_id,
                date=attendance.date,
                check_in=attendance.check_in,
                check_out=attendance.check_out,
                status=attendance.status,
                user=user_info,
            )
        )
    return response_list
