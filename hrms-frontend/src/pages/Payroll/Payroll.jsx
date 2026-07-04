import { useState } from 'react';
import { useHRMS } from '../../context/HRMSContext';
import { Printer, Cpu, FileText, CheckCircle, ArrowRight } from 'lucide-react';

export default function Payroll() {
  const { currentUser, payrollSlips, processPayroll } = useHRMS();
  const [selectedSlip, setSelectedSlip] = useState(null);
  const [adminMsg, setAdminMsg] = useState('');

  const isEmployee = currentUser?.role?.toUpperCase() === 'EMPLOYEE';
  const mySlips = payrollSlips.filter(slip => slip.employeeId === currentUser?.employee_id);
  const allSlips = payrollSlips;
  const displaySlips = isEmployee ? mySlips : allSlips;

  const handleProcessPayroll = () => {
    setAdminMsg('');
    const res = processPayroll();
    if (res.success) setAdminMsg({ type: 'success', text: `Payroll processed! ${res.count} payslips generated.` });
    else setAdminMsg({ type: 'error', text: res.message });
  };

  return (
    <div className="space-y-6 odoo-fade-in print:space-y-4">
      {/* Header */}
      <div className="o-card p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 no-print">
        <div>
          <h2 className="text-lg font-bold" style={{ color: 'var(--odoo-text)' }}>Payroll</h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--odoo-text-muted)' }}>
            {isEmployee ? 'View and download your salary statements.' : 'Process payroll and review compensation records.'}
          </p>
        </div>
        {!isEmployee && (
          <button onClick={handleProcessPayroll} className="o-btn-primary shrink-0">
            <Cpu className="h-4 w-4" /> Process Payroll
          </button>
        )}
      </div>

      {adminMsg && (
        <div className={`p-3 rounded border text-sm no-print ${
          adminMsg.type === 'success' ? 'o-badge-success' : 'o-badge-danger'
        }`}>
          {adminMsg.text}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 print:block">
        {/* Payslip list */}
        <div className="o-card overflow-hidden lg:col-span-1 no-print">
          <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--odoo-border-light)' }}>
            <h3 className="font-bold text-[15px]" style={{ color: 'var(--odoo-text)' }}>
              {isEmployee ? 'My Payslips' : 'All Payslips'}
            </h3>
          </div>
          <div className="divide-y max-h-[500px] overflow-y-auto" style={{ borderColor: 'var(--odoo-border-light)' }}>
            {displaySlips.length === 0 ? (
              <div className="p-8 text-center text-sm" style={{ color: 'var(--odoo-text-muted)' }}>No payslips found.</div>
            ) : (
              displaySlips.map((slip) => (
                <button
                  key={slip.id}
                  onClick={() => setSelectedSlip(slip)}
                  className={`w-full text-left p-4 hover:bg-gray-50 transition-colors flex items-center justify-between ${
                    selectedSlip?.id === slip.id ? 'border-l-3' : ''
                  }`}
                  style={selectedSlip?.id === slip.id ? { borderLeftColor: 'var(--odoo-purple)', background: 'var(--odoo-purple-50)' } : {}}
                >
                  <div>
                    <span className="text-xs font-medium" style={{ color: 'var(--odoo-text-muted)' }}>{slip.month}</span>
                    <p className="font-bold text-sm" style={{ color: 'var(--odoo-text)' }}>${slip.net.toLocaleString()}</p>
                    {!isEmployee && <p className="text-[11px]" style={{ color: 'var(--odoo-text-muted)' }}>{slip.employeeName}</p>}
                  </div>
                  <span className="o-badge o-badge-success text-[11px]">
                    <CheckCircle className="h-3 w-3 mr-1" />{slip.status}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Payslip detail */}
        <div className="lg:col-span-2">
          {selectedSlip ? (
            <div className="o-card p-6 space-y-6">
              {/* Statement header */}
              <div className="flex items-start justify-between border-b pb-4" style={{ borderColor: 'var(--odoo-border-light)' }}>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="h-8 w-8 rounded flex items-center justify-center text-white font-bold text-sm" style={{ background: 'var(--odoo-purple)' }}>A</div>
                    <span className="font-bold text-lg" style={{ color: 'var(--odoo-text)' }}>Adamas Consulting</span>
                  </div>
                  <p className="text-xs" style={{ color: 'var(--odoo-text-muted)' }}>Salary Statement — {selectedSlip.month}</p>
                </div>
                <button onClick={() => window.print()} className="o-btn-secondary text-xs no-print">
                  <Printer className="h-3.5 w-3.5" /> Print
                </button>
              </div>

              {/* Employee info */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-medium mb-1" style={{ color: 'var(--odoo-text-muted)' }}>Employee</p>
                  <p className="font-bold" style={{ color: 'var(--odoo-text)' }}>{selectedSlip.employeeName}</p>
                  <p className="text-xs" style={{ color: 'var(--odoo-text-muted)' }}>ID: {selectedSlip.employeeId}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium mb-1" style={{ color: 'var(--odoo-text-muted)' }}>Status</p>
                  <span className="o-badge o-badge-success">Paid</span>
                  <p className="text-xs mt-1" style={{ color: 'var(--odoo-text-muted)' }}>Processed: {selectedSlip.processedDate}</p>
                </div>
              </div>

              {/* Breakdown table */}
              <div className="border rounded-lg overflow-hidden" style={{ borderColor: 'var(--odoo-border)' }}>
                <table className="o-table">
                  <thead>
                    <tr>
                      <th>Component</th>
                      <th className="text-right">Amount ($)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="font-medium" style={{ color: 'var(--odoo-text)' }}>Basic Salary</td>
                      <td className="text-right font-medium">{selectedSlip.basic.toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td className="font-medium" style={{ color: 'var(--odoo-text)' }}>House Rent Allowance</td>
                      <td className="text-right font-medium">{selectedSlip.hra.toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td className="font-medium" style={{ color: 'var(--odoo-text)' }}>Special Allowance</td>
                      <td className="text-right font-medium">{selectedSlip.allowance.toLocaleString()}</td>
                    </tr>
                    <tr style={{ background: '#FEF3F2' }}>
                      <td className="font-medium" style={{ color: 'var(--odoo-danger)' }}>Provident Fund (PF)</td>
                      <td className="text-right font-medium" style={{ color: 'var(--odoo-danger)' }}>-{selectedSlip.pf.toLocaleString()}</td>
                    </tr>
                    <tr style={{ background: '#FEF3F2' }}>
                      <td className="font-medium" style={{ color: 'var(--odoo-danger)' }}>Professional Tax</td>
                      <td className="text-right font-medium" style={{ color: 'var(--odoo-danger)' }}>-{selectedSlip.tax.toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Net Total */}
              <div className="flex items-center justify-between p-4 rounded-lg" style={{ background: 'var(--odoo-purple-50)', border: '1px solid var(--odoo-purple-muted)' }}>
                <div>
                  <span className="text-xs font-medium" style={{ color: 'var(--odoo-text-muted)' }}>Net Payout</span>
                  <p className="text-xs" style={{ color: 'var(--odoo-text-muted)' }}>Credited to bank account</p>
                </div>
                <span className="text-2xl font-bold" style={{ color: 'var(--odoo-purple)' }}>
                  ${selectedSlip.net.toLocaleString()}
                </span>
              </div>
            </div>
          ) : (
            <div className="o-card p-12 text-center" style={{ color: 'var(--odoo-text-muted)' }}>
              <FileText className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Select a payslip to view the full statement.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
