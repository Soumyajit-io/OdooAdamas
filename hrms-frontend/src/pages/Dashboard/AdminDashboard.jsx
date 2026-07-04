import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useHRMS } from '../../context/HRMSContext';
import { Users, CalendarClock, DollarSign, Clock, Search, Plus, Settings, Plane, Briefcase } from 'lucide-react';

export default function AdminDashboard() {
  const { employees, leaveRequests, attendanceLogs, addEmployee, approveLeave, rejectLeave, getEmployeeStatus } = useHRMS();
  const [search, setSearch] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', department: 'General', job_title: '' });

  const todayStr = new Date().toISOString().split('T')[0];
  const todayCheckins = attendanceLogs.filter((log) => log.date === todayStr).length;
  const pendingLeaves = leaveRequests.filter((req) => req.status === 'Pending');
  const totalSalaryBudget = employees.reduce((acc, curr) => acc + curr.salary, 0);
  const presentRate = employees.length > 0 ? Math.round((todayCheckins / employees.length) * 100) : 0;

  const filteredEmployees = employees.filter((employee) => {
    const term = search.toLowerCase();
    return !term || [employee.name, employee.email, employee.department, employee.job_title].join(' ').toLowerCase().includes(term);
  });

  const stats = [
    { name: 'Total Employees', value: employees.length, icon: Users, color: '#714B67', bg: '#F3EDF2' },
    { name: 'Pending Leaves', value: pendingLeaves.length, icon: CalendarClock, color: '#856404', bg: '#FFF3CD' },
    { name: 'Monthly Payroll', value: `$${totalSalaryBudget.toLocaleString()}`, icon: DollarSign, color: '#155724', bg: '#D4EDDA' },
    { name: 'Present Today', value: `${todayCheckins} / ${employees.length}`, icon: Clock, color: '#0C5460', bg: '#D1ECF1' },
  ];

  const handleAddEmployee = (event) => {
    event.preventDefault();
    const res = addEmployee({
      first_name: form.first_name,
      last_name: form.last_name,
      email: form.email,
      department: form.department,
      job_title: form.job_title,
      salary: 40000,
    });
    if (res.success) {
      setForm({ first_name: '', last_name: '', email: '', department: 'General', job_title: '' });
      setShowAddForm(false);
    }
  };

  return (
    <div className="space-y-6 odoo-fade-in">
      <div className="o-card p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold" style={{ color: 'var(--odoo-text)' }}>Employees</h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--odoo-text-muted)' }}>
            View the full directory, check live presence, and manage onboarding from one place.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <label className="relative block">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--odoo-text-muted)' }} />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search employees" className="o-input pl-9" />
          </label>
          <button onClick={() => setShowAddForm((value) => !value)} className="o-btn-primary shrink-0">
            <Plus className="h-4 w-4" /> New
          </button>
        </div>
      </div>

      {showAddForm && (
        <div className="o-card p-5">
          <h3 className="font-bold text-[15px] mb-4" style={{ color: 'var(--odoo-text)' }}>Add Employee</h3>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleAddEmployee}>
            <input required value={form.first_name} onChange={(event) => setForm((value) => ({ ...value, first_name: event.target.value }))} placeholder="First name" className="o-input" />
            <input required value={form.last_name} onChange={(event) => setForm((value) => ({ ...value, last_name: event.target.value }))} placeholder="Last name" className="o-input" />
            <input required type="email" value={form.email} onChange={(event) => setForm((value) => ({ ...value, email: event.target.value }))} placeholder="Email" className="o-input" />
            <input value={form.job_title} onChange={(event) => setForm((value) => ({ ...value, job_title: event.target.value }))} placeholder="Job title" className="o-input" />
            <input value={form.department} onChange={(event) => setForm((value) => ({ ...value, department: event.target.value }))} placeholder="Department" className="o-input" />
            <button className="o-btn-primary md:col-span-2" type="submit">Create Employee</button>
          </form>
        </div>
      )}

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
        <div className="lg:col-span-2 o-card flex flex-col">
          <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--odoo-border-light)' }}>
            <h3 className="font-bold text-[15px]" style={{ color: 'var(--odoo-text)' }}>Pending Leave Requests</h3>
            {pendingLeaves.length > 0 && <span className="o-badge o-badge-warning">{pendingLeaves.length} pending</span>}
          </div>
          <div className="flex-1 overflow-y-auto max-h-[320px]">
            {pendingLeaves.length === 0 ? (
              <div className="p-8 text-center text-sm" style={{ color: 'var(--odoo-text-muted)' }}>No pending approvals.</div>
            ) : pendingLeaves.map((req) => (
              <div key={req.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50 transition-colors">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm" style={{ color: 'var(--odoo-text)' }}>{req.employeeName}</span>
                    <span className="o-badge o-badge-purple text-[11px]">{req.type}</span>
                  </div>
                  <p className="text-xs" style={{ color: 'var(--odoo-text-muted)' }}>{req.startDate} → {req.endDate}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => approveLeave(req.id)} className="o-btn-success text-xs py-1.5 px-3">Approve</button>
                  <button onClick={() => rejectLeave(req.id)} className="o-btn-secondary text-xs py-1.5 px-3">Reject</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="o-card p-5 space-y-4">
          <h3 className="font-bold text-[15px] border-b pb-3" style={{ color: 'var(--odoo-text)', borderColor: 'var(--odoo-border-light)' }}>Team Snapshot</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span style={{ color: 'var(--odoo-text-muted)' }}>Attendance Rate</span>
              <span className="font-bold" style={{ color: 'var(--odoo-text)' }}>{presentRate}%</span>
            </div>
            <div className="w-full rounded-full h-2" style={{ background: 'var(--odoo-border-light)' }}>
              <div className="h-2 rounded-full" style={{ width: `${presentRate}%`, background: 'var(--odoo-teal)' }}></div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--odoo-text-muted)' }}>
            <Briefcase className="h-4 w-4" /> {employees.filter((employee) => employee.department === 'Engineering').length} engineers active
          </div>
        </div>
      </div>

      <div className="o-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-[15px]" style={{ color: 'var(--odoo-text)' }}>Employee Directory</h3>
          <span className="text-xs font-medium" style={{ color: 'var(--odoo-text-muted)' }}>{filteredEmployees.length} people</span>
        </div>
        <div className="emp-grid">
          {filteredEmployees.map((employee) => {
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

      <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--odoo-text-muted)' }}>
        <Settings className="h-4 w-4" />
        <Link to="/profile" className="hover:underline" style={{ color: 'var(--odoo-purple)' }}>Settings</Link>
      </div>
    </div>
  );
}
