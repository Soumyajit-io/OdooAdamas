import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useHRMS } from '../../context/HRMSContext';
import { LogIn, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';

export default function Login() {
  const { login } = useHRMS();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your Login ID or Email.');
      return;
    }
    if (!password.trim()) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);

    // Simulate network delay for UX
    await new Promise((r) => setTimeout(r, 600));

    const result = login(email.trim(), password);
    if (result.success) {
      navigate('/employees', { replace: true });
    } else {
      setError(result.message || 'Invalid credentials.');
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      {/* Animated background orbs */}
      <div className="auth-bg-orb auth-bg-orb--1" />
      <div className="auth-bg-orb auth-bg-orb--2" />
      <div className="auth-bg-orb auth-bg-orb--3" />

      <div className="auth-card odoo-scale-in">
        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <span>A</span>
          </div>
          <h1 className="auth-logo-text">Adamas HRMS</h1>
          <p className="auth-logo-sub">Human Resource Management System</p>
        </div>

        {/* Error */}
        {error && (
          <div className="auth-error odoo-fade-in">
            <AlertCircle className="auth-error-icon" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-input-group">
            <label htmlFor="login-email" className="auth-label">
              <Mail className="auth-label-icon" />
              Login ID / Email
            </label>
            <input
              id="login-email"
              type="text"
              className="auth-input"
              placeholder="e.g. OIJODO20220001 or john@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              autoFocus
            />
          </div>

          <div className="auth-input-group">
            <label htmlFor="login-password" className="auth-label">
              <Lock className="auth-label-icon" />
              Password
            </label>
            <input
              id="login-password"
              type="password"
              className="auth-input"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="auth-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="auth-btn-spinner" />
                Signing in…
              </>
            ) : (
              <>
                <LogIn size={18} />
                SIGN IN
              </>
            )}
          </button>
        </form>

        {/* Footer link */}
        <p className="auth-footer">
          Don't have an Account?{' '}
          <Link to="/signup" className="auth-link">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}