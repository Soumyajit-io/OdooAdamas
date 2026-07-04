from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from datetime import date
import uuid
from app.schemas.payroll import PayrollResponse, PayrollUpdateAdmin
from app.schemas.user import UserResponse
from app.api.deps import get_current_user, get_current_admin

router = APIRouter()

@router.get("/me", response_model=List[PayrollResponse])
async def get_own_payroll(
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Returns the current employee's salary and payroll history.
    """
    # TODO: Query Supabase database for payroll records where user_id == current_user.id.
    # Return list of payroll records.
    
    return [
        PayrollResponse(
            id=uuid.uuid4(),
            user_id=current_user.id,
            base_salary=5000.00,
            allowances=200.00,
            deductions=50.00,
            net_salary=5150.00,
            pay_period_start=date(2024, 5, 1),
            pay_period_end=date(2024, 5, 31)
        )
    ]

@router.get("", response_model=List[PayrollResponse])
async def get_all_payrolls(
    admin_user: UserResponse = Depends(get_current_admin)
):
    """
    Admin-only endpoint to retrieve all payroll records across employees.
    """
    # TODO: Query Supabase database for all payroll records.
    # Return list of payroll records.
    
    return [
        PayrollResponse(
            id=uuid.uuid4(),
            user_id="user_mock_123",
            base_salary=5000.00,
            allowances=200.00,
            deductions=50.00,
            net_salary=5150.00,
            pay_period_start=date(2024, 5, 1),
            pay_period_end=date(2024, 5, 31)
        )
    ]

@router.put("/{payroll_id}", response_model=PayrollResponse)
async def update_salary_structure(
    payroll_id: uuid.UUID,
    payload: PayrollUpdateAdmin,
    admin_user: UserResponse = Depends(get_current_admin)
):
    """
    Admin-only endpoint to update salary structures. Recalculates net_salary automatically.
    """
    # TODO: Fetch payroll record by payroll_id from Supabase.
    # If not found, raise HTTPException(status_code=404, detail="Payroll record not found")
    # TODO: Update base_salary, allowances, deductions fields.
    # TODO: Recalculate net_salary = base_salary + allowances - deductions.
    # TODO: Save updated record to Supabase.
    # Return updated payroll record.
    
    base = payload.base_salary if payload.base_salary is not None else 5000.00
    allowances = payload.allowances if payload.allowances is not None else 200.00
    deductions = payload.deductions if payload.deductions is not None else 50.00
    net = base + allowances - deductions
    
    return PayrollResponse(
        id=payroll_id,
        user_id="user_mock_123",
        base_salary=base,
        allowances=allowances,
        deductions=deductions,
        net_salary=net,
        pay_period_start=date(2024, 5, 1),
        pay_period_end=date(2024, 5, 31)
    )
