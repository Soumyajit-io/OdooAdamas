# HRMS API Specifications

This document provides highly detailed specifications for all FastAPI endpoints. It is designed so that a backend developer or AI model can implement the routes exactly as defined.

## Base Configuration
- **Base URL:** `/api/v1`
- **Authentication:** Most endpoints require a Clerk JWT.
- **Header:** `Authorization: Bearer <clerk_token>`
- **Content-Type:** `application/json`

---

## 1. Webhooks

### 1.1 Clerk Webhook
Syncs user data from Clerk to the local Supabase database.
- **Method:** `POST`
- **Path:** `/api/v1/webhooks/clerk`
- **Auth Required:** No (Uses Svix Webhook Signature verification)
- **Headers:** 
  - `svix-id`: string
  - `svix-timestamp`: string
  - `svix-signature`: string
- **Request Body (from Clerk):** 
  ```json
  {
    "data": {
      "id": "user_2...",
      "email_addresses": [{"email_address": "user@example.com"}],
      "first_name": "John",
      "last_name": "Doe",
      "image_url": "https://..."
    },
    "type": "user.created"
  }
  ```
- **Response:**
  - `200 OK`: `{"status": "success"}`
  - `400 Bad Request`: `{"detail": "Invalid payload or signature"}`

---

## 2. User Profile API

### 2.1 Get Own Profile
- **Method:** `GET`
- **Path:** `/api/v1/users/me`
- **Auth Required:** Yes (Any role)
- **Response:**
  - `200 OK`:
    ```json
    {
      "id": "user_2...",
      "employee_id": "EMP-1234",
      "email": "user@example.com",
      "role": "EMPLOYEE",
      "first_name": "John",
      "last_name": "Doe",
      "phone": "+123456789",
      "address": "123 Main St",
      "profile_picture_url": "https://...",
      "job_title": "Software Engineer"
    }
    ```
  - `401 Unauthorized`
  - `404 Not Found`: `{"detail": "User not found in DB"}`

### 2.2 Update Own Profile
- **Method:** `PUT`
- **Path:** `/api/v1/users/me`
- **Auth Required:** Yes (Any role)
- **Request Body:**
  ```json
  {
    "phone": "+987654321",
    "address": "456 New Ave"
  }
  ```
- **Response:**
  - `200 OK`: Returns the updated user object (same schema as 2.1).
  - `400 Bad Request`

### 2.3 Get All Users (Admin)
- **Method:** `GET`
- **Path:** `/api/v1/users`
- **Auth Required:** Yes (ADMIN only)
- **Response:**
  - `200 OK`:
    ```json
    [
      {
        "id": "user_2...",
        "employee_id": "EMP-1234",
        "first_name": "John",
        "last_name": "Doe",
        "email": "user@example.com",
        "job_title": "Software Engineer",
        "role": "EMPLOYEE"
      }
    ]
    ```
  - `403 Forbidden`: `{"detail": "Admin access required"}`

### 2.4 Update User (Admin)
- **Method:** `PUT`
- **Path:** `/api/v1/users/{user_id}`
- **Auth Required:** Yes (ADMIN only)
- **Path Parameter:** `user_id` (string, Clerk ID)
- **Request Body:**
  ```json
  {
    "employee_id": "EMP-1234",
    "job_title": "Senior Engineer",
    "role": "ADMIN"
  }
  ```
- **Response:**
  - `200 OK`: Returns updated user object.
  - `403 Forbidden`, `404 Not Found`

---

## 3. Attendance API

### 3.1 Check-In
- **Method:** `POST`
- **Path:** `/api/v1/attendance/check-in`
- **Auth Required:** Yes (Any role)
- **Response:**
  - `201 Created`:
    ```json
    {
      "id": "uuid-...",
      "user_id": "user_2...",
      "date": "2024-05-20",
      "check_in": "2024-05-20T09:00:00Z",
      "status": "PRESENT"
    }
    ```
  - `400 Bad Request`: `{"detail": "Already checked in today"}`

### 3.2 Check-Out
- **Method:** `POST`
- **Path:** `/api/v1/attendance/check-out`
- **Auth Required:** Yes (Any role)
- **Response:**
  - `200 OK`: Returns the updated attendance record with `check_out` timestamp.
  - `400 Bad Request`: `{"detail": "Not checked in"}` or `{"detail": "Already checked out"}`

### 3.3 Get Own Attendance
- **Method:** `GET`
- **Path:** `/api/v1/attendance/me`
- **Auth Required:** Yes (Any role)
- **Query Params (Optional):** `start_date` (YYYY-MM-DD), `end_date` (YYYY-MM-DD)
- **Response:**
  - `200 OK`:
    ```json
    [
      {
        "id": "uuid-...",
        "date": "2024-05-20",
        "check_in": "2024-05-20T09:00:00Z",
        "check_out": "2024-05-20T17:00:00Z",
        "status": "PRESENT"
      }
    ]
    ```

### 3.4 Get All Attendance (Admin)
- **Method:** `GET`
- **Path:** `/api/v1/attendance`
- **Auth Required:** Yes (ADMIN only)
- **Query Params (Optional):** `start_date`, `end_date`, `user_id`
- **Response:**
  - `200 OK`: Array of attendance records, including `user_id` and basic user info.

---

## 4. Leave Management API

### 4.1 Apply for Leave
- **Method:** `POST`
- **Path:** `/api/v1/leaves`
- **Auth Required:** Yes (Any role)
- **Request Body:**
  ```json
  {
    "leave_type": "PAID",
    "start_date": "2024-06-01",
    "end_date": "2024-06-05",
    "remarks": "Going on a family vacation"
  }
  ```
- **Response:**
  - `201 Created`:
    ```json
    {
      "id": "uuid-...",
      "status": "PENDING",
      "leave_type": "PAID",
      "start_date": "2024-06-01",
      "end_date": "2024-06-05"
    }
    ```

### 4.2 Get Own Leaves
- **Method:** `GET`
- **Path:** `/api/v1/leaves/me`
- **Auth Required:** Yes (Any role)
- **Response:** `200 OK` (Array of leave request objects)

### 4.3 Get All Leaves (Admin)
- **Method:** `GET`
- **Path:** `/api/v1/leaves`
- **Auth Required:** Yes (ADMIN only)
- **Query Params (Optional):** `status` (PENDING, APPROVED, REJECTED)
- **Response:** `200 OK` (Array of all leave requests)

### 4.4 Update Leave Status (Admin)
- **Method:** `PATCH`
- **Path:** `/api/v1/leaves/{leave_id}/status`
- **Auth Required:** Yes (ADMIN only)
- **Path Parameter:** `leave_id` (UUID)
- **Request Body:**
  ```json
  {
    "status": "APPROVED",
    "admin_comments": "Enjoy your trip!"
  }
  ```
- **Response:** `200 OK` (Updated leave record)

---

## 5. Payroll API

### 5.1 Get Own Payroll
- **Method:** `GET`
- **Path:** `/api/v1/payroll/me`
- **Auth Required:** Yes (Any role)
- **Response:**
  - `200 OK`:
    ```json
    [
      {
        "id": "uuid-...",
        "base_salary": 5000.00,
        "allowances": 200.00,
        "deductions": 50.00,
        "net_salary": 5150.00,
        "pay_period_start": "2024-05-01",
        "pay_period_end": "2024-05-31"
      }
    ]
    ```

### 5.2 Get All Payrolls (Admin)
- **Method:** `GET`
- **Path:** `/api/v1/payroll`
- **Auth Required:** Yes (ADMIN only)
- **Response:** `200 OK` (Array of payroll records across employees)

### 5.3 Update Salary Structure (Admin)
- **Method:** `PUT`
- **Path:** `/api/v1/payroll/{payroll_id}`
- **Auth Required:** Yes (ADMIN only)
- **Path Parameter:** `payroll_id` (UUID)
- **Request Body:**
  ```json
  {
    "base_salary": 5500.00,
    "allowances": 300.00,
    "deductions": 0.00
  }
  ```
- **Response:**
  - `200 OK`: Returns the updated payroll record with recalculated `net_salary`.
