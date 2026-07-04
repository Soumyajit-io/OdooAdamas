import datetime
from decimal import Decimal
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.core.db import get_session
from app.core.dependencies import get_current_hr_or_admin, get_current_user
from app.models import Attendance, AttendanceStatus, SalaryConfig, User
from app.schemas.attendance import AttendanceRecordResponse, MyAttendanceSummaryResponse

router = APIRouter()


@router.get("/me", response_model=MyAttendanceSummaryResponse)
def get_my_attendance(
    month: int,
    year: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session),
):
    start_date = datetime.date(year, month, 1)
    if month == 12:
        end_date = datetime.date(year + 1, 1, 1) - datetime.timedelta(days=1)
    else:
        end_date = datetime.date(year, month + 1, 1) - datetime.timedelta(days=1)

    records = db.exec(
        select(Attendance).where(
            Attendance.user_id == current_user.id,
            Attendance.date >= start_date,
            Attendance.date <= end_date,
        )
    ).all()

    days_present = sum(
        1
        for r in records
        if r.status in [AttendanceStatus.PRESENT, AttendanceStatus.HALF_DAY]
    )
    leaves_count = sum(1 for r in records if r.status == AttendanceStatus.ON_LEAVE)

    # Calculate total working days in month excluding weekends (simplistic calculation)
    total_working_days = sum(
        1
        for d in range((end_date - start_date).days + 1)
        if (start_date + datetime.timedelta(days=d)).weekday() < 5
    )

    return {
        "days_present": days_present,
        "leaves_count": leaves_count,
        "total_working_days": total_working_days,
        "records": records,
    }


@router.get("/", response_model=List[AttendanceRecordResponse])
def get_company_attendance(
    date_str: str,
    search: str = None,
    current_user: User = Depends(get_current_hr_or_admin),
    db: Session = Depends(get_session),
):
    try:
        date_obj = datetime.datetime.strptime(date_str, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(
            status_code=400, detail="Invalid date format, use YYYY-MM-DD"
        )

    query = (
        select(Attendance)
        .join(User)
        .where(Attendance.date == date_obj, User.company_id == current_user.company_id)
    )

    if search:
        search_pattern = f"%{search}%"
        query = query.where(
            User.first_name.like(search_pattern) | User.last_name.like(search_pattern)
        )

    records = db.exec(query).all()
    return records


@router.post("/check-in")
def check_in(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_session)
):
    today = datetime.date.today()

    existing = db.exec(
        select(Attendance).where(
            Attendance.user_id == current_user.id, Attendance.date == today
        )
    ).first()

    if existing and existing.check_in_time:
        raise HTTPException(status_code=400, detail="Already checked in today")

    now = datetime.datetime.now()

    if not existing:
        attendance = Attendance(
            user_id=current_user.id,
            date=today,
            check_in_time=now,
            status=AttendanceStatus.PRESENT,
        )
        db.add(attendance)
    else:
        existing.check_in_time = now
        existing.status = AttendanceStatus.PRESENT
        db.add(existing)

    current_user.current_status = AttendanceStatus.PRESENT
    db.add(current_user)

    db.commit()
    return {"message": "Checked in successfully", "time": now}


@router.post("/check-out")
def check_out(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_session)
):
    today = datetime.date.today()

    attendance = db.exec(
        select(Attendance).where(
            Attendance.user_id == current_user.id, Attendance.date == today
        )
    ).first()

    if not attendance or not attendance.check_in_time:
        raise HTTPException(status_code=400, detail="No check-in found for today")

    now = datetime.datetime.now()
    attendance.check_out_time = now

    # Calculate duration
    duration = now - attendance.check_in_time
    total_hours = Decimal(str(duration.total_seconds() / 3600.0))

    # Fetch Salary Config for breaks
    config = db.exec(
        select(SalaryConfig).where(SalaryConfig.user_id == current_user.id)
    ).first()

    break_hours = Decimal("0")
    std_daily_hours = Decimal("8")

    if config:
        break_hours = Decimal(str(config.break_time_mins / 60.0))
        # Assuming typical 8-hour workday if 5 days/week

    work_hours = total_hours - break_hours
    if work_hours < Decimal("0"):
        work_hours = Decimal("0")

    extra_hours = work_hours - std_daily_hours
    if extra_hours < Decimal("0"):
        extra_hours = Decimal("0")

    attendance.work_hours = work_hours
    attendance.extra_hours = extra_hours

    current_user.current_status = AttendanceStatus.NOT_CHECKED_IN

    db.add(attendance)
    db.add(current_user)
    db.commit()

    return {
        "message": "Checked out successfully",
        "work_hours": work_hours,
        "extra_hours": extra_hours,
    }
