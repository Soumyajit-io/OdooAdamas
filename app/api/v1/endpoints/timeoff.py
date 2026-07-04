import datetime
import uuid
from decimal import Decimal
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.core.db import get_session
from app.core.dependencies import get_current_hr_or_admin, get_current_user
from app.models import (
    LeaveAllocation,
    LeaveStatus,
    LeaveType,
    PublicHoliday,
    TimeOffRequest,
    User,
)
from app.schemas.timeoff import (
    MyTimeOffResponse,
    TimeOffRequestCreate,
    TimeOffRequestResponse,
)

router = APIRouter()


@router.get("/me", response_model=MyTimeOffResponse)
def get_my_timeoff(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_session)
):
    current_year = datetime.date.today().year

    allocation = db.exec(
        select(LeaveAllocation).where(
            LeaveAllocation.user_id == current_user.id,
            LeaveAllocation.year == current_year,
        )
    ).first()

    # If no allocation exists, create a default one for the year
    if not allocation:
        allocation = LeaveAllocation(user_id=current_user.id, year=current_year)
        db.add(allocation)
        db.commit()
        db.refresh(allocation)

    requests = db.exec(
        select(TimeOffRequest).where(
            TimeOffRequest.user_id == current_user.id,
            TimeOffRequest.start_date >= datetime.date(current_year, 1, 1),
            TimeOffRequest.start_date <= datetime.date(current_year, 12, 31),
        )
    ).all()

    return {"allocation": allocation, "requests": requests}


@router.post("/request", response_model=TimeOffRequestResponse)
def request_timeoff(
    req: TimeOffRequestCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session),
):
    if req.end_date < req.start_date:
        raise HTTPException(
            status_code=400, detail="End date cannot be before start date"
        )

    # Fetch public holidays in the range
    holidays = db.exec(
        select(PublicHoliday.date).where(
            PublicHoliday.date >= req.start_date, PublicHoliday.date <= req.end_date
        )
    ).all()
    holiday_dates = set(holidays)

    # Calculate requested days (excluding weekends and public holidays)
    requested_days = Decimal("0")
    current_date = req.start_date
    while current_date <= req.end_date:
        if (
            current_date.weekday() < 5 and current_date not in holiday_dates
        ):  # 0-4 are Mon-Fri
            requested_days += Decimal("1.0")
        current_date += datetime.timedelta(days=1)

    if requested_days <= 0:
        raise HTTPException(
            status_code=400, detail="Requested period contains no working days"
        )

    # Check balance for PAID and SICK
    if req.leave_type in [LeaveType.PAID, LeaveType.SICK]:
        allocation = db.exec(
            select(LeaveAllocation).where(
                LeaveAllocation.user_id == current_user.id,
                LeaveAllocation.year == req.start_date.year,
            )
        ).first()

        if not allocation:
            raise HTTPException(
                status_code=400,
                detail="No leave allocation found for the requested year",
            )

        if req.leave_type == LeaveType.PAID:
            available = allocation.total_paid_leaves - allocation.used_paid_leaves
            if requested_days > available:
                raise HTTPException(
                    status_code=400, detail="Insufficient Paid Time Off balance"
                )
        else:
            available = allocation.total_sick_leaves - allocation.used_sick_leaves
            if requested_days > available:
                raise HTTPException(
                    status_code=400, detail="Insufficient Sick Leave balance"
                )

    timeoff = TimeOffRequest(
        user_id=current_user.id,
        leave_type=req.leave_type,
        start_date=req.start_date,
        end_date=req.end_date,
        requested_days=requested_days,
        attachment_url=req.attachment_url,
        status=LeaveStatus.PENDING,
    )
    db.add(timeoff)
    db.commit()
    db.refresh(timeoff)

    return timeoff


@router.get("/requests", response_model=List[TimeOffRequestResponse])
def get_all_requests(
    status_filter: str = "PENDING",
    current_user: User = Depends(get_current_hr_or_admin),
    db: Session = Depends(get_session),
):
    # Get requests for the whole company
    query = (
        select(TimeOffRequest)
        .join(User)
        .where(User.company_id == current_user.company_id)
    )
    if status_filter:
        query = query.where(TimeOffRequest.status == status_filter)

    requests = db.exec(query).all()
    return requests


@router.put("/requests/{id}/approve")
def approve_request(
    id: uuid.UUID,
    current_user: User = Depends(get_current_hr_or_admin),
    db: Session = Depends(get_session),
):
    request = db.get(TimeOffRequest, id)
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    if request.status != LeaveStatus.PENDING:
        raise HTTPException(
            status_code=400, detail=f"Request is already {request.status}"
        )

    request.status = LeaveStatus.APPROVED
    request.reviewed_by = current_user.id

    # Deduct from allocation
    if request.leave_type in [LeaveType.PAID, LeaveType.SICK]:
        allocation = db.exec(
            select(LeaveAllocation).where(
                LeaveAllocation.user_id == request.user_id,
                LeaveAllocation.year == request.start_date.year,
            )
        ).first()

        if allocation:
            if request.leave_type == LeaveType.PAID:
                allocation.used_paid_leaves += request.requested_days
            elif request.leave_type == LeaveType.SICK:
                allocation.used_sick_leaves += request.requested_days
            db.add(allocation)

    db.add(request)
    db.commit()
    return {"message": "Request approved"}


@router.put("/requests/{id}/reject")
def reject_request(
    id: uuid.UUID,
    current_user: User = Depends(get_current_hr_or_admin),
    db: Session = Depends(get_session),
):
    request = db.get(TimeOffRequest, id)
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    if request.status != LeaveStatus.PENDING:
        raise HTTPException(
            status_code=400, detail=f"Request is already {request.status}"
        )

    request.status = LeaveStatus.REJECTED
    request.reviewed_by = current_user.id

    db.add(request)
    db.commit()
    return {"message": "Request rejected"}
