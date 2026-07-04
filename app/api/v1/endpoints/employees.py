import datetime
import uuid
from decimal import Decimal
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from app.core.db import get_session
from app.core.dependencies import (
    get_current_admin_user,
    get_current_hr_or_admin,
    get_current_user,
)
from app.core.security import get_password_hash
from app.core.utils import generate_login_id
from app.models import PrivateInfo, ResumeInfo, SalaryConfig, User
from app.schemas.employees import (
    EmployeeCreateRequest,
    EmployeeResponse,
    PrivateInfoUpdate,
    ResumeInfoUpdate,
    SalaryConfigUpdate,
)

router = APIRouter()


@router.post("/", response_model=EmployeeResponse, status_code=status.HTTP_201_CREATED)
def create_employee(
    request: EmployeeCreateRequest,
    current_user: User = Depends(get_current_hr_or_admin),
    db: Session = Depends(get_session),
):
    existing_user = db.exec(select(User).where(User.email == request.email)).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    joining_date = datetime.date.today()
    login_id = generate_login_id(
        db, request.first_name, request.last_name, joining_date
    )

    # Generate a random password for the new employee
    # In a real app, this should be a strong random string sent via email.
    temp_password = "password123"

    new_user = User(
        company_id=current_user.company_id,
        role=request.role,
        first_name=request.first_name,
        last_name=request.last_name,
        email=request.email,
        phone=request.phone,
        login_id=login_id,
        password_hash=get_password_hash(temp_password),
        is_first_login=True,
        joining_date=joining_date,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Initialize profile info tables
    resume_info = ResumeInfo(user_id=new_user.id)
    private_info = PrivateInfo(user_id=new_user.id)
    salary_config = SalaryConfig(user_id=new_user.id)

    db.add(resume_info)
    db.add(private_info)
    db.add(salary_config)
    db.commit()

    # TODO: Send email with login_id and temp_password

    return new_user


@router.get("/", response_model=List[EmployeeResponse])
def get_employees(
    search: str = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session),
):
    query = select(User).where(User.company_id == current_user.company_id)
    if search:
        search_pattern = f"%{search}%"
        query = query.where(
            (User.first_name.like(search_pattern))
            | (User.last_name.like(search_pattern))
            | (User.login_id.like(search_pattern))
        )

    employees = db.exec(query).all()
    return employees


@router.get("/{id}/profile")
def get_employee_profile(
    id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session),
):
    user = db.get(User, id)
    if not user or user.company_id != current_user.company_id:
        raise HTTPException(status_code=404, detail="Employee not found")

    resume = db.exec(select(ResumeInfo).where(ResumeInfo.user_id == id)).first()

    # Only return private info if self or HR/Admin
    private_info = None
    if current_user.id == id or current_user.role in ["ADMIN", "HR"]:
        private_info = db.exec(
            select(PrivateInfo).where(PrivateInfo.user_id == id)
        ).first()

    return {"user": user, "resume": resume, "private_info": private_info}


@router.put("/{id}/resume")
def update_resume(
    id: uuid.UUID,
    update_data: ResumeInfoUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session),
):
    if current_user.id != id and current_user.role not in ["ADMIN", "HR"]:
        raise HTTPException(status_code=403, detail="Not authorized")

    resume = db.exec(select(ResumeInfo).where(ResumeInfo.user_id == id)).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    update_dict = update_data.model_dump(exclude_unset=True)
    for key, value in update_dict.items():
        setattr(resume, key, value)

    db.add(resume)
    db.commit()
    return {"message": "Resume updated successfully"}


@router.put("/{id}/private")
def update_private_info(
    id: uuid.UUID,
    update_data: PrivateInfoUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session),
):
    if current_user.id != id and current_user.role not in ["ADMIN", "HR"]:
        raise HTTPException(status_code=403, detail="Not authorized")

    private_info = db.exec(select(PrivateInfo).where(PrivateInfo.user_id == id)).first()
    if not private_info:
        raise HTTPException(status_code=404, detail="Private info not found")

    update_dict = update_data.model_dump(exclude_unset=True)
    for key, value in update_dict.items():
        setattr(private_info, key, value)

    db.add(private_info)
    db.commit()
    return {"message": "Private info updated successfully"}


@router.get("/{id}/salary")
def get_salary_config(
    id: uuid.UUID,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_session),
):
    salary_config = db.exec(
        select(SalaryConfig).where(SalaryConfig.user_id == id)
    ).first()
    if not salary_config:
        raise HTTPException(status_code=404, detail="Salary config not found")

    # Calculate components
    wage = salary_config.monthly_wage
    basic = wage * Decimal("0.5")
    hra = basic * Decimal("0.5")
    pf = basic * Decimal("0.12")
    standard_allowance = Decimal("4167.00")
    performance_bonus = basic * Decimal("0.0833")
    lta = basic * Decimal("0.0833")
    fixed_allowance = wage - (
        basic + hra + standard_allowance + performance_bonus + lta
    )

    return {
        "config": salary_config,
        "components": {
            "basic": basic,
            "hra": hra,
            "standard_allowance": standard_allowance,
            "performance_bonus": performance_bonus,
            "lta": lta,
            "fixed_allowance": fixed_allowance,
            "pf_employee": pf,
            "pf_employer": pf,
            "professional_tax": Decimal("200.00"),
        },
    }


@router.put("/{id}/salary")
def update_salary_config(
    id: uuid.UUID,
    update_data: SalaryConfigUpdate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_session),
):
    salary_config = db.exec(
        select(SalaryConfig).where(SalaryConfig.user_id == id)
    ).first()
    if not salary_config:
        raise HTTPException(status_code=404, detail="Salary config not found")

    update_dict = update_data.model_dump(exclude_unset=True)
    for key, value in update_dict.items():
        setattr(salary_config, key, value)

    db.add(salary_config)
    db.commit()
    return {"message": "Salary config updated successfully"}
