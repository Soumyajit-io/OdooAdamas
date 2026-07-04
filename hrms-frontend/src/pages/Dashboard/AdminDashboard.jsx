import { useHRMS } from '../../context/HRMSContext';
import { Users, CalendarClock, DollarSign, Clock, Check, X, TrendingUp, AlertTriangle } from 'lucide-react';

export default function AdminDashboard() {
  const { employees, leaveRequests, attendanceLogs, approveLeave, rejectLeave } = useHRMS();

  const todayStr = new Date().toISOString().split('T')[0];
  const todayCheckins = attendanceLogs.filter(log => log.date === todayStr).length;
  const pendingLeaves = leaveRequests.filter(req => req.status === 'Pending');
  const totalSalaryBudget = employees.reduce((acc, curr) => acc + curr.salary, 0);
  const presentRate = employees.length > 0 ? Math.round((todayCheckins / employees.length) * 100) : 0;

  const stats = [
    { name: 'Total Employees', value: employees.length, icon: Users, color: '#714B67', bg: '#F3EDF2' },
    { name: 'Pending Leaves', value: pendingLeaves.length, icon: CalendarClock, color: '#856404', bg: '#FFF3CD' },
    { name: 'Monthly Payroll', value: `$${totalSalaryBudget.toLocaleString()}`, icon: DollarSign, color: '#155724', bg: '#D4EDDA' },
    { name: 'Present Today', value: `${todayCheckins} / ${employees.length}`, icon: Clock, color: '#0C5460', bg: '#D1ECF1' },
  ];

  return (
    <div className="space-y-6 odoo-fade-in">
      {/* Welcome strip */}
      <div className="o-card p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold" style={{ color: 'var(--odoo-text)' }}>Admin Dashboard</h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--odoo-text-muted)' }}>
            Overview of HR operations, employee records, and pending actions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="o-badge o-badge-purple">
            <Clock className="h-3 w-3 mr-1" />
            {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="o-card p-5 flex items-center gap-4">
              <div className="h-11 w-11 rounded-lg flex items-center justify-center shrink-0" style={{ background: stat.bg, color: stat.color }}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium" style={{ color: 'var(--odoo-text-muted)' }}>{stat.name}</p>
                <p className="text-xl font-bold mt-0.5" style={{ color: 'var(--odoo-text)' }}>{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Pending Leave Approvals */}
        <div className="lg:col-span-2 o-card flex flex-col">
          <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--odoo-border-light)' }}>
            <h3 className="font-bold text-[15px]" style={{ color: 'var(--odoo-text)' }}>Pending Leave Requests</h3>
            {pendingLeaves.length > 0 && (
              <span className="o-badge o-badge-warning">{pendingLeaves.length} pending</span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto max-h-[400px]">
            {pendingLeaves.length === 0 ? (
              <div className="p-8 text-center" style={{ color: 'var(--odoo-text-muted)' }}>
                <Check className="h-10 w-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm font-medium">All leave requests have been processed.</p>
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: 'var(--odoo-border-light)' }}>
                {pendingLeaves.map((req) => (
                  <div key={req.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm" style={{ color: 'var(--odoo-text)' }}>{req.employeeName}</span>
                        <span className="o-badge o-badge-purple text-[11px]">{req.type}</span>
                      </div>
                      <p className="text-xs" style={{ color: 'var(--odoo-text-muted)' }}>
                        {req.startDate} → {req.endDate} · "{req.reason}"
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => approveLeave(req.id)} className="o-btn-success text-xs py-1.5 px-3">
                        <Check className="h-3.5 w-3.5" /> Approve
                      </button>
                      <button onClick={() => rejectLeave(req.id)} className="o-btn-secondary text-xs py-1.5 px-3" style={{ color: 'var(--odoo-danger)', borderColor: 'var(--odoo-danger)' }}>
                        <X className="h-3.5 w-3.5" /> Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column: quick metrics */}
        <div className="o-card p-5 space-y-5">
          <h3 className="font-bold text-[15px] border-b pb-3" style={{ color: 'var(--odoo-text)', borderColor: 'var(--odoo-border-light)' }}>Summary</h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span style={{ color: 'var(--odoo-text-muted)' }}>Attendance Rate</span>
              <span className="font-bold" style={{ color: 'var(--odoo-text)' }}>{presentRate}%</span>
            </div>
            <div className="w-full rounded-full h-2" style={{ background: 'var(--odoo-border-light)' }}>
              <div className="h-2 rounded-full transition-all" style={{ width: `${presentRate}%`, background: 'var(--odoo-teal)' }}></div>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {[
              { label: 'Engineering', val: employees.filter(e => e.department === 'Engineering').length },
              { label: 'Human Resources', val: employees.filter(e => e.department === 'Human Resources').length },
              { label: 'Operations', val: employees.filter(e => e.department === 'Operations').length },
            ].map((dep) => (
              <div key={dep.label} className="flex items-center justify-between text-sm">
                <span style={{ color: 'var(--odoo-text-muted)' }}>{dep.label}</span>
                <span className="font-medium" style={{ color: 'var(--odoo-text)' }}>{dep.val} staff</span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t" style={{ borderColor: 'var(--odoo-border-light)' }}>
            <div className="flex items-center justify-between text-sm">
              <span style={{ color: 'var(--odoo-text-muted)' }}>Admins</span>
              <span className="font-medium" style={{ color: 'var(--odoo-text)' }}>{employees.filter(e => e.role === 'Admin').length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Employee Directory Table */}
      <div className="o-card overflow-hidden">
        <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--odoo-border-light)' }}>
          <h3 className="font-bold text-[15px]" style={{ color: 'var(--odoo-text)' }}>Employee Directory</h3>
          <span className="text-xs font-medium" style={{ color: 'var(--odoo-text-muted)' }}>{employees.length} records</span>
        </div>
        <div className="overflow-x-auto">
          <table className="o-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Employee</th>
                <th>Role</th>
                <th>Department</th>
                <th>Join Date</th>
                <th className="text-right">Salary</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.id}>
                  <td className="font-mono font-medium">{emp.id}</td>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ background: emp.role === 'Admin' ? 'var(--odoo-purple)' : 'var(--odoo-teal)' }}>
                        {emp.name.charAt(0)}
                      </div>
                      <div>
                        <span className="font-medium">{emp.name}</span>
                        <p className="text-xs" style={{ color: 'var(--odoo-text-muted)' }}>{emp.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`o-badge ${emp.role === 'Admin' ? 'o-badge-purple' : 'o-badge-info'}`}>
                      {emp.role}
                    </span>
                  </td>
                  <td>{emp.department}</td>
                  <td>{emp.joinDate}</td>
                  <td className="text-right font-medium">${emp.salary.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
