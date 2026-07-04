import uuid
from datetime import date, datetime, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, Query, status

from app.api.deps import get_current_admin, get_current_user
from app.schemas.attendance import (
    AttendanceResponse,
    AttendanceResponseAdmin,
    AttendanceStatus,
)
from app.schemas.user import UserResponse

router = APIRouter()


@router.post(
    "/check-in", response_model=AttendanceResponse, status_code=status.HTTP_201_CREATED
)
async def check_in(current_user: UserResponse = Depends(get_current_user)):
    """
    Records a check-in timestamp for the current user today.
    """
    # TODO: Check if user has already checked in today in Supabase.
    # If yes, raise HTTPException(status_code=400, detail="Already checked in today")
    # TODO: Create a new attendance record with PRESENT status and check_in time.
    # Return created record.

    # Mock return
    return AttendanceResponse(
        id=uuid.uuid4(),
        user_id=current_user.id,
        date=date.today(),
        check_in=datetime.now(timezone.utc),
        status=AttendanceStatus.PRESENT,
    )


@router.post("/check-out", response_model=AttendanceResponse)
async def check_out(current_user: UserResponse = Depends(get_current_user)):
    """
    Records a check-out timestamp for the current user today.
    """
    # TODO: Check if user has an active check-in today in Supabase.
    # If not checked in, raise HTTPException(status_code=400, detail="Not checked in")
    # If already checked out, raise HTTPException(status_code=400, detail="Already checked out")
    # TODO: Update the attendance record with check_out time.
    # Return updated record.

    # Mock return
    return AttendanceResponse(
        id=uuid.uuid4(),
        user_id=current_user.id,
        date=date.today(),
        check_in=datetime.now(timezone.utc),
        check_out=datetime.now(timezone.utc),
        status=AttendanceStatus.PRESENT,
    )


@router.get("/me", response_model=List[AttendanceResponse])
async def get_own_attendance(
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    current_user: UserResponse = Depends(get_current_user),
):
    """
    Fetches attendance logs for the logged-in user, optionally filtered by date range.
    """
    # TODO: Query Supabase database for attendance records of current_user.id.
    # Filter by start_date and end_date if provided.
    # Return list of attendance logs.

    # Mock return
    return [
        AttendanceResponse(
            id=uuid.uuid4(),
            user_id=current_user.id,
            date=date.today(),
            check_in=datetime.now(timezone.utc),
            check_out=datetime.now(timezone.utc),
            status=AttendanceStatus.PRESENT,
        )
    ]


@router.get("", response_model=List[AttendanceResponseAdmin])
async def get_all_attendance(
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    user_id: Optional[str] = Query(None),
    admin_user: UserResponse = Depends(get_current_admin),
):
    """
    Admin-only endpoint to fetch attendance records of all employees, with filters.
    """
    # TODO: Query Supabase for attendance records of all employees.
    # Filter by user_id, start_date, and end_date if provided.
    # Perform join or fetch basic user info for each record.
    # Return list of AttendanceResponseAdmin items.

    # Mock return
    return [
        AttendanceResponseAdmin(
            id=uuid.uuid4(),
            user_id=user_id or "user_mock_123",
            date=date.today(),
            check_in=datetime.now(timezone.utc),
            check_out=datetime.now(timezone.utc),
            status=AttendanceStatus.PRESENT,
            user=None,
        )
    ]
