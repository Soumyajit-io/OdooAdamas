import jwt
from fastapi import Depends, Header, HTTPException, status
from sqlmodel import Session

from app.core.db import get_session
from app.models import User, UserRole


async def get_token_header(authorization: str = Header(None)) -> str:
    """
    Extracts the Bearer token from the Authorization header.
    """
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header missing",
        )

    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header must be Bearer token",
        )

    return parts[1]


async def get_current_user(
    token: str = Depends(get_token_header),
    session: Session = Depends(get_session)
) -> User:
    """
    Validates Clerk JWT token and returns the current user profile from the database.
    """
    clerk_user_id = None
    try:
        # In development/testing, if the token is a mock simple string, we use it directly.
        if token.startswith("mock_") or token.startswith("user_"):
            clerk_user_id = token
        else:
            # Try to decode JWT (without verification for local testing fallback)
            # TODO: Add full signature verification against Clerk JWKs in production
            payload = jwt.decode(token, options={"verify_signature": False})
            clerk_user_id = payload.get("sub")
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid authentication token: {str(e)}"
        )

    if not clerk_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token does not contain a valid user ID claim"
        )

    # Dev/Test Helpers: Auto-create mock admin/employee if they don't exist
    if clerk_user_id in ("mock_admin", "mock_employee"):
        user = session.get(User, clerk_user_id)
        if not user:
            role = UserRole.ADMIN if clerk_user_id == "mock_admin" else UserRole.EMPLOYEE
            emp_id = "EMP-999" if clerk_user_id == "mock_admin" else "EMP-001"
            email = "admin@example.com" if clerk_user_id == "mock_admin" else "employee@example.com"
            title = "HR Administrator" if clerk_user_id == "mock_admin" else "Software Engineer"

            user = User(
                id=clerk_user_id,
                employee_id=emp_id,
                email=email,
                role=role,
                first_name="Mock",
                last_name="Admin" if role == UserRole.ADMIN else "Employee",
                phone="+123456789",
                address="123 Dev Street",
                job_title=title,
                profile_picture_url="https://example.com/avatar.jpg"
            )
            session.add(user)
            session.commit()
            session.refresh(user)
        return user

    # Query user from the database
    user = session.get(User, clerk_user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found in DB"
        )
    return user


async def get_current_admin(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    Enforces that the current user has the ADMIN role.
    """
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required"
        )
    return current_user
