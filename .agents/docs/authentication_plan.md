# Authentication Module Plan

## Overview
The authentication module forms the entry point of the application, consisting of **Sign Up** and **Sign In** pages. It manages the registration of company admins and the login process for all users (Admins, HR, and Employees). Based on the wireframes and requirements, the Sign Up page is intended for initial company/admin registration, while the Sign In page is for all users. Normal employees cannot register themselves; they are created by an HR officer or Admin.

---

## Frontend Plan

### 1. Sign Up Page
**Purpose:** Initial registration for a new Company and its Admin.
**UI Elements (Based on Wireframe):**
- App/Web Logo
- Company Name Input (with an upload button for Company Logo)
- Name Input
- Email Input
- Phone Input
- Password Input (with visibility toggle)
- Confirm Password Input (with visibility toggle)
- "Sign Up" Button (Primary action, purple)
- "Already have an account? Sign In" (Navigation link)

**State & Validation:**
- Manage form state for all inputs.
- Validations:
  - Required fields check.
  - Email format validation.
  - Phone number format validation.
  - Password complexity (optional but recommended).
  - Password and Confirm Password must match.

### 2. Sign In Page
**Purpose:** Login interface for all users (Admin, HR, Employees).
**UI Elements (Based on Wireframe):**
- App/Web Logo
- Login Id/Email Input
- Password Input
- "SIGN IN" Button (Primary action, purple)
- "Don't have an account? Sign Up" (Navigation link)

**State & Validation:**
- Manage form state for Login ID/Email and Password.
- Validations:
  - Required fields check.

### 3. First-Time Login Flow (Employees)
- When a user logs in for the first time with their auto-generated password, the system should detect their `is_first_login` status.
- The frontend should prompt or redirect the user to a "Change Password" screen to set their own custom password before accessing the main dashboard.

---

## Backend Plan

### 1. Database Schemas / Models

**Company Model:**
- `id`: UUID (Primary Key)
- `company_name`: String
- `company_logo_url`: String (Nullable)
- `created_at`: Timestamp

**User (Employee) Model:**
- `id`: UUID (Primary Key)
- `company_id`: UUID (Foreign Key)
- `role`: Enum (`ADMIN`, `HR`, `EMPLOYEE`)
- `first_name`: String
- `last_name`: String
- `email`: String (Unique)
- `phone`: String
- `login_id`: String (Unique, e.g., OIJODO20220001)
- `password_hash`: String
- `is_first_login`: Boolean (Default: `true` for created employees, `false` for Admin signups)
- `created_at`: Timestamp
- `joining_date`: Date (Used for ID generation)

### 2. API Endpoints

#### `POST /api/auth/signup`
- **Purpose:** Register a new company and its admin.
- **Logic:**
  1. Validate incoming data (passwords match, email unique).
  2. Create a new `Company` record.
  3. Generate the Admin's `login_id` (see logic below).
  4. Hash the password.
  5. Create a `User` record linked to the Company with the `ADMIN` role.
  6. Return success message and JWT token.

#### `POST /api/auth/signin`
- **Purpose:** Authenticate a user.
- **Logic:**
  1. Find user by `login_id` OR `email`.
  2. Compare password against `password_hash`.
  3. If successful, generate a JWT token containing user ID, role, and company ID.
  4. Return user info and token (along with `is_first_login` flag).

#### `POST /api/employees` (Protected: Admin/HR only)
- **Purpose:** Create a new employee (since normal users cannot register).
- **Logic:**
  1. Verify the caller has Admin or HR privileges.
  2. Generate a random temporary password.
  3. Generate the custom `login_id` (see logic below).
  4. Hash the temporary password.
  5. Create the `User` record with `is_first_login` set to `true`.
  6. **Action:** Send an email to the new employee containing their `login_id` and the temporary password.
  7. Return the created employee details.

#### `POST /api/auth/change-password` (Protected)
- **Purpose:** Allow users to change their system-generated password.
- **Logic:**
  1. Verify the user's current password.
  2. Hash the new password and update the database.
  3. Set `is_first_login` to `false`.

---

## 3. Login ID Generation Logic

The Login ID must follow the format: `[Prefix][NameCode][Year][Serial]`
Example: `OIJODO20220001`

- **Prefix (`OI`):** Represents the Company Name (e.g., Odoo India). *Note: For a multi-tenant SaaS, this could be dynamically derived from the first two letters of the `company_name`.*
- **NameCode (`JODO`):** The first two letters of the employee's First Name + the first two letters of their Last Name. All converted to uppercase. *(Edge case handling: if a name is 1 character long, pad with a placeholder like 'X')*.
- **Year (`2022`):** The 4-digit year of joining.
- **Serial (`0001`):** A 4-digit serial number. 
  - *Implementation:* The backend will query the database for the highest serial number of employees who joined in that specific year for that specific company. It will increment that number by 1 and pad it with leading zeros to ensure it is 4 digits long.
