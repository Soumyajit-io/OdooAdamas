# Time Off Module Plan

## Overview
The Time Off module manages employee leave requests, tracks leave balances, and facilitates the approval process. It provides a visual, calendar-based interface for standard employees and a centralized, list-based dashboard for Admins/HR Officers to process requests.

---

## Frontend Plan

### 1. Employee View (My Time Off)
**Purpose:** Allows employees to request leaves and visually track their statuses on an annual calendar.
**UI Elements (Based on Wireframes):**
- **Navigation:** "Time Off" sub-tab (Employees do not see the "Allocation" tab).
- **Action Bar:** A prominent "NEW" button to request time off.
- **Leave Balances Widget:**
  - Displays remaining balances for specific leave types:
    - Paid Time Off (e.g., "24 Days Available")
    - Sick Time Off (e.g., "07 Days Available")
- **Yearly Calendar View:**
  - Displays a 12-month calendar mapping out requested leaves.
  - **Color-Coded Statuses:** 
    - **Validated:** Approved leaves (e.g., purple/solid color).
    - **To Approve:** Pending requests (e.g., striped/hashed color).
    - **Refused:** Rejected requests (e.g., red dash).
- **Information Panel (Right Sidebar):**
  - **Legend:** Explains the calendar colors.
  - **Public Holidays:** A list of company-wide holidays for the year (e.g., Jan 14: Kite Festival, Aug 15: Independence Day).

### 2. Time Off Request Modal (For Employees)
Triggered by the "NEW" button.
**Fields:**
- **Employee Name:** Read-only (Auto-filled).
- **Time Off Type:** Dropdown selector (`Paid time off`, `Sick Leave`, `Unpaid Leaves`).
- **Validity Period:** Start Date and End Date pickers.
- **Allocation:** Auto-calculated number of days based on the selected period (excluding weekends/holidays).
- **Attachment:** File upload button (mandatory or optional depending on company policy, e.g., medical certificates for Sick Leave).
- **Actions:** Submit / Discard.

### 3. Admin/HR Officer View
**Purpose:** Centralized management of all employee leave requests and global leave allocations.
**UI Elements (Based on Wireframes):**
- **Navigation:** "Time Off" and "Allocation" sub-tabs.
- **Action Bar:** Search bar to filter requests by Employee Name.
- **Time Off Requests List:**
  - **Columns:** Name (Employee Name), Start Date, End Date, Time Off Type, Status.
  - **Actions:** Explicit "Approve" (Green button) and "Reject" (Red button) icons in the Status column for pending requests.

---

## Backend Plan

### 1. Database Schemas / Models

**Time Off Request Model:**
- `id`: UUID (Primary Key)
- `user_id`: UUID (Foreign Key to User)
- `leave_type`: Enum (`PAID`, `SICK`, `UNPAID`)
- `start_date`: Date
- `end_date`: Date
- `requested_days`: Decimal (e.g., 1.0, 2.5)
- `attachment_url`: String (Nullable, link to uploaded certificate file)
- `status`: Enum (`PENDING`, `APPROVED`, `REJECTED`)
- `reviewed_by`: UUID (Foreign Key to User, tracking which Admin/HR approved/rejected it)
- `created_at`: Timestamp

**Leave Allocation Model (per User per Year):**
- `id`: UUID
- `user_id`: UUID
- `year`: Integer (e.g., 2026)
- `total_paid_leaves`: Decimal (e.g., 24.0)
- `used_paid_leaves`: Decimal (e.g., 0.0)
- `total_sick_leaves`: Decimal (e.g., 7.0)
- `used_sick_leaves`: Decimal (e.g., 0.0)
- *(Note: 'Available' balances on the UI are calculated as `total` - `used`)*

**Public Holidays Model:**
- `id`: UUID
- `date`: Date
- `name`: String (e.g., "Republic Day")

### 2. API Endpoints

#### Employee Endpoints
- **`GET /api/timeoff/me`**
  - **Purpose:** Load the employee's calendar and balances.
  - **Response:** Returns the current year's leave allocations, all time off requests (to paint the calendar), and the list of public holidays.
- **`POST /api/timeoff/request`**
  - **Logic:** 
    1. Validate dates (ensure `end_date` >= `start_date`).
    2. Calculate exact `requested_days` by omitting weekends and `Public Holidays` falling in the range.
    3. If requesting `PAID` or `SICK` leave, verify that `requested_days` <= (`total` - `used` + `pending`).
    4. Save the request with status `PENDING`.

#### Admin/HR Endpoints
- **`GET /api/timeoff/requests`**
  - **Purpose:** Fetch all time off requests (filtered by `PENDING` by default, searchable by employee).
- **`PUT /api/timeoff/requests/:id/approve`**
  - **Logic:**
    1. Update status to `APPROVED`.
    2. Record the `reviewed_by` user ID.
    3. If the leave type is `PAID` or `SICK`, increment the user's `used_paid_leaves` or `used_sick_leaves` accordingly.
    4. **Crucial Integration:** Once approved, these dates feed into the **Attendance Module** to calculate "Approved Paid Leaves" for payroll processing.
- **`PUT /api/timeoff/requests/:id/reject`**
  - **Logic:** Update status to `REJECTED`. The requested days are NOT added to the used balance.

#### Configuration Endpoints (Admin)
- **`GET /api/timeoff/allocations` & `PUT /api/timeoff/allocations`**
  - **Purpose:** Manage global or individual leave allocations for a given year.
- **`GET /api/public-holidays` & `POST /api/public-holidays`**
  - **Purpose:** Manage the company's holiday calendar.
