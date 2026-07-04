# Human Resource Management System - System Architecture

This document outlines the system architecture, technology stack, database schema, and API routes for the HRMS project based on the PRD requirements.

## 1. Technology Stack

### 1.1 Frontend
- **Framework:** React
- **Build Tool:** Vite
- **Language:** JavaScript/TypeScript
- **Styling:** CSS / Tailwind CSS (Optional, based on final preference)
- **State Management:** React Context API or Redux (for complex state like Auth, User Data)
- **Routing:** React Router
- **Authentication:** Clerk React SDK (`@clerk/clerk-react`)

### 1.2 Backend
- **Framework:** FastAPI
- **Language:** Python 3.10+
- **Authentication:** Clerk (Identity Provider) & JWT Verification
- **Validation & Serialization:** Pydantic
- **ORM:** SQLAlchemy (or direct Supabase Client)

### 1.3 Database
- **Provider:** Supabase (Managed PostgreSQL)
- **Database Type:** Relational SQL

---

## 2. System Architecture overview
The application follows a standard client-server architecture:
1. **Client (React SPA):** Handles the UI, user interactions, and renders dashboards (Admin & Employee).
2. **Authentication (Clerk):** Clerk handles signup, login, multi-factor authentication, and session management on the frontend.
3. **API (FastAPI):** Exposes RESTful endpoints, handles business logic, validates Clerk session JWTs, and enforces authorization.
4. **Database (Supabase PostgreSQL):** Persists all user profile details, attendance, leave, and payroll data.

---

## 3. Database Schema

### 3.1 `users` Table
Stores profile data synced from Clerk and HR-specific data.
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | VARCHAR | Primary Key | Clerk User ID (`user_...`) |
| `employee_id` | VARCHAR | Unique | Org-level employee ID |
| `email` | VARCHAR | Unique | User's email |
| `role` | ENUM | Not Null | `ADMIN` or `EMPLOYEE` |
| `first_name` | VARCHAR | | Employee first name |
| `last_name` | VARCHAR | | Employee last name |
| `phone` | VARCHAR | | Phone number |
| `address` | TEXT | | Residential address |
| `profile_picture_url`| VARCHAR | | URL to profile picture (from Clerk) |
| `job_title` | VARCHAR | | E.g., Software Engineer |
| `created_at` | TIMESTAMP | | Record creation date |

### 3.2 `attendance` Table
Tracks daily employee check-ins/check-outs.
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | Primary Key | Unique identifier |
| `user_id` | VARCHAR | Foreign Key | References `users(id)` |
| `date` | DATE | Not Null | Date of attendance |
| `check_in` | TIMESTAMP | | Time of check-in |
| `check_out` | TIMESTAMP | | Time of check-out |
| `status` | ENUM | Not Null | `PRESENT`, `ABSENT`, `HALF_DAY`, `LEAVE`|

### 3.3 `leave_requests` Table
Manages employee leave applications.
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | Primary Key | Unique identifier |
| `user_id` | VARCHAR | Foreign Key | References `users(id)` |
| `leave_type` | ENUM | Not Null | `PAID`, `SICK`, `UNPAID` |
| `start_date` | DATE | Not Null | Leave start date |
| `end_date` | DATE | Not Null | Leave end date |
| `status` | ENUM | Default: PENDING| `PENDING`, `APPROVED`, `REJECTED`|
| `remarks` | TEXT | | Employee reason for leave |
| `admin_comments`| TEXT | | Admin feedback |
| `created_at` | TIMESTAMP | | Submission time |

### 3.4 `payroll` Table
Manages salary structures and payroll history.
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | Primary Key | Unique identifier |
| `user_id` | VARCHAR | Foreign Key | References `users(id)` |
| `base_salary` | DECIMAL | Not Null | Base pay amount |
| `allowances` | DECIMAL | Default: 0 | Additional pay (bonus, etc) |
| `deductions` | DECIMAL | Default: 0 | Tax, unpaid leave deductions|
| `net_salary` | DECIMAL | Not Null | Final calculated salary |
| `pay_period_start` | DATE | Not Null | Period start date |
| `pay_period_end` | DATE | Not Null | Period end date |

---

## 4. API Routes (REST)

*Note: All API routes (except Webhooks) require a valid Clerk Bearer Token in the `Authorization` header.*

### 4.1 Authentication & Sync
- **Frontend Authentication:** Signup, login, and email verification are fully handled by Clerk UI components on the React frontend.
- **Webhook:** `POST /api/v1/webhooks/clerk`
  - Triggered on `user.created` or `user.updated` events from Clerk.
  - Syncs core user identity (email, names, profile picture) into the Supabase `users` table.

### 4.2 User Profile
- `GET /api/v1/users/me` (Role: Employee/Admin)
  - Fetches the current logged-in user profile from Supabase.
- `PUT /api/v1/users/me` (Role: Employee/Admin)
  - Body: `{ phone, address }`
  - Updates limited fields for the employee.
- `GET /api/v1/users` (Role: Admin)
  - Fetches all employees for the dashboard list.
- `PUT /api/v1/users/{user_id}` (Role: Admin)
  - Body: `{ job_title, role, base_salary, ... }`
  - Admin updates full employee details.

### 4.3 Attendance
- `POST /api/v1/attendance/check-in` (Role: Employee)
  - Records a check-in timestamp.
- `POST /api/v1/attendance/check-out` (Role: Employee)
  - Records a check-out timestamp.
- `GET /api/v1/attendance/me` (Role: Employee)
  - Query Params: `?start_date=xxx&end_date=xxx`
  - Returns own attendance logs.
- `GET /api/v1/attendance` (Role: Admin)
  - Query Params: `?start_date=xxx&end_date=xxx&user_id=xxx`
  - Returns attendance records of all employees.

### 4.4 Leave Management
- `POST /api/v1/leaves` (Role: Employee)
  - Body: `{ leave_type, start_date, end_date, remarks }`
  - Creates a new leave request.
- `GET /api/v1/leaves/me` (Role: Employee)
  - Returns the employee's own leave requests.
- `GET /api/v1/leaves` (Role: Admin)
  - Query Params: `?status=PENDING`
  - Returns all leave requests for admin review.
- `PATCH /api/v1/leaves/{leave_id}/status` (Role: Admin)
  - Body: `{ status: 'APPROVED' | 'REJECTED', admin_comments }`
  - Approves or rejects a leave request.

### 4.5 Payroll Management
- `GET /api/v1/payroll/me` (Role: Employee)
  - Returns the employee's salary and payroll history (read-only).
- `GET /api/v1/payroll` (Role: Admin)
  - Returns payroll summaries for all employees.
- `PUT /api/v1/payroll/{payroll_id}` (Role: Admin)
  - Updates salary structure (base, allowances, deductions).
