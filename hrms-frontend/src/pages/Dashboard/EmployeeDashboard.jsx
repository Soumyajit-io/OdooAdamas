import { useState, useEffect } from 'react';
import { useHRMS } from '../../context/HRMSContext';
import { Clock, ArrowRight, Plane } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function EmployeeDashboard() {
  const { employee, attendanceLogs, leaveRequests,teamMembers, payrollSlips, clockIn, clockOut } = useHRMS();
  const [time, setTime] = useState(new Date());
  const [clockMsg, setClockMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayLog = attendanceLogs.find(log => log.employeeId === employee?.employee_id && log.date === todayStr);
  const isClockedIn = todayLog && todayLog.checkIn && !todayLog.checkOut;
  const isClockedOut = todayLog && todayLog.checkOut;

  const myAttendance = attendanceLogs.filter(log => log.employeeId === employee?.employee_id).slice(0, 5);
  const myLeaves = leaveRequests.filter(req => req.employeeId === employee?.employee_id).slice(0, 4);
  const myLatestSlip = payrollSlips.filter(s => s.employeeId === employee?.employee_id).sort((a, b) => b.processedDate?.localeCompare(a.processedDate))[0];

  const handleClockToggle = () => {
    setClockMsg({ type: '', text: '' });
    if (!isClockedIn) {
      const res = clockIn();
      if (res.success) setClockMsg({ type: 'success', text: `Checked in at ${res.log.checkIn}` });
      else setClockMsg({ type: 'error', text: res.message });
    } else {
      const res = clockOut();
      if (res.success) setClockMsg({ type: 'success', text: 'Checked out successfully' });
      else setClockMsg({ type: 'error', text: res.message });
    }
  };

  const approvedDays = leaveRequests
    .filter(req => req.employeeId === employee?.employee_id && req.status === 'Approved')
    .reduce((acc, curr) => {
      const days = Math.ceil(Math.abs(new Date(curr.endDate) - new Date(curr.startDate)) / (1000 * 60 * 60 * 24)) + 1;
      return acc + days;
    }, 0);

  const balances = [
    { name: 'Sick Leave', used: Math.min(approvedDays, 10), total: 10 },
    { name: 'Casual Leave', used: 0, total: 8 },
    { name: 'Paid Leave', used: 0, total: 15 },
  ];

  return (
    <div className="space-y-6 odoo-fade-in">
      <div className="o-card p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold" style={{ color: 'var(--odoo-text)' }}>
            Welcome back, {employee?.name}
          </h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--odoo-text-muted)' }}>
            {employee?.jobTitle} · {employee?.department} Department
          </p>
        </div>
        <span className="o-badge o-badge-purple">{time.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</span>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="o-card p-6 flex flex-col items-center text-center">
          <div className="h-14 w-14 rounded-full flex items-center justify-center mb-3" style={{ background: 'var(--odoo-purple-muted)', color: 'var(--odoo-purple)' }}>
            <Clock className="h-7 w-7" />
          </div>
          <p className="text-3xl font-bold tracking-tight" style={{ color: 'var(--odoo-text)' }}>{time.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
          <p className="text-xs mt-1 mb-4" style={{ color: 'var(--odoo-text-muted)' }}>Current Time</p>

          <button
            onClick={handleClockToggle}
            disabled={isClockedOut}
            className={`w-full py-2.5 rounded font-medium text-sm transition-all ${isClockedOut ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200' : isClockedIn ? 'text-white' : ''}`}
            style={isClockedOut ? {} : isClockedIn ? { background: 'var(--odoo-danger)', color: '#fff' } : { background: 'var(--odoo-teal)', color: '#fff' }}
          >
            {isClockedOut ? '✓ Completed for Today' : isClockedIn ? 'Check Out' : 'Check In'}
          </button>

          {clockMsg.text && (
            <p className={`mt-3 text-xs font-medium px-3 py-1.5 rounded ${clockMsg.type === 'success' ? 'o-badge-success' : 'o-badge-danger'}`}>
              {clockMsg.text}
            </p>
          )}

          <div className="w-full grid grid-cols-2 gap-4 border-t pt-4 mt-4 text-left" style={{ borderColor: 'var(--odoo-border-light)' }}>
            <div>
              <span className="text-[11px] font-medium" style={{ color: 'var(--odoo-text-muted)' }}>Check In</span>
              <p className="text-sm font-bold" style={{ color: 'var(--odoo-text)' }}>{todayLog?.checkIn || '—'}</p>
            </div>
            <div>
              <span className="text-[11px] font-medium" style={{ color: 'var(--odoo-text-muted)' }}>Check Out</span>
              <p className="text-sm font-bold" style={{ color: 'var(--odoo-text)' }}>{todayLog?.checkOut || '—'}</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 o-card p-5">
          <div className="flex items-center justify-between border-b pb-3 mb-4" style={{ borderColor: 'var(--odoo-border-light)' }}>
            <h3 className="font-bold text-[15px]" style={{ color: 'var(--odoo-text)' }}>Leave Allocation</h3>
            <Link to="/leaves" className="text-xs font-medium flex items-center gap-1 hover:underline" style={{ color: 'var(--odoo-purple)' }}>
              Request Leave <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {balances.map((balance) => {
              const remaining = balance.total - balance.used;
              const percent = (remaining / balance.total) * 100;
              return (
                <div key={balance.name} className="p-4 rounded-lg border" style={{ borderColor: 'var(--odoo-border-light)', background: '#FAFAFA' }}>
                  <p className="text-xs font-medium mb-2" style={{ color: 'var(--odoo-text-muted)' }}>{balance.name}</p>
                  <p className="text-2xl font-bold" style={{ color: 'var(--odoo-text)' }}>{remaining} <span className="text-sm font-normal" style={{ color: 'var(--odoo-text-muted)' }}>/ {balance.total}</span></p>
                  <div className="w-full rounded-full h-1.5 mt-3" style={{ background: 'var(--odoo-border)' }}>
                    <div className="h-1.5 rounded-full" style={{ width: `${percent}%`, background: 'var(--odoo-teal)' }}></div>
                  </div>
                </div>
              );
            })}
          </div>

          {myLatestSlip && (
            <div className="mt-4 p-3 rounded-lg border flex items-center justify-between" style={{ background: 'var(--odoo-purple-50)', borderColor: 'var(--odoo-purple-muted)' }}>
              <div>
                <span className="text-xs font-medium" style={{ color: 'var(--odoo-text-muted)' }}>Latest Payslip</span>
                <p className="font-bold text-sm" style={{ color: 'var(--odoo-text)' }}>{myLatestSlip.month} — Net ${myLatestSlip.net.toLocaleString()}</p>
              </div>
              <Link to="/payroll" className="o-btn-secondary text-xs py-1.5 px-3">View <ArrowRight className="h-3 w-3" /></Link>
            </div>
          )}
        </div>
      </div>

      <div className="o-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-[15px]" style={{ color: 'var(--odoo-text)' }}>Your Team</h3>
          <span className="text-xs font-medium" style={{ color: 'var(--odoo-text-muted)' }}>{teamMembers?.length || 0} colleagues</span>
        </div>
        <div className="emp-grid">
          {(teamMembers || []).map(member => {
            const status = getEmployeeStatus(employee.employee_id);
            return (
              <Link key={employee.id} to={`/profile/${employee.employee_id}`} className="emp-card">
                <div className="absolute top-3 right-3">
                  {status === 'present' && <span className="status-dot status-dot--present" />}
                  {status === 'leave' && <span className="status-dot status-dot--leave"><Plane className="h-2.5 w-2.5" /></span>}
                  {status === 'absent' && <span className="status-dot status-dot--absent" />}
                </div>
                {employee.profile_picture_url ? (
                  <img src={employee.profile_picture_url} alt={employee.name} className="emp-card-avatar" />
                ) : (
                  <div className="emp-card-avatar-fallback" style={{ background: 'var(--odoo-purple)' }}>{employee.name.charAt(0)}</div>
                )}
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate" style={{ color: 'var(--odoo-text)' }}>{employee.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--odoo-text-muted)' }}>{employee.job_title || employee.department}</p>
                  <p className="text-[11px] mt-2 inline-flex rounded-full px-2 py-0.5" style={{ background: 'var(--odoo-purple-muted)', color: 'var(--odoo-purple)' }}>{employee.department}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
