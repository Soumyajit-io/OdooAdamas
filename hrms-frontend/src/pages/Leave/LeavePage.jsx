import { useState } from 'react';
import { useHRMS } from '../../context/HRMSContext';
import { Send, Check, X, Calendar, FileText } from 'lucide-react';

export default function LeavePage() {
  const { currentUser, leaveRequests, requestLeave, approveLeave, rejectLeave } = useHRMS();

  const [type, setType] = useState('Sick Leave');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [msg, setMsg] = useState('');

  const isEmployee = currentUser?.role === 'Employee';
  const myRequests = leaveRequests.filter(req => req.employeeId === currentUser?.id);

  const handleSubmit = (e) => {
    e.preventDefault();
    setMsg('');
    if (new Date(startDate) > new Date(endDate)) {
      setMsg({ type: 'error', text: 'Start date cannot be after end date.' });
      return;
    }
    const res = requestLeave(type, startDate, endDate, reason);
    if (res.success) {
      setMsg({ type: 'success', text: 'Leave request submitted!' });
      setStartDate(''); setEndDate(''); setReason('');
    }
  };

  return (
    <div className="space-y-6 odoo-fade-in">
      <div className="o-card p-5">
        <h2 className="text-lg font-bold" style={{ color: 'var(--odoo-text)' }}>Time Off</h2>
        <p className="text-sm mt-0.5" style={{ color: 'var(--odoo-text-muted)' }}>
          {isEmployee ? 'Submit leave requests and track their status.' : 'Review and manage time off requests for all employees.'}
        </p>
      </div>

      {isEmployee ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Form */}
          <div className="o-card p-5 lg:col-span-1 h-fit">
            <h3 className="font-bold text-[15px] border-b pb-3 mb-4" style={{ color: 'var(--odoo-text)', borderColor: 'var(--odoo-border-light)' }}>
              New Request
            </h3>

            {msg && (
              <div className={`mb-4 p-3 rounded border text-sm ${
                msg.type === 'success' ? 'o-badge-success' : 'o-badge-danger'
              }`}>
                {msg.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--odoo-text)' }}>Leave Type</label>
                <select value={type} onChange={(e) => setType(e.target.value)} className="o-input">
                  <option value="Sick Leave">Sick Leave</option>
                  <option value="Casual Leave">Casual Leave</option>
                  <option value="Paid Leave">Paid Annual Leave</option>
                  <option value="Unpaid Leave">Unpaid Leave</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--odoo-text)' }}>From</label>
                  <input type="date" required value={startDate} onChange={(e) => setStartDate(e.target.value)} className="o-input" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--odoo-text)' }}>To</label>
                  <input type="date" required value={endDate} onChange={(e) => setEndDate(e.target.value)} className="o-input" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--odoo-text)' }}>Description</label>
                <textarea rows="3" required value={reason} onChange={(e) => setReason(e.target.value)}
                  className="o-input" placeholder="Reason for your leave request…" />
              </div>
              <button type="submit" className="o-btn-primary w-full justify-center">
                <Send className="h-4 w-4" /> Submit Request
              </button>
            </form>
          </div>

          {/* History */}
          <div className="o-card overflow-hidden lg:col-span-2">
            <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--odoo-border-light)' }}>
              <h3 className="font-bold text-[15px]" style={{ color: 'var(--odoo-text)' }}>My Requests</h3>
              <span className="text-xs" style={{ color: 'var(--odoo-text-muted)' }}>{myRequests.length} total</span>
            </div>
            {myRequests.length === 0 ? (
              <div className="p-10 text-center" style={{ color: 'var(--odoo-text-muted)' }}>
                <Calendar className="h-10 w-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No leave applications yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="o-table">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>From</th>
                      <th>To</th>
                      <th>Reason</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myRequests.map((req) => (
                      <tr key={req.id}>
                        <td className="font-medium">{req.type}</td>
                        <td>{req.startDate}</td>
                        <td>{req.endDate}</td>
                        <td className="max-w-[200px] truncate">{req.reason}</td>
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
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Admin console */
        <div className="o-card overflow-hidden">
          <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--odoo-border-light)' }}>
            <h3 className="font-bold text-[15px]" style={{ color: 'var(--odoo-text)' }}>All Leave Requests</h3>
            <span className="text-xs" style={{ color: 'var(--odoo-text-muted)' }}>{leaveRequests.length} records</span>
          </div>
          <div className="overflow-x-auto">
            <table className="o-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Type</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {leaveRequests.map((req) => (
                  <tr key={req.id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ background: 'var(--odoo-purple)' }}>
                          {req.employeeName.charAt(0)}
                        </div>
                        <div>
                          <span className="font-medium text-sm">{req.employeeName}</span>
                          <p className="text-[11px]" style={{ color: 'var(--odoo-text-muted)' }}>{req.employeeId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="font-medium">{req.type}</td>
                    <td>{req.startDate}</td>
                    <td>{req.endDate}</td>
                    <td className="max-w-[180px] truncate">{req.reason}</td>
                    <td>
                      <span className={`o-badge ${
                        req.status === 'Approved' ? 'o-badge-success' :
                        req.status === 'Rejected' ? 'o-badge-danger' :
                        'o-badge-warning'
                      }`}>
                        {req.status}
                      </span>
                    </td>
                    <td>
                      {req.status === 'Pending' ? (
                        <div className="flex items-center justify-center gap-1.5">
                          <button onClick={() => approveLeave(req.id)} className="o-btn-success text-xs py-1 px-2">
                            <Check className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => rejectLeave(req.id)} className="o-btn-secondary text-xs py-1 px-2" style={{ color: 'var(--odoo-danger)', borderColor: 'var(--odoo-danger)' }}>
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs" style={{ color: 'var(--odoo-text-light)' }}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
