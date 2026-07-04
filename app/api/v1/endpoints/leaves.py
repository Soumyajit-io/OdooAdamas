import uuid
from datetime import date, datetime, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, Query, status

from app.api.deps import get_current_admin, get_current_user
from app.schemas.leave import (
    LeaveCreate,
    LeaveResponse,
    LeaveStatus,
    LeaveStatusUpdate,
    LeaveType,
)
from app.schemas.user import UserResponse

router = APIRouter()


@router.post("", response_model=LeaveResponse, status_code=status.HTTP_201_CREATED)
async def apply_for_leave(
    payload: LeaveCreate, current_user: UserResponse = Depends(get_current_user)
):
    """
    Creates a new leave request for the logged-in employee.
    """
    # TODO: Verify that start_date <= end_date.
    # TODO: Insert new leave request into 'leave_requests' table in Supabase.
    # Return created leave request record with PENDING status.

    return LeaveResponse(
        id=uuid.uuid4(),
        user_id=current_user.id,
        leave_type=payload.leave_type,
        start_date=payload.start_date,
        end_date=payload.end_date,
        status=LeaveStatus.PENDING,
        remarks=payload.remarks,
        admin_comments=None,
        created_at=datetime.now(timezone.utc),
    )


@router.get("/me", response_model=List[LeaveResponse])
async def get_own_leaves(current_user: UserResponse = Depends(get_current_user)):
    """
    Returns the current employee's leave request history.
    """
    # TODO: Query Supabase database for leave requests of current_user.id.
    # Return list of leave request records.

    return [
        LeaveResponse(
            id=uuid.uuid4(),
            user_id=current_user.id,
            leave_type=LeaveType.PAID,
            start_date=date.today(),
            end_date=date.today(),
            status=LeaveStatus.PENDING,
            remarks="Family vacation",
            admin_comments=None,
            created_at=datetime.now(timezone.utc),
        )
    ]


@router.get("", response_model=List[LeaveResponse])
async def get_all_leaves(
    status: Optional[LeaveStatus] = Query(None),
    admin_user: UserResponse = Depends(get_current_admin),
):
    """
    Admin-only endpoint to retrieve all leave requests, optionally filtered by status.
    """
    # TODO: Query Supabase database for leave requests.
    # Filter by status if provided.
    # Return list of all leave requests.

    return [
        LeaveResponse(
            id=uuid.uuid4(),
            user_id="user_mock_123",
            leave_type=LeaveType.PAID,
            start_date=date.today(),
            end_date=date.today(),
            status=status or LeaveStatus.PENDING,
            remarks="Vacation",
            admin_comments=None,
            created_at=datetime.now(timezone.utc),
        )
    ]


@router.patch("/{leave_id}/status", response_model=LeaveResponse)
async def update_leave_status(
    leave_id: uuid.UUID,
    payload: LeaveStatusUpdate,
    admin_user: UserResponse = Depends(get_current_admin),
):
    """
    Admin-only endpoint to approve or reject a leave request.
    """
    # TODO: Fetch leave request by leave_id from Supabase.
    # If not found, raise HTTPException(status_code=404, detail="Leave request not found")
    # TODO: Update status and admin_comments.
    # Return updated leave request record.

    return LeaveResponse(
        id=leave_id,
        user_id="user_mock_123",
        leave_type=LeaveType.PAID,
        start_date=date.today(),
        end_date=date.today(),
        status=payload.status,
        remarks="Vacation",
        admin_comments=payload.admin_comments,
        created_at=datetime.now(timezone.utc),
    )
