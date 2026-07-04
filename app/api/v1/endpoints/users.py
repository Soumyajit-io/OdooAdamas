from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.schemas.user import UserResponse, UserBasicInfo, UserUpdateSelf, UserUpdateAdmin
from app.api.deps import get_current_user, get_current_admin

router = APIRouter()

@router.get("/me", response_model=UserResponse)
async def get_own_profile(
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Fetches the profile of the currently logged-in user.
    """
    # TODO: Fetch current user record from Supabase if not fully populated from JWT.
    return current_user

@router.put("/me", response_model=UserResponse)
async def update_own_profile(
    payload: UserUpdateSelf,
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Updates specific fields (phone, address) for the current user's profile.
    """
    # TODO: Update user record in Supabase database where id == current_user.id.
    # Return updated user profile.
    
    # Return mock updated user for schema validation
    updated_user = current_user.model_copy(update=payload.model_dump(exclude_unset=True))
    return updated_user

@router.get("", response_model=List[UserBasicInfo])
async def get_all_users(
    admin_user: UserResponse = Depends(get_current_admin)
):
    """
    Admin-only endpoint to fetch a list of all employees.
    """
    # TODO: Query Supabase database to fetch all users.
    # Return list of UserBasicInfo items.
    
    # Mocking standard empty/mock data list
    return [
        UserBasicInfo(
            id=admin_user.id,
            employee_id=admin_user.employee_id,
            first_name=admin_user.first_name,
            last_name=admin_user.last_name,
            email=admin_user.email,
            job_title=admin_user.job_title,
            role=admin_user.role
        )
    ]

@router.put("/{user_id}", response_model=UserResponse)
async def update_user_by_admin(
    user_id: str,
    payload: UserUpdateAdmin,
    admin_user: UserResponse = Depends(get_current_admin)
):
    """
    Admin-only endpoint to update any employee's details (employee_id, job_title, role).
    """
    # TODO: Verify that target user_id exists in Supabase.
    # TODO: Update the user in Supabase with role/job_title/employee_id.
    # Return updated user profile.
    
    # Mock return updated user profile
    return UserResponse(
        id=user_id,
        employee_id=payload.employee_id or "EMP-MOCK",
        email="updated_user@example.com",
        role=payload.role or admin_user.role,
        first_name="Updated",
        last_name="Employee",
        phone="+987654321",
        address="Updated Address",
        profile_picture_url="https://example.com/avatar.jpg",
        job_title=payload.job_title or "Senior Engineer"
    )
