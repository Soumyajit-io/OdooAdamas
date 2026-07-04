# Attendance Module Plan

## Overview
The Attendance module tracks employee check-ins and check-outs, calculates work hours, and provides distinct views tailored for standard Employees and Admin/HR Officers. This module is closely tied to payroll, as attendance data directly determines the total payable days during payslip generation.

---

## Frontend Plan

### 1. Employee View (My Attendance)
**Purpose:** Allows employees to view their own day-wise attendance records for an ongoing (or selected) month.
**UI Elements (Based on Wireframe):**
- **Navigation Controls:** Month selector with `<` and `>` arrows, and a Month dropdown (e.g., "Oct").
- **Summary Dashboard:** 
  - **Count of days present:** Total days checked in.
  - **Leaves count:** Approved time off.
  - **Total working days:** Total expected working days for the month.
- **Attendance Table:**
  - **Date:** e.g., 28/10/2025
  - **Check In:** Timestamp (e.g., 10:00)
  - **Check Out:** Timestamp (e.g., 19:00)
  - **Work Hours:** Calculated total duration (e.g., 09:00).
  - **Extra Hours:** Any time logged beyond the standard working hours (e.g., 01:00).

### 2. Admin/HR Officer View (Company Attendance)
**Purpose:** Allows Admins and HR to view the attendance of *all* employees for a specific day.
**UI Elements (Based on Wireframe):**
- **Action Bar:** Search bar to quickly find a specific employee.
- **Navigation Controls:** Date selector with `<` and `>` arrows, a Date dropdown, and a "Day" view toggle.
- **Header:** Displays the selected date (e.g., 22, October 2025).
- **Attendance Table:**
  - **Emp:** Employee Name and/or Profile Picture.
  - **Check In**
  - **Check Out**
  - **Work Hours**
  - **Extra Hours**

### 3. State & Logic
- The UI should dynamically switch modes based on the logged-in user's role (Admin/HR sees the Daily Company view by default, Employees see their Monthly view).
- Standardize time displays in HH:MM format.

---

## Backend Plan

### 1. Database Schemas / Models

**Attendance Model:**
- `id`: UUID (Primary Key)
- `user_id`: UUID (Foreign Key to User)
- `date`: Date (The actual calendar date of the shift)
- `check_in_time`: Timestamp
- `check_out_time`: Timestamp (Nullable, updated upon check-out)
- `work_hours`: Decimal / Interval (Calculated duration)
- `extra_hours`: Decimal / Interval (Calculated duration)
- `status`: Enum (`PRESENT`, `ABSENT`, `HALF_DAY`)
- `created_at`: Timestamp

### 2. API Endpoints

#### `GET /api/attendance/me` (Employee)
- **Purpose:** Fetch the logged-in user's attendance for a given month.
- **Query Params:** `month` (1-12), `year` (e.g., 2025).
- **Response:** 
  - Summary stats: `days_present`, `leaves_count`, `total_working_days`.
  - Array of daily attendance records.

#### `GET /api/attendance` (Protected: Admin/HR Only)
- **Purpose:** Fetch attendance for all employees on a specific date.
- **Query Params:** `date` (e.g., 2025-10-22), `search` (optional).
- **Response:** Array of employee attendance records (Name, Check-In, Check-Out, Work Hours, Extra Hours).

#### `POST /api/attendance/check-in`
- **Logic:** 
  1. Validate the user hasn't already checked in for the day.
  2. Create a new `Attendance` record with `user_id`, current `date`, and `check_in_time`.
  3. Mark status as `PRESENT`.

#### `POST /api/attendance/check-out`
- **Logic:** 
  1. Find the active `Attendance` record for the user for today.
  2. Update `check_out_time`.
  3. **Calculation:** 
     - Fetch the employee's standard schedule from the Salary Configuration (`working_days_per_week`, `break_time_mins`, implied daily hours).
     - `Total Duration` = `check_out_time` - `check_in_time`.
     - `Work Hours` = `Total Duration` - `break_time_mins`.
     - `Extra Hours` = `Work Hours` - (Standard Daily Hours). If negative, `Extra Hours` = 0.
  4. Save the calculated times back to the database.

### 3. Payroll / Payslip Computation Logic
The system must automatically determine the number of **Payable Days** for salary computation.

**Computation Rules:**
- **Total Days in Month:** e.g., 31 for October.
- **Weekends/Holidays:** Subtracted from Total Days to get Expected Working Days (unless configured otherwise in company settings).
- **Days Present:** A count of valid `Attendance` records for the month.
- **Approved Paid Leaves:** Fetched from the Time Off module for that month.
- **Payable Days:** `Days Present` + `Approved Paid Leaves` + `Weekends/Holidays` (if company policy pays for weekends).
- **Deductions:** Any day that falls on a working day where there is *no attendance record* and *no approved paid leave* is automatically treated as an **unpaid absence**. This inherently reduces the `Payable Days`, effectively reducing the generated salary components for that month.
