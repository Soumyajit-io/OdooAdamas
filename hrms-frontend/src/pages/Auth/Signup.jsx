import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useHRMS } from '../../context/HRMSContext';
import {
  UserPlus, Building2, User, Mail, Phone, Lock,
  Eye, EyeOff, Upload, AlertCircle, Loader2,
  CheckCircle2, Copy, X,
} from 'lucide-react';

export default function Signup() {
  const { signup } = useHRMS();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Form state
  const [companyName, setCompanyName] = useState('');
  const [companyLogo, setCompanyLogo] = useState(null); // base64 data URL
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successModal, setSuccessModal] = useState(null); // { loginId, tempPassword }
  const [copied, setCopied] = useState('');

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (PNG, JPG, SVG).');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('Logo must be under 2MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setCompanyLogo(reader.result);
    reader.readAsDataURL(file);
    setError('');
  };

  const validate = () => {
    if (!companyName.trim()) return 'Company name is required.';
    if (!firstName.trim()) return 'First name is required.';
    if (!lastName.trim()) return 'Last name is required.';
    if (!email.trim()) return 'Email is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Enter a valid email address.';
    if (!phone.trim()) return 'Phone number is required.';
    if (password.length < 6) return 'Password must be at least 6 characters.';
    if (password !== confirmPassword) return 'Passwords do not match.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));

    const result = signup(
      firstName.trim(),
      lastName.trim(),
      email.trim(),
      password,
      'ADMIN',
      'Management',
      'Company Administrator',
      companyName.trim(),
      companyLogo,
      phone.trim()
    );

    if (result.success) {
      setSuccessModal({
        loginId: result.loginId || email.trim(),
        tempPassword: result.tempPassword || password,
      });
    } else {
      setError(result.message || 'Sign up failed.');
    }
    setLoading(false);
  };

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(field);
      setTimeout(() => setCopied(''), 2000);
    });
  };

  const handleSuccessClose = () => {
    setSuccessModal(null);
    navigate('/login', { replace: true });
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-orb auth-bg-orb--1" />
      <div className="auth-bg-orb auth-bg-orb--2" />
      <div className="auth-bg-orb auth-bg-orb--3" />

      <div className="auth-card auth-card--wide odoo-scale-in">
        {/* Logo + Upload */}
        <div className="auth-logo">
          <div
            className="auth-logo-icon auth-logo-icon--upload"
            onClick={() => fileInputRef.current?.click()}
            title="Upload company logo"
          >
            {companyLogo ? (
              <img src={companyLogo} alt="Company Logo" className="auth-logo-preview" />
            ) : (
              <span>A</span>
            )}
            <div className="auth-logo-overlay">
              <Upload size={16} />
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
            style={{ display: 'none' }}
          />
          <h1 className="auth-logo-text">Create Your Account</h1>
          <p className="auth-logo-sub">Company & Admin Onboarding</p>
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
          {/* Company Name */}
          <div className="auth-input-group">
            <label htmlFor="signup-company" className="auth-label">
              <Building2 className="auth-label-icon" />
              Company Name
            </label>
            <input
              id="signup-company"
              type="text"
              className="auth-input"
              placeholder="e.g. Odoo India"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              autoFocus
            />
          </div>

          {/* Name Row */}
          <div className="auth-row">
            <div className="auth-input-group">
              <label htmlFor="signup-first" className="auth-label">
                <User className="auth-label-icon" />
                First Name
              </label>
              <input
                id="signup-first"
                type="text"
                className="auth-input"
                placeholder="John"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div className="auth-input-group">
              <label htmlFor="signup-last" className="auth-label">
                <User className="auth-label-icon" />
                Last Name
              </label>
              <input
                id="signup-last"
                type="text"
                className="auth-input"
                placeholder="Doe"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>

          {/* Email + Phone Row */}
          <div className="auth-row">
            <div className="auth-input-group">
              <label htmlFor="signup-email" className="auth-label">
                <Mail className="auth-label-icon" />
                Email
              </label>
              <input
                id="signup-email"
                type="email"
                className="auth-input"
                placeholder="admin@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="auth-input-group">
              <label htmlFor="signup-phone" className="auth-label">
                <Phone className="auth-label-icon" />
                Phone
              </label>
              <input
                id="signup-phone"
                type="tel"
                className="auth-input"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          {/* Password */}
          <div className="auth-input-group">
            <label htmlFor="signup-password" className="auth-label">
              <Lock className="auth-label-icon" />
              Password
            </label>
            <div className="auth-input-wrap">
              <input
                id="signup-password"
                type={showPassword ? 'text' : 'password'}
                className="auth-input auth-input--has-toggle"
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="auth-toggle-pw"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="auth-input-group">
            <label htmlFor="signup-confirm" className="auth-label">
              <Lock className="auth-label-icon" />
              Confirm Password
            </label>
            <div className="auth-input-wrap">
              <input
                id="signup-confirm"
                type={showConfirm ? 'text' : 'password'}
                className="auth-input auth-input--has-toggle"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="auth-toggle-pw"
                onClick={() => setShowConfirm(!showConfirm)}
                tabIndex={-1}
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="auth-btn-spinner" />
                Creating account…
              </>
            ) : (
              <>
                <UserPlus size={18} />
                Sign Up
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="auth-footer">
          Already have an account?{' '}
          <Link to="/login" className="auth-link">
            Sign In
          </Link>
        </p>
      </div>

      {/* Success Modal — Shows Generated Credentials */}
      {successModal && (
        <div className="auth-modal-backdrop" onClick={handleSuccessClose}>
          <div
            className="auth-modal odoo-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="auth-modal-close" onClick={handleSuccessClose}>
              <X size={20} />
            </button>

            <div className="auth-modal-icon">
              <CheckCircle2 size={48} />
            </div>

            <h2 className="auth-modal-title">Account Created!</h2>
            <p className="auth-modal-desc">
              Your company account has been set up successfully. Here are your admin credentials:
            </p>

            <div className="auth-credential-box">
              <div className="auth-credential-row">
                <span className="auth-credential-label">Login ID</span>
                <div className="auth-credential-value-wrap">
                  <code className="auth-credential-value">{successModal.loginId}</code>
                  <button
                    className="auth-credential-copy"
                    onClick={() => handleCopy(successModal.loginId, 'loginId')}
                    title="Copy Login ID"
                  >
                    {copied === 'loginId' ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
              <div className="auth-credential-row">
                <span className="auth-credential-label">Temp Password</span>
                <div className="auth-credential-value-wrap">
                  <code className="auth-credential-value">{successModal.tempPassword}</code>
                  <button
                    className="auth-credential-copy"
                    onClick={() => handleCopy(successModal.tempPassword, 'password')}
                    title="Copy Password"
                  >
                    {copied === 'password' ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
            </div>

            <p className="auth-modal-note">
              Please save these credentials. You'll use them to sign in.
            </p>

            <button className="auth-btn" onClick={handleSuccessClose}>
              Go to Sign In
            </button>
          </div>
        </div>
      )}
    </div>
  );
}