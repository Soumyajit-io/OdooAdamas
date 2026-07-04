import { createContext, useContext, useState, useEffect } from 'react';
import { useUser } from "@clerk/clerk-react";


const HRMSContext = createContext();

const normalizeEmployee = (e = {}) => {
  const fn = e.first_name || e.firstName || '';
  const ln = e.last_name || e.lastName || '';
  const role = (e.role || 'EMPLOYEE').toUpperCase();
  return {
    ...e,
    id: e.id || '',
    employee_id: e.employee_id || '',
    role,
    first_name: fn,
    last_name: ln,
    name: [fn, ln].filter(Boolean).join(' ') || e.name || '',
    email: e.email || '',
    phone: e.phone || '',
    address: e.address || '',
    profile_picture_url: e.profile_picture_url || '',
    job_title: e.job_title || e.jobTitle || '',
    jobTitle: e.job_title || e.jobTitle || '',
    department: e.department || '',
    joining_date: e.joining_date || e.joinDate || '',
    joinDate: e.joining_date || e.joinDate || '',
    salary: e.salary ?? 0,
    is_active: e.is_active ?? true,
    company: e.company || 'Adamas Consulting',
    manager: e.manager || '',
    location: e.location || '',
    dob: e.dob || '',
    nationality: e.nationality || '',
    personal_email: e.personal_email || '',
    gender: e.gender || '',
    marital_status: e.marital_status || '',
    bank_account: e.bank_account || '',
    bank_name: e.bank_name || '',
    ifsc: e.ifsc || '',
    pan_no: e.pan_no || '',
    about: e.about || '',
    job_love: e.job_love || '',
    interests: e.interests || '',
    skills: e.skills || [],
    certifications: e.certifications || [],
    wage_type: e.wage_type || 'Fixed',
    monthly_wage: e.monthly_wage ?? e.salary ?? 0,
    working_days_per_week: e.working_days_per_week ?? 5,
    break_time: e.break_time ?? 60,
    salary_components: e.salary_components || [
      { name: 'Basic Salary', type: 'percent', value: 50 },
      { name: 'House Rent Allowance', type: 'percent_of_basic', value: 50 },
      { name: 'Standard Allowance', type: 'percent', value: 10 },
      { name: 'Performance Bonus', type: 'percent', value: 5 },
      { name: 'Leave Travel Allowance', type: 'fixed', value: 1500 },
      { name: 'Fixed Allowance', type: 'percent', value: 5 },
    ],
    pf_employer_pct: e.pf_employer_pct ?? 12,
    pf_employee_pct: e.pf_employee_pct ?? 12,
    professional_tax: e.professional_tax ?? 200,
  };
};

const avatarColors = ['#714B67', '#00A09D', '#E76F51', '#2A9D8F', '#264653', '#E9C46A', '#F4A261', '#6A4C93', '#1982C4'];

const initialEmployees = [
  { id: 'u1', employee_id: 'EMP001', email: 'john@adamas.com', role: 'EMPLOYEE', first_name: 'John', last_name: 'Doe', phone: '+91 98765 43210', address: '123 Tech Lane, Bangalore', profile_picture_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', job_title: 'Software Engineer', department: 'Engineering', joining_date: '2024-01-15', salary: 50000, manager: 'Bob Johnson', location: 'Bangalore', dob: '1995-03-12', nationality: 'Indian', gender: 'Male', marital_status: 'Single', personal_email: 'john.doe@gmail.com', bank_account: '1234567890', bank_name: 'HDFC Bank', ifsc: 'HDFC0001234', pan_no: 'ABCDE1234F', about: 'Passionate developer focused on building scalable web apps.', job_love: 'Solving complex problems and mentoring juniors.', interests: 'Open source, hiking, chess', skills: ['React', 'Node.js', 'Python', 'AWS'], certifications: ['AWS Solutions Architect'] },
  { id: 'u2', employee_id: 'EMP002', email: 'jane@adamas.com', role: 'EMPLOYEE', first_name: 'Jane', last_name: 'Smith', phone: '+91 98765 43211', address: '456 People Way, Mumbai', profile_picture_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', job_title: 'HR Specialist', department: 'Human Resources', joining_date: '2023-06-10', salary: 45000, manager: 'Bob Johnson', location: 'Mumbai', dob: '1992-07-25', nationality: 'Indian', gender: 'Female', marital_status: 'Married', personal_email: 'jane.smith@gmail.com', bank_account: '9876543210', bank_name: 'ICICI Bank', ifsc: 'ICIC0005678', pan_no: 'FGHIJ5678K', about: 'HR professional with 5+ years experience.', job_love: 'Connecting people and building culture.', interests: 'Reading, yoga, travel', skills: ['Recruitment', 'Onboarding', 'Compliance'], certifications: ['SHRM-CP'] },
  { id: 'u3', employee_id: 'EMP003', email: 'bob@adamas.com', role: 'ADMIN', first_name: 'Bob', last_name: 'Johnson', phone: '+91 98765 43212', address: '789 Executive Blvd, Delhi', profile_picture_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', job_title: 'Operations Director', department: 'Operations', joining_date: '2022-03-01', salary: 85000, manager: '', location: 'Delhi', dob: '1988-11-05', nationality: 'Indian', gender: 'Male', marital_status: 'Married', personal_email: 'bob.j@gmail.com', bank_account: '5678901234', bank_name: 'SBI', ifsc: 'SBIN0009012', pan_no: 'LMNOP9012Q', about: 'Seasoned ops leader driving efficiency.', job_love: 'Strategic planning and team growth.', interests: 'Golf, finance, photography', skills: ['Leadership', 'Strategy', 'Operations'], certifications: ['PMP', 'Six Sigma'] },
  { id: 'u4', employee_id: 'EMP004', email: 'priya@adamas.com', role: 'EMPLOYEE', first_name: 'Priya', last_name: 'Sharma', phone: '+91 98765 43213', address: '12 Garden Street, Pune', job_title: 'UI/UX Designer', department: 'Design', joining_date: '2024-03-20', salary: 42000, manager: 'Bob Johnson', location: 'Pune', dob: '1996-09-18', nationality: 'Indian', gender: 'Female', marital_status: 'Single', skills: ['Figma', 'Sketch', 'CSS', 'User Research'], certifications: ['Google UX Certificate'] },
  { id: 'u5', employee_id: 'EMP005', email: 'arjun@adamas.com', role: 'EMPLOYEE', first_name: 'Arjun', last_name: 'Patel', phone: '+91 98765 43214', address: '34 Lake View, Hyderabad', job_title: 'DevOps Engineer', department: 'Engineering', joining_date: '2023-11-01', salary: 55000, manager: 'Bob Johnson', location: 'Hyderabad', dob: '1993-01-30', nationality: 'Indian', gender: 'Male', marital_status: 'Single', skills: ['Docker', 'Kubernetes', 'Terraform', 'CI/CD'], certifications: ['CKA'] },
  { id: 'u6', employee_id: 'EMP006', email: 'neha@adamas.com', role: 'EMPLOYEE', first_name: 'Neha', last_name: 'Gupta', phone: '+91 98765 43215', address: '56 MG Road, Chennai', job_title: 'Business Analyst', department: 'Operations', joining_date: '2024-05-12', salary: 40000, manager: 'Bob Johnson', location: 'Chennai', dob: '1994-12-03', nationality: 'Indian', gender: 'Female', marital_status: 'Married', skills: ['SQL', 'Tableau', 'Excel', 'JIRA'], certifications: ['CBAP'] },
  { id: 'u7', employee_id: 'EMP007', email: 'rahul@adamas.com', role: 'EMPLOYEE', first_name: 'Rahul', last_name: 'Kumar', phone: '+91 98765 43216', address: '78 Park Avenue, Kolkata', job_title: 'QA Lead', department: 'Engineering', joining_date: '2023-08-15', salary: 48000, manager: 'Bob Johnson', location: 'Kolkata', dob: '1991-06-22', nationality: 'Indian', gender: 'Male', marital_status: 'Married', skills: ['Selenium', 'Cypress', 'Jest', 'API Testing'], certifications: ['ISTQB'] },
  { id: 'u8', employee_id: 'EMP008', email: 'anita@adamas.com', role: 'EMPLOYEE', first_name: 'Anita', last_name: 'Desai', phone: '+91 98765 43217', address: '90 Hill Road, Bangalore', job_title: 'Content Writer', department: 'Marketing', joining_date: '2024-07-01', salary: 35000, manager: 'Bob Johnson', location: 'Bangalore', dob: '1997-04-15', nationality: 'Indian', gender: 'Female', marital_status: 'Single', skills: ['SEO', 'Copywriting', 'WordPress'], certifications: [] },
  { id: 'u9', employee_id: 'EMP009', email: 'vikram@adamas.com', role: 'EMPLOYEE', first_name: 'Vikram', last_name: 'Singh', phone: '+91 98765 43218', address: '23 Civil Lines, Delhi', job_title: 'Finance Manager', department: 'Finance', joining_date: '2022-09-01', salary: 65000, manager: 'Bob Johnson', location: 'Delhi', dob: '1989-08-10', nationality: 'Indian', gender: 'Male', marital_status: 'Married', skills: ['Accounting', 'Tally', 'SAP', 'GST'], certifications: ['CA', 'CFA Level 2'] },
].map(normalizeEmployee);

const initialLeaveRequests = [
  { id: 'LR001', employeeId: 'EMP001', employeeName: 'John Doe', type: 'Sick Leave', startDate: '2026-07-04', endDate: '2026-07-04', reason: 'Dental checkup', status: 'Approved', submittedAt: '2026-07-02' },
  { id: 'LR002', employeeId: 'EMP002', employeeName: 'Jane Smith', type: 'Casual Leave', startDate: '2026-07-15', endDate: '2026-07-18', reason: 'Family gathering', status: 'Pending', submittedAt: '2026-07-01' },
  { id: 'LR003', employeeId: 'EMP004', employeeName: 'Priya Sharma', type: 'Paid Leave', startDate: '2026-07-04', endDate: '2026-07-06', reason: 'Vacation', status: 'Approved', submittedAt: '2026-07-01' },
  { id: 'LR004', employeeId: 'EMP008', employeeName: 'Anita Desai', type: 'Sick Leave', startDate: '2026-07-03', endDate: '2026-07-04', reason: 'Flu recovery', status: 'Approved', submittedAt: '2026-07-02' },
];



const today = new Date().toISOString().split('T')[0];

const initialAttendanceLogs = [
  { id: 'A01', employeeId: 'EMP002', date: today, checkIn: '09:02 AM', checkOut: '', hoursWorked: '-', status: 'On-time' },
  { id: 'A02', employeeId: 'EMP003', date: today, checkIn: '08:45 AM', checkOut: '', hoursWorked: '-', status: 'On-time' },
  { id: 'A03', employeeId: 'EMP005', date: today, checkIn: '09:15 AM', checkOut: '', hoursWorked: '-', status: 'Late' },
  { id: 'A04', employeeId: 'EMP006', date: today, checkIn: '09:00 AM', checkOut: '', hoursWorked: '-', status: 'On-time' },
  { id: 'A05', employeeId: 'EMP007', date: today, checkIn: '08:50 AM', checkOut: '', hoursWorked: '-', status: 'On-time' },
  { id: 'A06', employeeId: 'EMP009', date: today, checkIn: '08:30 AM', checkOut: '05:30 PM', hoursWorked: '9.0 hrs', status: 'On-time' },
  { id: 'A07', employeeId: 'EMP001', date: '2026-07-03', checkIn: '08:55 AM', checkOut: '05:30 PM', hoursWorked: '8.5 hrs', status: 'On-time' },
  { id: 'A08', employeeId: 'EMP002', date: '2026-07-03', checkIn: '09:10 AM', checkOut: '05:45 PM', hoursWorked: '8.5 hrs', status: 'Late' },
  { id: 'A09', employeeId: 'EMP003', date: '2026-07-03', checkIn: '08:40 AM', checkOut: '06:00 PM', hoursWorked: '9.3 hrs', status: 'On-time' },
  { id: 'A10', employeeId: 'EMP005', date: '2026-07-03', checkIn: '09:00 AM', checkOut: '05:30 PM', hoursWorked: '8.5 hrs', status: 'On-time' },
  { id: 'A11', employeeId: 'EMP001', date: '2026-07-02', checkIn: '08:50 AM', checkOut: '05:20 PM', hoursWorked: '8.5 hrs', status: 'On-time' },
  { id: 'A12', employeeId: 'EMP002', date: '2026-07-02', checkIn: '09:05 AM', checkOut: '05:30 PM', hoursWorked: '8.4 hrs', status: 'On-time' },
  { id: 'A13', employeeId: 'EMP001', date: '2026-07-01', checkIn: '09:00 AM', checkOut: '05:00 PM', hoursWorked: '8.0 hrs', status: 'On-time' },
];

const initialPayrollSlips = [
  { id: 'P1', employeeId: 'EMP001', employeeName: 'John Doe', month: 'Jun 2026', basic: 25000, hra: 12500, allowance: 5000, pf: 3000, tax: 200, net: 39000, status: 'Paid', processedDate: '2026-06-30' },
  { id: 'P2', employeeId: 'EMP002', employeeName: 'Jane Smith', month: 'Jun 2026', basic: 22500, hra: 11250, allowance: 4000, pf: 2700, tax: 200, net: 34800, status: 'Paid', processedDate: '2026-06-30' },
];

export const HRMSProvider = ({ children }) => {
  const [employee, setEmployee] = useState(() => {
    const saved = localStorage.getItem('hrms_current_user');
    const parsed = saved ? JSON.parse(saved) : null;
    return parsed ? normalizeEmployee(parsed) : null;
  });
  const [employees, setEmployees] = useState(() => {
    const s = localStorage.getItem('hrms_employees');
    const p = s ? JSON.parse(s) : initialEmployees;
    return Array.isArray(p) ? p.map(normalizeEmployee) : initialEmployees;
  });
  const teamMembers = employees;
  const [attendance, setAttendance] = useState([]);
 
  
  
  const [isClockedIn, setIsClockedIn] = useState(false);

  const { user, isLoaded } = useUser();
  

  const [leaveRequests, setLeaveRequests] = useState(() => {
    const s = localStorage.getItem('hrms_leaves');
    return s ? JSON.parse(s) : initialLeaveRequests;
  });
  const [attendanceLogs, setAttendanceLogs] = useState(() => {
    const s = localStorage.getItem('hrms_attendance');
    return s ? JSON.parse(s) : initialAttendanceLogs;
  });
  const [payrollSlips, setPayrollSlips] = useState(() => {
    const s = localStorage.getItem('hrms_payroll');
    return s ? JSON.parse(s) : initialPayrollSlips;
  });
  const [checkedInAt, setCheckedInAt] = useState(() => {
    const s = localStorage.getItem('hrms_checkedin_at');
    return s || null;
  });

  useEffect(() => {
  if (!isLoaded || !user) return;

  const email = user.primaryEmailAddress?.emailAddress;

  const emp = employees.find(
    e => e.email.toLowerCase() === email?.toLowerCase()
  );

  if (emp) {
    setEmployee(normalizeEmployee(emp));
  }

}, [user, isLoaded, employees]);

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
  useEffect(() => {
  localStorage.setItem(
    'hrms_checkedin_at',
    checkedInAt || ''
  );
}, [checkedInAt]);

  // Auth Operations
  const login = (email, password) => {
    const emp = employees.find(e => e.email.toLowerCase() === email.toLowerCase());
    if (emp) {
      const normalizedEmp = normalizeEmployee(emp);
      setEmployee(normalizedEmp);
      localStorage.setItem('hrms_current_user', JSON.stringify(normalizedEmp));
      return { success: true };
    }
    return { success: false, message: 'Invalid credentials. Try john@adamas.com or bob@adamas.com' };
  };

  const logout = () => {
    setEmployee(null);
    localStorage.removeItem('hrms_current_user');
  };

  const signup = (firstName, lastName, email, password, role, department, jobTitle) => {
    if (employees.some((e) => e.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, message: 'Email already registered.' };
    }
    const r = role?.toUpperCase() === 'ADMIN' ? 'ADMIN' : 'EMPLOYEE';
    const newEmp = normalizeEmployee({
      id: `u${employees.length + 1}`,
      employee_id: `EMP${String(employees.length + 1).padStart(3, '0')}`,
      email,
      role: r,
      first_name: firstName,
      last_name: lastName,
      job_title: jobTitle || 'New Employee',
      department: department || 'General',
      joining_date: new Date().toISOString().split('T')[0],
      salary: r === 'ADMIN' ? 80000 : 40000,
    });

    const updated = [...employees, newEmp];
    setEmployees(updated.map(normalizeEmployee));
    setEmployee(newEmp);
    localStorage.setItem('hrms_current_user', JSON.stringify(newEmp));
    return { success: true };
  };

  const addEmployee = (data) => {
    if (employees.some((e) => e.email.toLowerCase() === data.email.toLowerCase())) {
      return { success: false, message: 'Email already exists.' };
    }
    const newEmp = normalizeEmployee({
      id: `u${employees.length + 1}`,
      employee_id: `EMP${String(employees.length + 1).padStart(3, '0')}`,
      ...data,
      role: 'EMPLOYEE',
      joining_date: data.joining_date || new Date().toISOString().split('T')[0],
      salary: data.salary || 40000,
    });
    setEmployees((prev) => [...prev, newEmp]);
    return { success: true, employee: newEmp };
  };

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
    setCheckedInAt(new Date().toISOString());
    setIsClockedIn(true);
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
    updated[logIndex] = { ...updated[logIndex], checkOut: timeString, hoursWorked: '8.2 hrs' };
    setAttendanceLogs(updated);
    setCheckedInAt(null);
    setIsClockedIn(false);
    return { success: true };
  };

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

  const approveLeave = (id) => setLeaveRequests((prev) => prev.map((req) => req.id === id ? { ...req, status: 'Approved' } : req));
  const rejectLeave = (id) => setLeaveRequests((prev) => prev.map((req) => req.id === id ? { ...req, status: 'Rejected' } : req));

  const processPayroll = () => {
    if (!employee || employee.role !== 'ADMIN') return { success: false, message: 'Only admins can process payroll.' };
    const generated = employees.map((employee) => ({
      id: `P${Date.now()}-${employee.id}`,
      employeeId: employee.employee_id,
      employeeName: employee.name,
      month: 'Jul 2026',
      basic: Math.round(employee.salary * 0.5),
      hra: Math.round(employee.salary * 0.25),
      allowance: Math.round(employee.salary * 0.1),
      pf: Math.round(employee.salary * 0.12 * 0.5),
      tax: 200,
      net: employee.salary - Math.round(employee.salary * 0.12 * 0.5) - 200,
      status: 'Paid',
      processedDate: new Date().toISOString().split('T')[0],
    }));
    setPayrollSlips(generated);
    return { success: true, count: generated.length };
  };

  const updateProfile = (fields) => {
    if (!employee) return;
    
    const updatedEmp = normalizeEmployee({
      ...employee,
      ...fields
    });

    setEmployees(prev => prev.map(emp => emp.id === employee.id ? updatedEmp : emp));
    setEmployee(updatedEmp);
    localStorage.setItem('hrms_current_user', JSON.stringify(updatedEmp));
    return { success: true };
  };

  const getEmployeeStatus = (empId) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const currentLog = attendanceLogs.find((log) => log.employeeId === empId && log.date === todayStr && log.checkIn && !log.checkOut);
    if (currentLog) return 'present';
    const checkedOutLog = attendanceLogs.find((log) => log.employeeId === empId && log.date === todayStr && log.checkOut);
    if (checkedOutLog) return 'present';
    const onLeave = leaveRequests.find((leave) => leave.employeeId === empId && leave.status === 'Approved' && leave.startDate <= todayStr && leave.endDate >= todayStr);
    if (onLeave) return 'leave';
    return 'absent';
  };

  return (
    <HRMSContext.Provider value={{
      employee,
      employees,
      leaveRequests,
      attendanceLogs,
      payrollSlips,
      avatarColors,
      teamMembers,
      attendance,
      
      isClockedIn,
      
      checkedInAt,
      login,
      logout,
      signup,
      addEmployee,
      clockIn,
      clockOut,
      requestLeave,
      approveLeave,
      rejectLeave,
      processPayroll,
      updateProfile,
      getEmployeeStatus,
    }}>
      {children}
    </HRMSContext.Provider>
  );
};

export const useHRMS = () => {
  const ctx = useContext(HRMSContext);
  if (!ctx) throw new Error('useHRMS must be used within HRMSProvider');
  return ctx;
};
