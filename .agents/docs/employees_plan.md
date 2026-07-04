# Employees Module Plan

## Overview
The Employees tab serves as the main dashboard (landing page) after login. It displays a grid view of all employees with their current attendance status. Clicking on an employee (or accessing "My Profile" from the navbar) opens a detailed profile view with multiple tabs (Resume, Private Info, Salary Info, Security). 

---

## Frontend Plan

### 1. Employees Dashboard (Grid View)
**UI Elements:**
- **Top Navigation Bar:** Company Logo, Main Tabs (Employees, Attendance, Time Off), and the User's Profile Picture (Avatar).
- **Avatar Dropdown:** Contains "My Profile", "Log Out", and a SysTray for "Check IN ->" and "Check Out ->".
- **Action Bar:** "NEW" button (visible to Admin/HR for creating new users) and a Search Bar.
- **Employee Cards Grid:** Each card displays:
  - Profile Picture
  - Employee Name
  - Status Indicator (Top-right corner):
    - 🟢 **Green dot:** Present (Successfully checked in)
    - 🔴 **Red dot / 🟡 Yellow dot:** Absent / Not checked in yet (The wireframe mentions both; we can use Red for "not checked in yet today" and Yellow for "marked absent").
    - ✈️ **Airplane icon:** On leave

### 2. Employee Profile View
Accessed via "My Profile" or by clicking an employee card.

**Header Section:**
- **Avatar:** Editable profile picture.
- **Identity:** Name, Login ID, Email, Mobile.
- **Work Details:** Company, Department, Manager, Location.

**Tabs:**
1. **Resume Tab:**
   - Text areas for: About, What I love about my job, My interests and hobbies.
   - Dynamic lists for: Skills, Certifications (with "+ Add" buttons).

2. **Private Info Tab (Self or Admin/HR only):**
   - **Personal Info:** Date of Birth, Residing Address, Nationality, Personal Email, Gender, Marital Status, Date of Joining.
   - **Bank Details:** Account Number, Bank Name, IFSC Code, UAN NO, Emp Code.

3. **Salary Info Tab (Strictly Admin Only):**
   - **Base Configuration:** 
     - Month Wage (e.g., ₹50,000)
     - Yearly Wage (Auto-calculated: Month Wage * 12)
     - No. of working days in a week, Break Time.
   - **Salary Components (Auto-Calculated):**
     - **Basic Salary:** 50% of Month Wage.
     - **House Rent Allowance (HRA):** 50% of Basic Salary.
     - **Standard Allowance:** Fixed amount (e.g., ₹4167).
     - **Performance Bonus:** 8.33% of Basic Salary.
     - **Leave Travel Allowance (LTA):** 8.33% of Basic Salary.
     - **Fixed Allowance:** (Month Wage) - (Sum of all above components).
   - **Contributions & Deductions:**
     - **Provident Fund (PF):** 12% of Basic Salary (Employee Contribution & Employer Contribution).
     - **Professional Tax:** Fixed amount (e.g., ₹200).
   - *Behavior:* Modifying the "Month Wage" input must automatically recalculate and update all dependent fields in real-time on the UI. Total of components strictly equals the Month Wage.

4. **Security Tab:**
   - Likely contains Change Password functionality (as referenced in the Auth module plan).

---

## Backend Plan

### 1. Database Schemas / Models

**Employee (User) Model Updates (Extending Auth Model):**
- `profile_picture_url`: String
- `department`: String
- `manager_id`: UUID (Foreign Key to User)
- `location`: String
- `current_status`: Enum (`PRESENT`, `ABSENT`, `ON_LEAVE`, `NOT_CHECKED_IN`)

**Resume Model (1-to-1 with User):**
- `user_id`: UUID
- `about_me`: Text
- `job_love`: Text
- `hobbies`: Text
- `skills`: JSON (Array of strings/objects)
- `certifications`: JSON (Array of strings/objects)

**Private Info Model (1-to-1 with User):**
- `user_id`: UUID
- `dob`: Date
- `address`: Text
- `nationality`: String
- `personal_email`: String
- `gender`: String
- `marital_status`: String
- `bank_account_number`: String
- `bank_name`: String
- `ifsc_code`: String
- `uan_no`: String
- `emp_code`: String

**Salary Configuration Model (1-to-1 with User):**
- `user_id`: UUID
- `monthly_wage`: Decimal
- `working_days_per_week`: Integer
- `break_time_mins`: Integer
- *Note: We store the base `monthly_wage`. The individual components can either be strictly calculated on-the-fly via a utility function (to ensure they are never out of sync) or we can store the computed values if manual overrides are allowed in the future.*

### 2. API Endpoints

#### `GET /api/employees`
- **Purpose:** Fetch the list of employees for the Grid view.
- **Query Params:** `search` (for filtering by name/ID).
- **Response:** Returns `id`, `name`, `profile_picture_url`, `current_status`.

#### `GET /api/employees/:id/profile`
- **Purpose:** Fetch aggregated profile data (Header, Resume, Private Info).
- **Logic:** Joins User, Resume, and Private Info tables. Redacts Private Info if the requester is not the user themselves or an Admin/HR.

#### `PUT /api/employees/:id/profile`
- **Purpose:** Update general profile or resume information.

#### `GET /api/employees/:id/salary` (Protected: Admin Only)
- **Purpose:** Fetch the salary configuration.
- **Logic:** Returns `monthly_wage` along with dynamically calculated components (Basic, HRA, PF, etc.) based on the standard formulas.

#### `PUT /api/employees/:id/salary` (Protected: Admin Only)
- **Purpose:** Update the `monthly_wage` and working schedule details.

#### `POST /api/attendance/check-in` & `POST /api/attendance/check-out`
- **Purpose:** Handle the Check IN/OUT functionality from the UI sys-tray.
- **Logic:** 
  - Records timestamp in an Attendance table.
  - Updates the user's `current_status` in the Employee model to `PRESENT` (on Check-In).
