import { useHRMS } from '../../context/HRMSContext';
import { CalendarDays, CheckCircle, AlertTriangle, Clock3, Clock } from 'lucide-react';

export default function Attendance() {
  const { currentUser, attendanceLogs } = useHRMS();
  const myLogs = attendanceLogs.filter(log => log.employeeId === currentUser?.employee_id);

  const totalDays = myLogs.length;
  const onTimeDays = myLogs.filter(log => log.status === 'On-time').length;
  const lateDays = myLogs.filter(log => log.status === 'Late').length;

  const stats = [
    { name: 'Total Days', value: totalDays, icon: CalendarDays, color: '#714B67', bg: '#F3EDF2' },
    { name: 'On-time', value: onTimeDays, icon: CheckCircle, color: '#155724', bg: '#D4EDDA' },
    { name: 'Late Arrivals', value: lateDays, icon: AlertTriangle, color: '#721C24', bg: '#F8D7DA' },
    { name: 'Avg. Hours', value: totalDays > 0 ? '8.4 hrs' : '—', icon: Clock3, color: '#0C5460', bg: '#D1ECF1' },
  ];

  return (
    <div className="space-y-6 odoo-fade-in">
      <div className="o-card p-5">
        <h2 className="text-lg font-bold" style={{ color: 'var(--odoo-text)' }}>Attendance Records</h2>
        <p className="text-sm mt-0.5" style={{ color: 'var(--odoo-text-muted)' }}>
          Track your clock-in history, working hours, and punctuality.
        </p>
      </div>

      {/* Stats */}
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

      {/* Table */}
      <div className="o-card overflow-hidden">
        <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--odoo-border-light)' }}>
          <h3 className="font-bold text-[15px]" style={{ color: 'var(--odoo-text)' }}>Detailed Log</h3>
          <span className="text-xs" style={{ color: 'var(--odoo-text-muted)' }}>{totalDays} entries</span>
        </div>

        {myLogs.length === 0 ? (
          <div className="p-10 text-center" style={{ color: 'var(--odoo-text-muted)' }}>
            <Clock className="h-10 w-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No attendance records yet. Check in from the Dashboard.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="o-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Hours Worked</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {myLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="font-medium">{log.date}</td>
                    <td>{log.checkIn}</td>
                    <td>{log.checkOut || <span className="font-medium" style={{ color: 'var(--odoo-teal)' }}>Active</span>}</td>
                    <td>{log.hoursWorked}</td>
                    <td>
                      <span className={`o-badge ${log.status === 'On-time' ? 'o-badge-success' : 'o-badge-danger'}`}>
                        {log.status}
                      </span>
                    </td>
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
