import { useState, useEffect } from 'react';
import { useHRMS } from '../../context/HRMSContext';
import { Clock, Calendar, ShieldCheck, HeartPulse, Sparkles, Send, CheckCircle2, Clock3 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function EmployeeDashboard() {
  const { currentUser, attendanceLogs, leaveRequests, clockIn, clockOut } = useHRMS();
  const [time, setTime] = useState(new Date());
  const [clockMsg, setClockMsg] = useState({ type: '', text: '' });

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];
  
  // Find current day's log
  const todayLog = attendanceLogs.find(log => log.employeeId === currentUser.id && log.date === todayStr);
  const isClockedIn = todayLog && todayLog.checkIn && !todayLog.checkOut;
  const isClockedOut = todayLog && todayLog.checkOut;

  // Filter logs for this employee
  const myAttendance = attendanceLogs.filter(log => log.employeeId === currentUser.id).slice(0, 3);
  const myLeaves = leaveRequests.filter(req => req.employeeId === currentUser.id).slice(0, 3);

  const handleClockToggle = () => {
    setClockMsg({ type: '', text: '' });
    if (!isClockedIn) {
      const res = clockIn();
      if (res.success) {
        setClockMsg({ type: 'success', text: `Successfully Clocked In at ${res.log.checkIn}!` });
      } else {
        setClockMsg({ type: 'error', text: res.message });
      }
    } else {
      const res = clockOut();
      if (res.success) {
        setClockMsg({ type: 'success', text: 'Successfully Clocked Out!' });
      } else {
        setClockMsg({ type: 'error', text: res.message });
      }
    }
  };

  // Mock leave balance calculations
  const approvedLeavesCount = leaveRequests
    .filter(req => req.employeeId === currentUser.id && req.status === 'Approved')
    .reduce((acc, curr) => {
      const start = new Date(curr.startDate);
      const end = new Date(curr.endDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return acc + diffDays;
    }, 0);

  const balances = [
    { name: 'Sick Leave', remaining: Math.max(0, 10 - approvedLeavesCount), total: 10, color: 'text-rose-600', bgColor: 'bg-rose-50' },
    { name: 'Casual Leave', remaining: 8, total: 8, color: 'text-amber-600', bgColor: 'bg-amber-50' },
    { name: 'Paid Annual Leave', remaining: 15, total: 15, color: 'text-emerald-600', bgColor: 'bg-emerald-50' }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-800 to-indigo-950 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl space-y-2">
            <span className="bg-indigo-500/30 text-indigo-200 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5">
              <Sparkles className="h-3 w-3" /> Dashboard Cockpit
            </span>
            <h2 className="text-2xl md:text-3xl font-bold mt-2">Hello, {currentUser?.name}!</h2>
            <p className="text-slate-300 text-sm md:text-base">
              You are signed in as a <strong className="text-white">{currentUser?.jobTitle}</strong> in the <strong className="text-white">{currentUser?.department}</strong> department.
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex flex-col items-center shrink-0">
            <span className="text-xs text-indigo-200 uppercase tracking-widest font-semibold">Today's Date</span>
            <span className="text-xl font-bold mt-1">
              {time.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Clock In/Out card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 flex flex-col items-center justify-center text-center space-y-4">
          <div className="bg-slate-50 p-4 rounded-full border border-slate-100">
            <Clock className="h-10 w-10 text-indigo-600 animate-pulse-slow" />
          </div>
          
          <div className="space-y-1">
            <h3 className="text-3xl font-bold text-slate-800 tracking-tight">
              {time.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </h3>
            <p className="text-xs text-slate-400 font-medium">Local workspace time</p>
          </div>

          <div className="w-full pt-2">
            <button
              onClick={handleClockToggle}
              disabled={isClockedOut}
              className={`w-full py-3.5 px-4 rounded-xl font-semibold text-sm shadow-md transition-all duration-200 flex items-center justify-center gap-2 ${
                isClockedOut
                  ? 'bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                  : isClockedIn
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/10'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/10'
              }`}
            >
              {isClockedOut ? 'Clocked Out for Today' : isClockedIn ? 'Clock Out' : 'Clock In'}
            </button>
          </div>

          {clockMsg.text && (
            <p className={`text-xs font-semibold text-center py-1.5 px-3 rounded-lg ${
              clockMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
            }`}>
              {clockMsg.text}
            </p>
          )}

          <div className="w-full grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 text-left">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Check-in</span>
              <p className="text-sm font-bold text-slate-700">{todayLog?.checkIn || '--:--'}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Check-out</span>
              <p className="text-sm font-bold text-slate-700">{todayLog?.checkOut || '--:--'}</p>
            </div>
          </div>
        </div>

        {/* Leave Balances */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-semibold text-slate-800">Leave Balance</h3>
            <Link to="/leaves" className="text-xs font-semibold text-indigo-600 hover:text-indigo-500 flex items-center gap-1">
              Request Leave <Send className="h-3 w-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-4">
            {balances.map((bal) => (
              <div key={bal.name} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex flex-col justify-between">
                <div>
                  <span className="text-xs text-slate-400 font-semibold uppercase">{bal.name}</span>
                  <div className="text-2xl font-extrabold text-slate-800 mt-1">
                    {bal.remaining} <span className="text-sm font-medium text-slate-400">/ {bal.total}</span>
                  </div>
                </div>
                <div className="mt-3 w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${
                      bal.name.includes('Sick') ? 'bg-rose-500' : bal.name.includes('Casual') ? 'bg-amber-500' : 'bg-emerald-500'
                    }`} 
                    style={{ width: `${(bal.remaining / bal.total) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-3 text-xs text-indigo-700 flex items-center gap-2">
            <Sparkles className="h-4 w-4 shrink-0 text-indigo-500" />
            <span>Need time off? Leave applications are routed instantly to managers.</span>
          </div>
        </div>
      </div>

      {/* Tables and history */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Recent Attendance */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <h3 className="font-semibold text-slate-800">Recent Attendance</h3>
            <Link to="/attendance" className="text-xs font-semibold text-indigo-600 hover:text-indigo-500">
              View Log
            </Link>
          </div>

          <div className="space-y-3">
            {myAttendance.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6">No check-ins recorded yet.</p>
            ) : (
              myAttendance.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                      <Clock3 className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-slate-800">{log.date}</span>
                      <p className="text-xs text-slate-400">Worked: {log.hoursWorked}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-medium text-slate-600">{log.checkIn} - {log.checkOut || 'Active'}</span>
                    <span className={`block text-[10px] font-semibold uppercase mt-0.5 ${
                      log.status === 'On-time' ? 'text-emerald-600' : 'text-rose-600'
                    }`}>{log.status}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Leave Requests */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <h3 className="font-semibold text-slate-800">Leave Requests</h3>
            <Link to="/leaves" className="text-xs font-semibold text-indigo-600 hover:text-indigo-500">
              Request Leaves
            </Link>
          </div>

          <div className="space-y-3">
            {myLeaves.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6">No leave requests found.</p>
            ) : (
              myLeaves.map((req) => (
                <div key={req.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-slate-800">{req.type}</span>
                      <p className="text-xs text-slate-400">
                        {req.startDate} to {req.endDate}
                      </p>
                    </div>
                  </div>
                  <div>
                    <span className={`inline-flex px-2.5 py-1 rounded text-xs font-semibold uppercase tracking-wider ${
                      req.status === 'Approved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : req.status === 'Rejected'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {req.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
