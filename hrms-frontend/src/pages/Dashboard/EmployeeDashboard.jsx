import { useState, useEffect } from 'react';
import { useHRMS } from '../../context/HRMSContext';
import { Clock, Calendar, Send, Clock3, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function EmployeeDashboard() {
  const { employee, attendanceLogs, leaveRequests, payrollSlips, clockIn, clockOut } = useHRMS();
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

  // Leave balance mock
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
      {/* Welcome bar */}
      <div className="o-card p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold" style={{ color: 'var(--odoo-text)' }}>
            Welcome back, {employee?.name}
          </h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--odoo-text-muted)' }}>
            {employee?.jobTitle} · {employee?.department} Department
          </p>
        </div>
        <span className="o-badge o-badge-purple">
          {time.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Clock In / Out Card */}
        <div className="o-card p-6 flex flex-col items-center text-center">
          <div className="h-14 w-14 rounded-full flex items-center justify-center mb-3" style={{ background: 'var(--odoo-purple-muted)', color: 'var(--odoo-purple)' }}>
            <Clock className="h-7 w-7" />
          </div>
          <p className="text-3xl font-bold tracking-tight" style={{ color: 'var(--odoo-text)' }}>
            {time.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </p>
          <p className="text-xs mt-1 mb-4" style={{ color: 'var(--odoo-text-muted)' }}>Current Time</p>

          <button
            onClick={handleClockToggle}
            disabled={isClockedOut}
            className={`w-full py-2.5 rounded font-medium text-sm transition-all ${
              isClockedOut
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                : isClockedIn
                ? 'text-white'
                : ''
            }`}
            style={
              isClockedOut ? {} :
              isClockedIn ? { background: 'var(--odoo-danger)', color: '#fff' } :
              { background: 'var(--odoo-teal)', color: '#fff' }
            }
          >
            {isClockedOut ? '✓ Completed for Today' : isClockedIn ? 'Check Out' : 'Check In'}
          </button>

          {clockMsg.text && (
            <p className={`mt-3 text-xs font-medium px-3 py-1.5 rounded ${
              clockMsg.type === 'success' ? 'o-badge-success' : 'o-badge-danger'
            }`}>
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

        {/* Leave Balance */}
        <div className="lg:col-span-2 o-card p-5">
          <div className="flex items-center justify-between border-b pb-3 mb-4" style={{ borderColor: 'var(--odoo-border-light)' }}>
            <h3 className="font-bold text-[15px]" style={{ color: 'var(--odoo-text)' }}>Leave Allocation</h3>
            <Link to="/leaves" className="text-xs font-medium flex items-center gap-1 hover:underline" style={{ color: 'var(--odoo-purple)' }}>
              Request Leave <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {balances.map((bal) => {
              const remaining = bal.total - bal.used;
              const pct = (remaining / bal.total) * 100;
              return (
                <div key={bal.name} className="p-4 rounded-lg border" style={{ borderColor: 'var(--odoo-border-light)', background: '#FAFAFA' }}>
                  <p className="text-xs font-medium mb-2" style={{ color: 'var(--odoo-text-muted)' }}>{bal.name}</p>
                  <p className="text-2xl font-bold" style={{ color: 'var(--odoo-text)' }}>
                    {remaining} <span className="text-sm font-normal" style={{ color: 'var(--odoo-text-muted)' }}>/ {bal.total}</span>
                  </p>
                  <div className="w-full rounded-full h-1.5 mt-3" style={{ background: 'var(--odoo-border)' }}>
                    <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, background: 'var(--odoo-teal)' }}></div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Latest payslip snippet */}
          {myLatestSlip && (
            <div className="mt-4 p-3 rounded-lg border flex items-center justify-between" style={{ background: 'var(--odoo-purple-50)', borderColor: 'var(--odoo-purple-muted)' }}>
              <div>
                <span className="text-xs font-medium" style={{ color: 'var(--odoo-text-muted)' }}>Latest Payslip</span>
                <p className="font-bold text-sm" style={{ color: 'var(--odoo-text)' }}>{myLatestSlip.month} — Net ${myLatestSlip.net.toLocaleString()}</p>
              </div>
              <Link to="/payroll" className="o-btn-secondary text-xs py-1.5 px-3">
                View <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Bottom row: Recent attendance + Leave requests */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Attendance */}
        <div className="o-card overflow-hidden">
          <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--odoo-border-light)' }}>
            <h3 className="font-bold text-[15px]" style={{ color: 'var(--odoo-text)' }}>Recent Attendance</h3>
            <Link to="/attendance" className="text-xs font-medium hover:underline" style={{ color: 'var(--odoo-purple)' }}>View All</Link>
          </div>
          {myAttendance.length === 0 ? (
            <div className="p-8 text-center text-sm" style={{ color: 'var(--odoo-text-muted)' }}>No records yet. Check in above!</div>
          ) : (
            <table className="o-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>In</th>
                  <th>Out</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {myAttendance.map((log) => (
                  <tr key={log.id}>
                    <td className="font-medium">{log.date}</td>
                    <td>{log.checkIn}</td>
                    <td>{log.checkOut || <span style={{ color: 'var(--odoo-teal)' }}>Active</span>}</td>
                    <td>
                      <span className={`o-badge ${log.status === 'On-time' ? 'o-badge-success' : 'o-badge-danger'}`}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Leave Requests */}
        <div className="o-card overflow-hidden">
          <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--odoo-border-light)' }}>
            <h3 className="font-bold text-[15px]" style={{ color: 'var(--odoo-text)' }}>My Leave Requests</h3>
            <Link to="/leaves" className="text-xs font-medium hover:underline" style={{ color: 'var(--odoo-purple)' }}>View All</Link>
          </div>
          {myLeaves.length === 0 ? (
            <div className="p-8 text-center text-sm" style={{ color: 'var(--odoo-text-muted)' }}>No leave requests found.</div>
          ) : (
            <table className="o-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Dates</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {myLeaves.map((req) => (
                  <tr key={req.id}>
                    <td className="font-medium">{req.type}</td>
                    <td className="text-xs">{req.startDate} → {req.endDate}</td>
                    <td>
                      <span className={`o-badge ${
                        req.status === 'Approved' ? 'o-badge-success' :
                        req.status === 'Rejected' ? 'o-badge-danger' :
                        'o-badge-warning'
                      }`}>
                        {req.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
