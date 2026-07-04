import { createContext, useContext, useState, useEffect } from 'react';
import { useUser } from "@clerk/clerk-react";

const HRMSContext = createContext();

const normalizeEmployee = (employee = {}) => {
  const firstName = employee.first_name || employee.firstName || '';
  const lastName = employee.last_name || employee.lastName || '';
  const role = (employee.role || 'EMPLOYEE').toUpperCase();

  return {
    ...employee,
    id: employee.id || employee.user_id || '',
    employee_id: employee.employee_id || employee.employeeId || '',
    role,
    first_name: firstName,
    last_name: lastName,
    name: [firstName, lastName].filter(Boolean).join(' ') || employee.name || '',
    phone: employee.phone || '',
    address: employee.address || '',
    profile_picture_url: employee.profile_picture_url || employee.profilePictureUrl || '',
    job_title: employee.job_title || employee.jobTitle || '',
    jobTitle: employee.job_title || employee.jobTitle || '',
    department: employee.department || '',
    joining_date: employee.joining_date || employee.joinDate || '',
    joinDate: employee.joining_date || employee.joinDate || '',
    salary: employee.salary ?? 0,
    is_active: employee.is_active ?? true,
  };
};

const initialEmployees = [
  {
    id: 'user_001',
    employee_id: 'EMP001',
    email: 'john@adamas.com',
    role: 'EMPLOYEE',
    first_name: 'John',
    last_name: 'Doe',
    phone: '+1 (555) 123-4567',
    address: '123 Tech Lane, Silicon Valley, CA',
    profile_picture_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    job_title: 'Software Engineer',
    department: 'Engineering',
    joining_date: '2024-01-15',
    salary: 5500,
    is_active: true,
  },
  {
    id: 'user_002',
    employee_id: 'EMP002',
    email: 'jane@adamas.com',
    role: 'EMPLOYEE',
    first_name: 'Jane',
    last_name: 'Smith',
    phone: '+1 (555) 987-6543',
    address: '456 People Way, San Francisco, CA',
    profile_picture_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    job_title: 'HR Specialist',
    department: 'Human Resources',
    joining_date: '2023-06-10',
    salary: 6000,
    is_active: true,
  },
  {
    id: 'user_003',
    employee_id: 'EMP003',
    email: 'bob@adamas.com',
    role: 'ADMIN',
    first_name: 'Bob',
    last_name: 'Johnson',
    phone: '+1 (555) 246-8135',
    address: '789 Executive Blvd, New York, NY',
    profile_picture_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    job_title: 'Operations Director',
    department: 'Operations',
    joining_date: '2022-03-01',
    salary: 8500,
    is_active: true,
  }
].map(normalizeEmployee);

const initialLeaveRequests = [
  {
    id: 'LR001',
    employeeId: 'EMP001',
    employeeName: 'John Doe',
    type: 'Sick Leave',
    startDate: '2026-06-10',
    endDate: '2026-06-12',
    reason: 'Dental checkup and recovery',
    status: 'Approved',
    submittedAt: '2026-06-08',
  },
  {
    id: 'LR002',
    employeeId: 'EMP002',
    employeeName: 'Jane Smith',
    type: 'Casual Leave',
    startDate: '2026-07-15',
    endDate: '2026-07-18',
    reason: 'Family gathering',
    status: 'Pending',
    submittedAt: '2026-07-01',
  },
  {
    id: 'LR003',
    employeeId: 'EMP001',
    employeeName: 'John Doe',
    type: 'Paid Leave',
    startDate: '2026-07-20',
    endDate: '2026-07-24',
    reason: 'Summer vacation',
    status: 'Pending',
    submittedAt: '2026-07-02',
  }
];

const initialAttendanceLogs = [
  {
    id: 'ATT001',
    employeeId: 'EMP001',
    date: '2026-07-02',
    checkIn: '08:55 AM',
    checkOut: '05:30 PM',
    hoursWorked: '8.5 hrs',
    status: 'On-time'
  },
  {
    id: 'ATT002',
    employeeId: 'EMP002',
    date: '2026-07-02',
    checkIn: '09:15 AM',
    checkOut: '05:45 PM',
    hoursWorked: '8.5 hrs',
    status: 'Late'
  },
  {
    id: 'ATT003',
    employeeId: 'EMP001',
    date: '2026-07-03',
    checkIn: '08:48 AM',
    checkOut: '06:00 PM',
    hoursWorked: '9.2 hrs',
    status: 'On-time'
  },
  {
    id: 'ATT004',
    employeeId: 'EMP002',
    date: '2026-07-03',
    checkIn: '09:02 AM',
    checkOut: '05:00 PM',
    hoursWorked: '8.0 hrs',
    status: 'On-time'
  }
];

export const HRMSProvider = ({ children }) => {
  const [employee, setemployee] = useState(() => {
    const saved = localStorage.getItem('hrms_current_user');
    const parsed = saved ? JSON.parse(saved) : null;
    return parsed ? normalizeEmployee(parsed) : null;
  });

  const [employees, setEmployees] = useState(() => {
    const saved = localStorage.getItem('hrms_employees');
    const parsed = saved ? JSON.parse(saved) : initialEmployees;
    return Array.isArray(parsed) ? parsed.map(normalizeEmployee) : initialEmployees;
  });

  const { user, isLoaded } = useUser();
  const [employee, setEmployee] = useState(null);

  const [leaveRequests, setLeaveRequests] = useState(() => {
    const saved = localStorage.getItem('hrms_leaves');
    return saved ? JSON.parse(saved) : initialLeaveRequests;
  });

  const [attendanceLogs, setAttendanceLogs] = useState(() => {
    const saved = localStorage.getItem('hrms_attendance');
    return saved ? JSON.parse(saved) : initialAttendanceLogs;
  });

  const [payrollSlips, setPayrollSlips] = useState(() => {
    const saved = localStorage.getItem('hrms_payroll');
    if (saved) return JSON.parse(saved);
    
    // Auto-generate slips
    const slips = [];
    const months = ['May 2026', 'June 2026'];
    initialEmployees.forEach(emp => {
      months.forEach((m, idx) => {
        const basic = emp.salary * 0.5;
        const hra = emp.salary * 0.3;
        const allowance = emp.salary * 0.2;
        const pf = emp.salary * 0.12;
        const tax = emp.salary * 0.1;
        const net = basic + hra + allowance - pf - tax;
        
        slips.push({
          id: `PAY-${emp.employee_id}-${idx}`,
          employeeId: emp.employee_id,
          employeeName: `${emp.first_name} ${emp.last_name}`,
          month: m,
          basic,
          hra,
          allowance,
          pf,
          tax,
          net,
          status: 'Paid',
          processedDate: `2026-${idx === 0 ? '05' : '06'}-30`
        });
      });
    });
    return slips;
  });

  useEffect(() => {
  const fetchEmployee = async () => {
    if (!isLoaded || !user) return;

    const email = user.primaryEmailAddress?.emailAddress;

    const res = await fetch(`/api/employees/by-email/${email}`);
    const data = await res.json();

    setEmployee(data);
  };

  fetchEmployee();
}, [user, isLoaded]);

  useEffect(() => {
    localStorage.setItem('hrms_employees', JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem('hrms_leaves', JSON.stringify(leaveRequests));
  }, [leaveRequests]);

  useEffect(() => {
    localStorage.setItem('hrms_attendance', JSON.stringify(attendanceLogs));
  }, [attendanceLogs]);

  useEffect(() => {
    localStorage.setItem('hrms_payroll', JSON.stringify(payrollSlips));
  }, [payrollSlips]);

  // Auth Operations
  const login = (email, password) => {
    const emp = employees.find(e => e.email.toLowerCase() === email.toLowerCase());
    if (emp) {
      const normalizedEmp = normalizeEmployee(emp);
      setemployee(normalizedEmp);
      localStorage.setItem('hrms_current_user', JSON.stringify(normalizedEmp));
      return { success: true };
    }
    return { success: false, message: 'Invalid credentials. Use john@adamas.com (Employee) or bob@adamas.com (Admin)' };
  };

  const logout = () => {
    setemployee(null);
    localStorage.removeItem('hrms_current_user');
  };

  const signup = (firstName, lastName, email, password, role, department, jobTitle) => {
    const exists = employees.some(e => e.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      return { success: false, message: 'Email already registered.' };
    }

    const uppercaseRole = role.toUpperCase() === 'ADMIN' ? 'ADMIN' : 'EMPLOYEE';
    const newEmpId = `user_${String(employees.length + 1).padStart(3, '0')}`;
    const newEmployeeId = `EMP${String(employees.length + 1).padStart(3, '0')}`;

    const newEmp = normalizeEmployee({
      id: newEmpId,
      employee_id: newEmployeeId,
      email,
      role: uppercaseRole,
      first_name: firstName,
      last_name: lastName,
      phone: '+1 (555) 000-0000',
      address: 'Update address in profile',
      profile_picture_url: '',
      job_title: jobTitle || (uppercaseRole === 'ADMIN' ? 'HR Manager' : 'Software Engineer'),
      department,
      joining_date: new Date().toISOString().split('T')[0],
      salary: uppercaseRole === 'ADMIN' ? 8000 : 5000,
      is_active: true,
    });

    const updated = [...employees, newEmp];
    setEmployees(updated.map(normalizeEmployee));
    setemployee(newEmp);
    localStorage.setItem('hrms_current_user', JSON.stringify(newEmp));
    
    // Auto-generate a default payslip for the new user
    const basic = newEmp.salary * 0.5;
    const hra = newEmp.salary * 0.3;
    const allowance = newEmp.salary * 0.2;
    const pf = newEmp.salary * 0.12;
    const tax = newEmp.salary * 0.1;
    const net = basic + hra + allowance - pf - tax;
    
    const newSlip = {
      id: `PAY-${newEmp.employee_id}-0`,
      employeeId: newEmp.employee_id,
      employeeName: `${newEmp.first_name} ${newEmp.last_name}`,
      month: 'June 2026',
      basic,
      hra,
      allowance,
      pf,
      tax,
      net,
      status: 'Paid',
      processedDate: '2026-06-30'
    };
    setPayrollSlips(prev => [...prev, newSlip]);

    return { success: true };
  };

  // Clock Operations
  const clockIn = () => {
    if (!employee) return;
    const today = new Date().toISOString().split('T')[0];
    
    // Check if already clocked in today
    const exists = attendanceLogs.some(log => log.employeeId === employee.employee_id && log.date === today);
    if (exists) return { success: false, message: 'Already clocked in today.' };

    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const isLate = new Date().getHours() >= 9 && new Date().getMinutes() > 0;
    
    const newLog = {
      id: `ATT${String(attendanceLogs.length + 1).padStart(3, '0')}`,
      employeeId: employee.employee_id,
      date: today,
      checkIn: timeString,
      checkOut: '',
      hoursWorked: '-',
      status: isLate ? 'Late' : 'On-time'
    };

    setAttendanceLogs([newLog, ...attendanceLogs]);
    return { success: true, log: newLog };
  };

  const clockOut = () => {
    if (!employee) return;
    const today = new Date().toISOString().split('T')[0];
    
    const logIndex = attendanceLogs.findIndex(log => log.employeeId === employee.employee_id && log.date === today && log.checkOut === '');
    if (logIndex === -1) return { success: false, message: 'Active check-in not found for today.' };

    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Calculate simple duration
    const checkInTimeStr = attendanceLogs[logIndex].checkIn;
    // Just a placeholder duration (say, 8.2 hrs)
    const hoursWorked = '8.2 hrs';

    const updated = [...attendanceLogs];
    updated[logIndex] = {
      ...updated[logIndex],
      checkOut: timeString,
      hoursWorked
    };

    setAttendanceLogs(updated);
    return { success: true };
  };

  // Leave Operations
  const requestLeave = (type, startDate, endDate, reason) => {
    if (!employee) return;
    
    const newRequest = {
      id: `LR${String(leaveRequests.length + 1).padStart(3, '0')}`,
      employeeId: employee.employee_id,
      employeeName: `${employee.first_name} ${employee.last_name}`,
      type,
      startDate,
      endDate,
      reason,
      status: 'Pending',
      submittedAt: new Date().toISOString().split('T')[0]
    };

    setLeaveRequests([newRequest, ...leaveRequests]);
    return { success: true };
  };

  const approveLeave = (id) => {
    setLeaveRequests(prev => prev.map(req => req.id === id ? { ...req, status: 'Approved' } : req));
  };

  const rejectLeave = (id) => {
    setLeaveRequests(prev => prev.map(req => req.id === id ? { ...req, status: 'Rejected' } : req));
  };

  // Payroll Operations
  const processPayroll = () => {
    // Generate new payroll slips for June/July 2026 for all users who don't have it
    const currentMonth = 'July 2026';
    const existing = payrollSlips.filter(p => p.month === currentMonth);
    if (existing.length === employees.length) {
      return { success: false, message: 'Payroll already processed for July 2026.' };
    }

    const newSlips = [];
    employees.forEach(emp => {
      const alreadyProcessed = payrollSlips.some(p => p.employeeId === emp.employee_id && p.month === currentMonth);
      if (!alreadyProcessed) {
        const basic = emp.salary * 0.5;
        const hra = emp.salary * 0.3;
        const allowance = emp.salary * 0.2;
        const pf = emp.salary * 0.12;
        const tax = emp.salary * 0.1;
        const net = basic + hra + allowance - pf - tax;
        
        newSlips.push({
          id: `PAY-${emp.employee_id}-JUL2026`,
          employeeId: emp.employee_id,
          employeeName: `${emp.first_name} ${emp.last_name}`,
          month: currentMonth,
          basic,
          hra,
          allowance,
          pf,
          tax,
          net,
          status: 'Paid',
          processedDate: new Date().toISOString().split('T')[0]
        });
      }
    });

    setPayrollSlips(prev => [...prev, ...newSlips]);
    return { success: true, count: newSlips.length };
  };

  // Profile Update
  const updateProfile = (fields) => {
    if (!employee) return;
    
    const updatedEmp = normalizeEmployee({
      ...employee,
      ...fields
    });

    setEmployees(prev => prev.map(emp => emp.id === employee.id ? updatedEmp : emp));
    setemployee(updatedEmp);
    localStorage.setItem('hrms_current_user', JSON.stringify(updatedEmp));
    return { success: true };
  };

  return (
    <HRMSContext.Provider value={{
      employee,
      employees,
      leaveRequests,
      attendanceLogs,
      payrollSlips,
      login,
      logout,
      signup,
      clockIn,
      clockOut,
      requestLeave,
      approveLeave,
      rejectLeave,
      processPayroll,
      updateProfile
    }}>
      {children}
    </HRMSContext.Provider>
  );
};

export const useHRMS = () => {
  const context = useContext(HRMSContext);
  if (!context) {
    throw new Error('useHRMS must be used within an HRMSProvider');
  }
  return context;
};
