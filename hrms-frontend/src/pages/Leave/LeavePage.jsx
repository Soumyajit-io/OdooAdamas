import { useState } from 'react';
import { useHRMS } from '../../context/HRMSContext';
import { Calendar, FileText, Send, Check, X, Info } from 'lucide-react';

export default function LeavePage() {
  const { currentUser, leaveRequests, requestLeave, approveLeave, rejectLeave } = useHRMS();

  // State for request form
  const [type, setType] = useState('Sick Leave');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [msg, setMsg] = useState('');

  const isEmployee = currentUser?.role === 'Employee';

  // Filter requests
  const myRequests = leaveRequests.filter(req => req.employeeId === currentUser?.id);
  const allRequests = leaveRequests;

  const handleSubmit = (e) => {
    e.preventDefault();
    setMsg('');

    if (new Date(startDate) > new Date(endDate)) {
      setMsg({ type: 'error', text: 'Start date cannot be after end date.' });
      return;
    }

    const res = requestLeave(type, startDate, endDate, reason);
    if (res.success) {
      setMsg({ type: 'success', text: 'Leave request submitted successfully!' });
      // Reset form
      setStartDate('');
      setEndDate('');
      setReason('');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-800">Leave Management</h2>
        <p className="text-slate-500 text-sm mt-1">
          {isEmployee 
            ? 'Request leave and track the status of your applications.' 
            : 'Approve, reject, and monitor leave requests across the company.'
          }
        </p>
      </div>

      {isEmployee ? (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Leave Request Form */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 lg:col-span-1 h-fit">
            <h3 className="font-semibold text-slate-800 border-b border-slate-100 pb-3 mb-5">
              Submit Leave Request
            </h3>
            
            {msg && (
              <div className={`mb-5 p-3 rounded-lg text-xs font-semibold ${
                msg.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
              }`}>
                {msg.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase">Leave Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="mt-1.5 block w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                >
                  <option value="Sick Leave">Sick Leave</option>
                  <option value="Casual Leave">Casual Leave</option>
                  <option value="Paid Leave">Paid Annual Leave</option>
                  <option value="Unpaid Leave">Unpaid Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase">Start Date</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="mt-1.5 block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase">End Date</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="mt-1.5 block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase">Reason</label>
                <textarea
                  rows="4"
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="State the purpose of your leave request..."
                  className="mt-1.5 block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm shadow-md hover:shadow-indigo-600/10 transition-all"
              >
                <Send className="h-4 w-4" /> Submit Application
              </button>
            </form>
          </div>

          {/* Leave History List */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden lg:col-span-2">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-semibold text-slate-800">My Leave Applications</h3>
              <span className="text-xs text-slate-500">{myRequests.length} requests</span>
            </div>

            {myRequests.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <Calendar className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                <p className="text-sm font-medium">No leave applications found.</p>
                <p className="text-xs mt-1">Submit your first application using the form.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {myRequests.map((req) => (
                  <div key={req.id} className="p-6 space-y-2.5 hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="bg-indigo-50 text-indigo-700 font-semibold px-2 py-0.5 rounded text-xs">
                          {req.type}
                        </span>
                        <span className="text-xs text-slate-400">ID: {req.id}</span>
                      </div>
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold uppercase ${
                        req.status === 'Approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : req.status === 'Rejected'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {req.status}
                      </span>
                    </div>
                    
                    <div className="text-sm text-slate-600">
                      Dates: <strong className="text-slate-800">{req.startDate}</strong> to <strong className="text-slate-800">{req.endDate}</strong>
                    </div>

                    <div className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded border border-slate-100 flex gap-2">
                      <FileText className="h-4 w-4 shrink-0 text-slate-400" />
                      <span>{req.reason}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Admin View: Grid of leave requests with quick actions */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800">Leave Console</h3>
            <span className="text-xs text-slate-500">{allRequests.length} total records</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                  <th className="px-6 py-4">Employee</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Duration</th>
                  <th className="px-6 py-4">Reason</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600 text-sm">
                {allRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800">{req.employeeName}</div>
                      <div className="text-xs text-slate-400">{req.employeeId}</div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-700">{req.type}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-800">{req.startDate}</div>
                      <div className="text-xs text-slate-400">to {req.endDate}</div>
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate" title={req.reason}>
                      {req.reason}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold uppercase ${
                        req.status === 'Approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : req.status === 'Rejected'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {req.status === 'Pending' ? (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => approveLeave(req.id)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white p-1.5 rounded-lg shadow-sm hover:shadow transition-all"
                            title="Approve Leave"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => rejectLeave(req.id)}
                            className="bg-slate-100 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-slate-600 p-1.5 rounded-lg border border-slate-200 transition-all"
                            title="Reject Leave"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="text-center text-xs text-slate-400 italic">Processed</div>
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
