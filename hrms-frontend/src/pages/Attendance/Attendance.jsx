import { useMemo, useState } from 'react';
import { useHRMS } from '../../context/HRMSContext';
import { CalendarDays, CheckCircle, AlertTriangle, Clock3, Clock, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Attendance() {
  const {
  employee,
  employees,
  teamMembers,
  attendanceLogs,leaveRequests,selectedDate,currentUser

} = useHRMS();
  const myLogs = attendanceLogs.filter(log => log.employeeId === employee?.employee_id);

  const totalDays = myLogs.length;
  const onTimeDays = myLogs.filter((log) => log.status === 'On-time').length;
  const lateDays = myLogs.filter((log) => log.status === 'Late').length;

  const stats = [
    { name: 'Total Days', value: totalDays, icon: CalendarDays, color: '#714B67', bg: '#F3EDF2' },
    { name: 'On-time', value: onTimeDays, icon: CheckCircle, color: '#155724', bg: '#D4EDDA' },
    { name: 'Late Arrivals', value: lateDays, icon: AlertTriangle, color: '#721C24', bg: '#F8D7DA' },
    { name: 'Avg. Hours', value: totalDays > 0 ? '8.4 hrs' : '—', icon: Clock3, color: '#0C5460', bg: '#D1ECF1' },
  ];

  const adminRows = useMemo(() => employees.map((employee) => {
    const log = attendanceLogs.find((item) => item.employeeId === employee.employee_id && item.date === selectedDate);
    const leave = leaveRequests.find((item) => item.employeeId === employee.employee_id && item.status === 'Approved' && item.startDate <= selectedDate && item.endDate >= selectedDate);
    return {
      id: employee.employee_id,
      name: employee.name,
      role: employee.department,
      checkIn: log?.checkIn || (leave ? 'Leave' : '—'),
      checkOut: log?.checkOut || (leave ? 'Leave' : '—'),
      hours: log?.hoursWorked || (leave ? '0.0 hrs' : '—'),
      extra: log?.checkOut ? '0.0 hrs' : '—',
      status: leave ? 'On Leave' : log ? log.status : 'Absent',
    };
  }), [attendanceLogs, employees, leaveRequests, selectedDate]);

  const monthRows = useMemo(() => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();
    const rows = [];
    for (let day = 1; day <= daysInMonth; day += 1) {
      const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const log = myLogs.find((item) => item.date === date);
      const leave = leaveRequests.find((item) => item.employeeId === currentUser?.employee_id && item.status === 'Approved' && item.startDate <= date && item.endDate >= date);
      rows.push({
        date,
        checkIn: log?.checkIn || (leave ? 'Leave' : '—'),
        checkOut: log?.checkOut || (leave ? 'Leave' : '—'),
        hours: log?.hoursWorked || (leave ? '0.0 hrs' : '—'),
        extra: log?.checkOut ? '0.0 hrs' : '—',
        status: leave ? 'On Leave' : log ? log.status : 'Absent',
      });
    }
    return rows.reverse();
  }, [currentUser?.employee_id, leaveRequests, myLogs, selectedMonth]);

  const monthLabel = new Date(`${selectedMonth}-01`).toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
  const presentCount = monthRows.filter((row) => row.checkIn !== '—' && row.checkIn !== 'Leave').length;
  const leaveCount = monthRows.filter((row) => row.status === 'On Leave').length;
  const totalWorkingDays = monthRows.length;

  const shiftDate = (direction) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + direction);
    setSelectedDate(current.toISOString().split('T')[0]);
  };

  const shiftMonth = (direction) => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const next = new Date(year, month - 1 + direction, 1);
    setSelectedMonth(`${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`);
  };

  return (
    <div className="space-y-6 odoo-fade-in">
      <div className="o-card p-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-lg font-bold" style={{ color: 'var(--odoo-text)' }}>Attendance Records</h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--odoo-text-muted)' }}>
            {isAdmin ? 'Track the team view for the selected day.' : 'Review your monthly attendance history.'}
          </p>
        </div>
        {isAdmin ? (
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={() => shiftDate(-1)} className="o-btn-secondary text-xs py-1.5 px-2"><ChevronLeft className="h-3.5 w-3.5" /></button>
            <input type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} className="o-input max-w-[180px]" />
            <button onClick={() => shiftDate(1)} className="o-btn-secondary text-xs py-1.5 px-2"><ChevronRight className="h-3.5 w-3.5" /></button>
            <span className="o-badge o-badge-purple">Day view</span>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={() => shiftMonth(-1)} className="o-btn-secondary text-xs py-1.5 px-2"><ChevronLeft className="h-3.5 w-3.5" /></button>
            <span className="o-badge o-badge-purple">{monthLabel}</span>
            <button onClick={() => shiftMonth(1)} className="o-btn-secondary text-xs py-1.5 px-2"><ChevronRight className="h-3.5 w-3.5" /></button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="o-card p-5 flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: stat.bg, color: stat.color }}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium" style={{ color: 'var(--odoo-text-muted)' }}>{stat.name}</p>
                <p className="text-xl font-bold" style={{ color: 'var(--odoo-text)' }}>{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {!isAdmin && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="o-card p-4 text-sm" style={{ color: 'var(--odoo-text-muted)' }}><span className="font-semibold" style={{ color: 'var(--odoo-text)' }}>{presentCount}</span> days present</div>
          <div className="o-card p-4 text-sm" style={{ color: 'var(--odoo-text-muted)' }}><span className="font-semibold" style={{ color: 'var(--odoo-text)' }}>{leaveCount}</span> leave days</div>
          <div className="o-card p-4 text-sm" style={{ color: 'var(--odoo-text-muted)' }}><span className="font-semibold" style={{ color: 'var(--odoo-text)' }}>{totalWorkingDays}</span> total working days</div>
        </div>
      )}

      <div className="o-card overflow-hidden">
        <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--odoo-border-light)' }}>
          <h3 className="font-bold text-[15px]" style={{ color: 'var(--odoo-text)' }}>{isAdmin ? 'Daily Team View' : 'Monthly Personal View'}</h3>
          <span className="text-xs" style={{ color: 'var(--odoo-text-muted)' }}>{isAdmin ? adminRows.length : monthRows.length} entries</span>
        </div>

        {isAdmin ? (
          <div className="overflow-x-auto">
            <table className="o-table">
              <thead>
                <tr>
                  <th>Emp</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Work Hours</th>
                  <th>Extra Hours</th>
                </tr>
              </thead>
              <tbody>
                {adminRows.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <div>
                        <p className="font-medium" style={{ color: 'var(--odoo-text)' }}>{row.name}</p>
                        <p className="text-[11px]" style={{ color: 'var(--odoo-text-muted)' }}>{row.role}</p>
                      </div>
                    </td>
                    <td>{row.checkIn}</td>
                    <td>{row.checkOut}</td>
                    <td>{row.hours}</td>
                    <td>{row.extra}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : myLogs.length === 0 && monthRows.every((row) => row.checkIn === '—' && row.status !== 'On Leave') ? (
          <div className="p-10 text-center" style={{ color: 'var(--odoo-text-muted)' }}>
            <Clock className="h-10 w-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No attendance records yet. Check in from the dashboard.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="o-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Work Hours</th>
                  <th>Extra Hours</th>
                </tr>
              </thead>
              <tbody>
                {monthRows.map((row) => (
                  <tr key={row.date}>
                    <td className="font-medium">{row.date}</td>
                    <td>{row.checkIn}</td>
                    <td>{row.checkOut}</td>
                    <td>{row.hours}</td>
                    <td>{row.extra}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
