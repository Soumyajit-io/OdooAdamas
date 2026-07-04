import { useHRMS } from '../../context/HRMSContext';
import { CalendarDays, Clock3, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

export default function Attendance() {
  const { currentUser, attendanceLogs } = useHRMS();

  // Filter logs for current user
  const myLogs = attendanceLogs.filter(log => log.employeeId === currentUser?.id);

  // Statistics
  const totalDays = myLogs.length;
  const onTimeDays = myLogs.filter(log => log.status === 'On-time').length;
  const lateDays = myLogs.filter(log => log.status === 'Late').length;
  const avgHours = totalDays > 0 ? '8.4 hrs' : '0 hrs';

  const stats = [
    { name: 'Total Logged Days', value: totalDays, icon: CalendarDays, color: 'text-indigo-600', bgColor: 'bg-indigo-50' },
    { name: 'On-time Days', value: onTimeDays, icon: CheckCircle, color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
    { name: 'Late Check-ins', value: lateDays, icon: AlertTriangle, color: 'text-rose-600', bgColor: 'bg-rose-50' },
    { name: 'Avg. Daily Hours', value: avgHours, icon: Clock3, color: 'text-sky-600', bgColor: 'bg-sky-50' }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-800">Attendance Center</h2>
        <p className="text-slate-500 text-sm mt-1">
          Review your clock-in schedules, hours worked, and track lateness trends.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{stat.name}</span>
                <div className="text-2xl font-bold text-slate-800">{stat.value}</div>
              </div>
              <div className={`p-3 rounded-xl ${stat.bgColor} ${stat.color}`}>
                <Icon className="h-5 w-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-semibold text-slate-800">Historical Logs</h3>
          <span className="text-xs text-slate-500">{totalDays} entries</span>
        </div>
        
        {myLogs.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Clock className="h-12 w-12 mx-auto mb-3 text-slate-300" />
            <p className="text-sm font-medium">No clock-ins recorded yet!</p>
            <p className="text-xs mt-1">Clock in on the Dashboard to create logs.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Check In</th>
                  <th className="px-6 py-4">Check Out</th>
                  <th className="px-6 py-4">Hours Worked</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600 text-sm">
                {myLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-800">{log.date}</td>
                    <td className="px-6 py-4 font-medium text-slate-700">{log.checkIn}</td>
                    <td className="px-6 py-4 font-medium text-slate-700">{log.checkOut || <span className="text-indigo-600 font-semibold animate-pulse">Active</span>}</td>
                    <td className="px-6 py-4">{log.hoursWorked}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold uppercase ${
                        log.status === 'On-time' ? 'bg-emerald-55 bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
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
