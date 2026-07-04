import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useHRMS } from '../../context/HRMSContext';
import { Lock, Mail, AlertCircle, ArrowRight, User } from 'lucide-react';

export default function Login() {
  const { login } = useHRMS();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setTimeout(() => {
      const res = login(email, password);
      setLoading(false);
      if (res.success) {
        navigate('/dashboard');
      } else {
        setError(res.message);
      }
    }, 500);
  };

  const handleQuickLogin = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('password123');
    setError('');
    setLoading(true);
    setTimeout(() => {
      const res = login(demoEmail, 'password123');
      setLoading(false);
      if (res.success) navigate('/dashboard');
      else setError(res.message);
    }, 300);
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--odoo-bg)' }}>
      {/* Left: Purple branding panel */}
      <div className="hidden lg:flex lg:w-[45%] flex-col justify-center items-center relative overflow-hidden" style={{ background: 'var(--odoo-purple)' }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-[10%] left-[15%] w-64 h-64 rounded-full border-2 border-white/30"></div>
          <div className="absolute bottom-[15%] right-[10%] w-48 h-48 rounded-full border-2 border-white/20"></div>
          <div className="absolute top-[50%] left-[60%] w-32 h-32 rounded-full border border-white/20"></div>
        </div>
        <div className="relative z-10 text-center px-12 max-w-md">
          <div className="h-20 w-20 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center mx-auto mb-8">
            <span className="text-4xl font-black text-white">A</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Adamas HRMS</h1>
          <p className="text-white/80 text-lg leading-relaxed">
            The all-in-one Human Resource Management System. Manage your workforce, streamline processes, and empower your team.
          </p>
          <div className="mt-10 flex items-center justify-center gap-6 text-white/60 text-sm">
            <span>✓ Attendance</span>
            <span>✓ Payroll</span>
            <span>✓ Time Off</span>
          </div>
        </div>
      </div>

      {/* Right: Login form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-8">
        <div className="w-full max-w-[400px] mx-auto">

          {/* Mobile brand */}
          <div className="lg:hidden text-center mb-8">
            <div className="h-14 w-14 rounded-xl flex items-center justify-center mx-auto mb-3 text-white font-black text-2xl" style={{ background: 'var(--odoo-purple)' }}>
              A
            </div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--odoo-text)' }}>Adamas HRMS</h1>
          </div>

          <div className="bg-white rounded-lg border p-8 shadow-sm" style={{ borderColor: 'var(--odoo-border)' }}>
            <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--odoo-text)' }}>Sign In</h2>
            <p className="text-sm mb-6" style={{ color: 'var(--odoo-text-muted)' }}>
              Enter your credentials to access the dashboard.
            </p>

            {error && (
              <div className="mb-5 p-3 rounded border text-sm flex items-start gap-2" style={{ background: '#F8D7DA', borderColor: '#F5C6CB', color: '#721C24' }}>
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1.5" style={{ color: 'var(--odoo-text)' }}>
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--odoo-text-light)' }} />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="o-input pl-9"
                    placeholder="name@adamas.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-1.5" style={{ color: 'var(--odoo-text)' }}>
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--odoo-text-light)' }} />
                  <input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="o-input pl-9"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="o-btn-primary w-full justify-center py-2.5 text-sm"
                style={{ borderRadius: '6px' }}
              >
                {loading ? 'Signing in…' : 'Sign In'}
                {!loading && <ArrowRight className="h-4 w-4" />}
              </button>
            </form>

            <div className="mt-5 text-center">
              <span className="text-xs" style={{ color: 'var(--odoo-text-muted)' }}>Don't have an account? </span>
              <Link to="/signup" className="text-xs font-medium hover:underline" style={{ color: 'var(--odoo-purple)' }}>
                Create one
              </Link>
            </div>
          </div>

          {/* Quick-access demo cards */}
          <div className="mt-6">
            <p className="text-xs font-medium text-center mb-3" style={{ color: 'var(--odoo-text-muted)' }}>
              QUICK DEMO ACCESS
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleQuickLogin('john@adamas.com')}
                className="bg-white border rounded-lg p-3 text-center hover:shadow transition-shadow cursor-pointer"
                style={{ borderColor: 'var(--odoo-border)' }}
              >
                <div className="h-9 w-9 rounded-full mx-auto mb-2 flex items-center justify-center text-white text-xs font-bold" style={{ background: 'var(--odoo-teal)' }}>
                  <User className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium block" style={{ color: 'var(--odoo-text)' }}>Employee</span>
                <span className="text-[11px]" style={{ color: 'var(--odoo-text-muted)' }}>John Doe</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('bob@adamas.com')}
                className="bg-white border rounded-lg p-3 text-center hover:shadow transition-shadow cursor-pointer"
                style={{ borderColor: 'var(--odoo-border)' }}
              >
                <div className="h-9 w-9 rounded-full mx-auto mb-2 flex items-center justify-center text-white text-xs font-bold" style={{ background: 'var(--odoo-purple)' }}>
                  <User className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium block" style={{ color: 'var(--odoo-text)' }}>Admin</span>
                <span className="text-[11px]" style={{ color: 'var(--odoo-text-muted)' }}>Bob Johnson</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
