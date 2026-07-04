import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useHRMS } from '../../context/HRMSContext';
import { User, Mail, Shield, Briefcase, FileText, AlertCircle, ArrowRight } from 'lucide-react';

export default function Signup() {
  const { signup } = useHRMS();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Employee');
  const [department, setDepartment] = useState('Engineering');
  const [jobTitle, setJobTitle] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setTimeout(() => {
      const res = signup(name, email, 'password123', role, department, jobTitle || (role === 'Admin' ? 'HR Manager' : 'Software Engineer'));
      setLoading(false);
      if (res.success) navigate('/dashboard');
      else setError(res.message);
    }, 500);
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--odoo-bg)' }}>
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-[45%] flex-col justify-center items-center relative overflow-hidden" style={{ background: 'var(--odoo-purple)' }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-[10%] left-[15%] w-64 h-64 rounded-full border-2 border-white/30"></div>
          <div className="absolute bottom-[15%] right-[10%] w-48 h-48 rounded-full border-2 border-white/20"></div>
        </div>
        <div className="relative z-10 text-center px-12 max-w-md">
          <div className="h-20 w-20 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center mx-auto mb-8">
            <span className="text-4xl font-black text-white">A</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Join Adamas</h1>
          <p className="text-white/80 text-lg leading-relaxed">
            Create your account and start managing your HR operations with a modern, integrated platform.
          </p>
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-8">
        <div className="w-full max-w-[420px] mx-auto">

          <div className="lg:hidden text-center mb-8">
            <div className="h-14 w-14 rounded-xl flex items-center justify-center mx-auto mb-3 text-white font-black text-2xl" style={{ background: 'var(--odoo-purple)' }}>
              A
            </div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--odoo-text)' }}>Adamas HRMS</h1>
          </div>

          <div className="bg-white rounded-lg border p-8 shadow-sm" style={{ borderColor: 'var(--odoo-border)' }}>
            <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--odoo-text)' }}>Create Account</h2>
            <p className="text-sm mb-6" style={{ color: 'var(--odoo-text-muted)' }}>
              Fill in details to register a new employee profile.
            </p>

            {error && (
              <div className="mb-5 p-3 rounded border text-sm flex items-start gap-2" style={{ background: '#F8D7DA', borderColor: '#F5C6CB', color: '#721C24' }}>
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--odoo-text)' }}>Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--odoo-text-light)' }} />
                  <input type="text" required value={name} onChange={(e) => setName(e.target.value)}
                    className="o-input pl-9" placeholder="Jane Doe" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--odoo-text)' }}>Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--odoo-text-light)' }} />
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                    className="o-input pl-9" placeholder="jane@adamas.com" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--odoo-text)' }}>Role</label>
                  <select value={role} onChange={(e) => setRole(e.target.value)} className="o-input">
                    <option value="Employee">Employee</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--odoo-text)' }}>Department</label>
                  <select value={department} onChange={(e) => setDepartment(e.target.value)} className="o-input">
                    <option value="Engineering">Engineering</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Operations">Operations</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Finance">Finance</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--odoo-text)' }}>Job Title</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--odoo-text-light)' }} />
                  <input type="text" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)}
                    className="o-input pl-9" placeholder="e.g. Senior Developer" />
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="o-btn-primary w-full justify-center py-2.5 text-sm" style={{ borderRadius: '6px' }}>
                {loading ? 'Creating account…' : 'Create Account'}
                {!loading && <ArrowRight className="h-4 w-4" />}
              </button>
            </form>

            <div className="mt-5 text-center">
              <span className="text-xs" style={{ color: 'var(--odoo-text-muted)' }}>Already registered? </span>
              <Link to="/login" className="text-xs font-medium hover:underline" style={{ color: 'var(--odoo-purple)' }}>
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
