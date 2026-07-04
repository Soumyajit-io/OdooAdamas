import { useHRMS } from '../../context/HRMSContext';
import { Users, CalendarClock, DollarSign, Clock, Check, X, ArrowUpRight, TrendingUp } from 'lucide-react';

export default function AdminDashboard() {
  const { employees, leaveRequests, attendanceLogs, approveLeave, rejectLeave } = useHRMS();

  const todayStr = new Date().toISOString().split('T')[0];
  const todayCheckins = attendanceLogs.filter(log => log.date === todayStr).length;
  const pendingLeaves = leaveRequests.filter(req => req.status === 'Pending');
  const totalSalaryBudget = employees.reduce((acc, curr) => acc + curr.salary, 0);

  const stats = [
    {
      name: 'Total Employees',
      value: employees.length,
      icon: Users,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      desc: 'Active team members'
    },
    {
      name: 'Pending Leaves',
      value: pendingLeaves.length,
      icon: CalendarClock,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      desc: 'Requires your review'
    },
    {
      name: 'Monthly Payroll',
      value: `$${totalSalaryBudget.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      desc: 'Gross employee salaries'
    },
    {
      name: 'Present Today',
      value: todayCheckins,
      icon: Clock,
      color: 'text-sky-600',
      bgColor: 'bg-sky-50',
      desc: 'Total check-ins today'
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-700 to-indigo-900 rounded-3xl p-6 md:p-8 text-white shadow-xl shadow-indigo-950/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-2xl translate-x-1/3 -translate-y-1/3"></div>
        <div className="relative z-10 max-w-xl">
          <span className="bg-indigo-500/30 text-indigo-200 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
            Workspace Console
          </span>
          <h2 className="text-2xl md:text-3xl font-bold mt-3">Welcome Back, Administrator!</h2>
          <p className="text-indigo-100/80 mt-2 text-sm md:text-base leading-relaxed">
            Monitor and manage employee records, attendance logs, and leave requests. Below is a quick overview of Adamas operations.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow duration-200">
              <div className="space-y-1">
                <span className="text-sm font-medium text-slate-500">{stat.name}</span>
                <div className="text-2xl font-bold text-slate-800">{stat.value}</div>
                <span className="text-[11px] text-slate-400 block">{stat.desc}</span>
              </div>
              <div className={`p-3.5 rounded-xl ${stat.bgColor} ${stat.color}`}>
                <Icon className="h-6 w-6" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Leave Approvals (Left 2 Columns on desktop) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800">Pending Leave Requests</h3>
            <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-1 rounded-full">
              {pendingLeaves.length} Pending
            </span>
          </div>

          <div className="divide-y divide-slate-100 overflow-y-auto max-h-[400px] flex-1">
            {pendingLeaves.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <CalendarClock className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                <p className="text-sm font-medium">All leave requests processed!</p>
                <p className="text-xs mt-1">New requests will appear here.</p>
              </div>
            ) : (
              pendingLeaves.map((req) => (
                <div key={req.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-800">{req.employeeName}</span>
                      <span className="text-xs text-slate-400">({req.employeeId})</span>
                    </div>
                    <div className="text-xs text-slate-500 flex flex-wrap gap-x-3 gap-y-1">
                      <span className="bg-indigo-50 text-indigo-700 font-medium px-2 py-0.5 rounded">
                        {req.type}
                      </span>
                      <span>
                        Dates: <strong className="text-slate-700">{req.startDate}</strong> to <strong className="text-slate-700">{req.endDate}</strong>
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 mt-2">
                      "{req.reason}"
                    </p>
                  </div>
                  <div className="flex sm:flex-col items-center gap-2 sm:self-center shrink-0">
                    <button
                      onClick={() => approveLeave(req.id)}
                      className="flex-1 sm:w-28 flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2 px-3 rounded-lg text-xs shadow-sm hover:shadow transition-all"
                    >
                      <Check className="h-3.5 w-3.5" /> Approve
                    </button>
                    <button
                      onClick={() => rejectLeave(req.id)}
                      className="flex-1 sm:w-28 flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-slate-600 font-semibold py-2 px-3 rounded-lg text-xs border border-slate-200 transition-all"
                    >
                      <X className="h-3.5 w-3.5" /> Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Action Panel (Right 1 Column on desktop) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-6">
          <h3 className="font-semibold text-slate-800 border-b border-slate-100 pb-3">Operational Summary</h3>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                <TrendingUp className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-400">Engineering Staff</p>
                <p className="text-sm font-semibold text-slate-700">
                  {employees.filter(e => e.department === 'Engineering').length} Members
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                <Check className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-400">Total Admin Staff</p>
                <p className="text-sm font-semibold text-slate-700">
                  {employees.filter(e => e.role === 'Admin').length} Members
                </p>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              <span>Today's Checkins</span>
              <span>{Math.round((todayCheckins / (employees.length || 1)) * 100)}% Present</span>
            </div>
            <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
              <div 
                className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500" 
                style={{ width: `${(todayCheckins / (employees.length || 1)) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Employee Directory */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-semibold text-slate-800">Employee Directory</h3>
          <span className="text-xs text-slate-500">{employees.length} Records Total</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                <th className="px-6 py-4">Employee ID</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4">Joined Date</th>
                <th className="px-6 py-4 text-right">Salary</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600 text-sm">
              {employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-mono font-medium text-slate-900">{emp.id}</td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-800">{emp.name}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{emp.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 rounded text-xs font-semibold ${
                      emp.role === 'Admin' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {emp.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">{emp.department}</td>
                  <td className="px-6 py-4">{emp.joinDate}</td>
                  <td className="px-6 py-4 text-right font-medium text-slate-800">
                    ${emp.salary.toLocaleString()}/mo
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
