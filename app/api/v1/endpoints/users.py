from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from app.api.deps import get_current_admin, get_current_user, get_session
from app.models import User
from app.schemas.user import (
    UserBasicInfo,
    UserResponse,
    UserUpdateAdmin,
    UserUpdateSelf,
)

router = APIRouter()


@router.get("/me", response_model=UserResponse)
async def get_own_profile(current_user: User = Depends(get_current_user)):
    """
    Fetches the profile of the currently logged-in user.
    """
    return current_user


@router.put("/me", response_model=UserResponse)
async def update_own_profile(
    payload: UserUpdateSelf,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """
    Updates specific fields (phone, address) for the current user's profile.
    """
    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(current_user, key, value)

    session.add(current_user)
    session.commit()
    session.refresh(current_user)
    return current_user


@router.get("", response_model=List[UserBasicInfo])
async def get_all_users(
    admin_user: User = Depends(get_current_admin),
    session: Session = Depends(get_session),
):
    """
    Admin-only endpoint to fetch a list of all employees.
    """
    statement = select(User)
    users = session.exec(statement).all()
    return users


@router.put("/{user_id}", response_model=UserResponse)
async def update_user_by_admin(
    user_id: str,
    payload: UserUpdateAdmin,
    admin_user: User = Depends(get_current_admin),
    session: Session = Depends(get_session),
):
    """
    Admin-only endpoint to update any employee's details (employee_id, job_title, role).
    """
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found in DB"
        )

    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(user, key, value)

    session.add(user)
    session.commit()
    session.refresh(user)
    return user
