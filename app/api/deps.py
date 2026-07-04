from fastapi import Header, HTTPException, status, Depends
from typing import Dict, Any
import jwt  # pyjwt
from app.schemas.user import UserResponse, UserRole

# TODO: Define Clerk configurations (e.g. CLERK_PEM_PUBLIC_KEYS, CLERK_JWT_AUDIENCE)
# and database connection/session fetchers.

async def get_token_header(authorization: str = Header(None)) -> str:
    """
    Extracts the Bearer token from the Authorization header.
    """
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header missing"
        )
    
    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header must be Bearer token"
        )
        
    return parts[1]

async def get_current_user(token: str = Depends(get_token_header)) -> UserResponse:
    """
    Validates Clerk JWT token and returns the current user profile.
    """
    # TODO: Implement actual Clerk JWT validation:
    # 1. Decode JWT header to find the kid (Key ID).
    # 2. Match kid with Clerk's public JWKs (cached).
    # 3. Verify signature, expiration (exp), audience (aud), and issuer (iss).
    # 4. Extract subject (sub), which is the Clerk user ID (e.g. 'user_...').
    # 5. Fetch the user profile from Supabase database.
    
    # Returning a mock UserResponse for development structure validation
    mock_user = UserResponse(
        id="user_mock_12345",
        employee_id="EMP-1234",
        email="mockuser@example.com",
        role=UserRole.EMPLOYEE,
        first_name="Mock",
        last_name="User",
        phone="+123456789",
        address="123 Mock St",
        profile_picture_url="https://example.com/avatar.jpg",
        job_title="Software Engineer"
    )
    return mock_user

async def get_current_admin(current_user: UserResponse = Depends(get_current_user)) -> UserResponse:
    """
    Enforces that the current user has the ADMIN role.
    """
    # TODO: Implement role validation check against the database/JWT claims.
    if current_user.role != UserRole.ADMIN:
        # For structures, if mock user is not ADMIN, we might want to temporarily allow
        # or raise HTTP 403. Let's raise 403 to match specifications.
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user
