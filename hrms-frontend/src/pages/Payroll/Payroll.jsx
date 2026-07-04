import { useState } from 'react';
import { useHRMS } from '../../context/HRMSContext';
import { DollarSign, Printer, Download, Cpu, Coins, FileText, CheckCircle } from 'lucide-react';

export default function Payroll() {
  const { currentUser, payrollSlips, processPayroll } = useHRMS();
  const [selectedSlip, setSelectedSlip] = useState(null);
  const [adminMsg, setAdminMsg] = useState('');

  const isEmployee = currentUser?.role === 'Employee';

  // Filter slips
  const mySlips = payrollSlips.filter(slip => slip.employeeId === currentUser?.id);
  const allSlips = payrollSlips;

  const handleProcessPayroll = () => {
    setAdminMsg('');
    const res = processPayroll();
    if (res.success) {
      setAdminMsg({ type: 'success', text: `Successfully processed payroll! ${res.count} payslips generated for this month.` });
    } else {
      setAdminMsg({ type: 'error', text: res.message });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 animate-fade-in print:bg-white print:p-0">
      {/* Header - Hidden on Print */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Payroll Center</h2>
          <p className="text-slate-500 text-sm mt-1">
            {isEmployee
              ? 'View monthly compensation statements and download payslips.'
              : 'Generate, manage, and review payroll for all registered employees.'
            }
          </p>
        </div>

        {!isEmployee && (
          <button
            onClick={handleProcessPayroll}
            className="self-start sm:self-center flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 px-4 rounded-xl text-sm shadow-md hover:shadow-indigo-600/10 transition-all shrink-0"
          >
            <Cpu className="h-4 w-4" /> Run Payroll Processing
          </button>
        )}
      </div>

      {adminMsg && (
        <div className={`p-4 rounded-xl text-sm font-semibold print:hidden ${
          adminMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
        }`}>
          {adminMsg.text}
        </div>
      )}

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 print:block">
        
        {/* Left Panel: Payslip History List (Hidden on Print) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden lg:col-span-1 print:hidden">
          <div className="px-6 py-5 border-b border-slate-100">
            <h3 className="font-semibold text-slate-800">
              {isEmployee ? 'My Payslips' : 'All Payslips'}
            </h3>
          </div>

          <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
            {(isEmployee ? mySlips : allSlips).length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <Coins className="h-10 w-10 mx-auto mb-2 text-slate-300" />
                <p className="text-sm font-medium">No payslips found.</p>
              </div>
            ) : (
              (isEmployee ? mySlips : allSlips).map((slip) => (
                <button
                  key={slip.id}
                  onClick={() => setSelectedSlip(slip)}
                  className={`w-full text-left p-5 hover:bg-slate-50 flex items-center justify-between transition-colors ${
                    selectedSlip?.id === slip.id ? 'bg-indigo-50/50 border-r-4 border-indigo-600' : ''
                  }`}
                >
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-slate-400 uppercase">{slip.month}</span>
                    <h4 className="font-bold text-slate-800">${slip.net.toLocaleString()}</h4>
                    {!isEmployee && (
                      <p className="text-xs text-slate-500 font-medium">Emp: {slip.employeeName}</p>
                    )}
                  </div>
                  
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded uppercase">
                    <CheckCircle className="h-3 w-3" /> {slip.status}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right Panel: Selected Payslip Detailed Statement */}
        <div className="lg:col-span-2 print:col-span-3">
          {selectedSlip ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 md:p-8 space-y-8 relative print:border-none print:shadow-none">
              
              {/* Statement Header */}
              <div className="flex justify-between items-start border-b border-slate-100 pb-5">
                <div className="space-y-1">
                  <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                    Payslip Statement
                  </span>
                  <h3 className="text-xl font-bold text-slate-800 mt-2">Adamas Consulting Corp</h3>
                  <p className="text-xs text-slate-400">Statement for: {selectedSlip.month}</p>
                </div>
                
                {/* Print button (Hidden on Print) */}
                <div className="flex gap-2 print:hidden">
                  <button
                    onClick={handlePrint}
                    className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 transition-colors"
                    title="Print Payslip"
                  >
                    <Printer className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Employee & Payout Details */}
              <div className="grid grid-cols-2 gap-6 text-sm">
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase block mb-1">Employee Details</span>
                  <p className="font-bold text-slate-800">{selectedSlip.employeeName}</p>
                  <p className="text-xs text-slate-500">ID: {selectedSlip.employeeId}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold text-slate-400 uppercase block mb-1">Transaction Status</span>
                  <p className="font-bold text-emerald-600 uppercase text-xs flex items-center justify-end gap-1.5 mt-1">
                    <CheckCircle className="h-4 w-4" /> Paid
                  </p>
                  <p className="text-xs text-slate-400 mt-1">Processed: {selectedSlip.processedDate}</p>
                </div>
              </div>

              {/* Breakdown Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                
                {/* Earnings */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase border-b border-slate-100 pb-2">Earnings</h4>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Basic Salary</span>
                    <span className="font-semibold text-slate-800">${selectedSlip.basic.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">House Rent Allowance (HRA)</span>
                    <span className="font-semibold text-slate-800">${selectedSlip.hra.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Special Allowance</span>
                    <span className="font-semibold text-slate-800">${selectedSlip.allowance.toLocaleString()}</span>
                  </div>
                </div>

                {/* Deductions */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase border-b border-slate-100 pb-2">Deductions</h4>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Provident Fund (PF)</span>
                    <span className="font-semibold text-slate-800">-${selectedSlip.pf.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Professional Tax</span>
                    <span className="font-semibold text-slate-800">-${selectedSlip.tax.toLocaleString()}</span>
                  </div>
                </div>

              </div>

              {/* Summary net payout */}
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs text-slate-400 uppercase font-bold">Net Payout Amount</span>
                  <p className="text-xs text-slate-500">Credited to employee bank account</p>
                </div>
                <div className="text-2xl md:text-3xl font-extrabold text-indigo-600">
                  ${selectedSlip.net.toLocaleString()}
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-12 text-center text-slate-400 flex flex-col items-center justify-center min-h-[300px]">
              <FileText className="h-12 w-12 text-slate-300 mb-3" />
              <p className="text-sm font-medium">Select a payslip from the history to view full statement.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
