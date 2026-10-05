import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap, Mail, Lock, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [errors, setErrors]     = useState({});

  const { login, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const validate = () => {
    const errs = {};
    if (!email.trim()) {
      errs.email = 'Please enter your email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = 'Please enter a valid email';
    }
    if (!password) {
      errs.password = 'Please enter your password';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    // Demo login — no network request
    setTimeout(() => {
      login(email.trim(), password);
      setLoading(false);
      navigate('/dashboard');
    }, 600); // brief artificial delay for UX
  };

  return (
    <div className="pe-auth-page">
      {/* Background orbs */}
      <div className="pe-orb pe-orb-1" />
      <div className="pe-orb pe-orb-2" />
      <div className="pe-orb pe-orb-3" />

      <div className="pe-auth-card">
        {/* Logo */}
        <div className="pe-auth-logo">
          <div className="pe-auth-logo-icon">
            <Zap size={22} color="#fff" strokeWidth={2.5} />
          </div>
          <span className="pe-auth-logo-text">PrepEdge</span>
        </div>

        {/* Heading */}
        <h1 className="pe-auth-title">Welcome back</h1>
        <p className="pe-auth-subtitle">AI-Powered Placement Preparation Portal</p>

        {/* Form */}
        <form className="pe-auth-form" onSubmit={handleSubmit} noValidate>
          {/* Email */}
          <div className="pe-form-group">
            <label className="pe-form-label" htmlFor="login-email">Email</label>
            <div className="pe-input-wrap">
              <Mail size={16} className="pe-input-icon" />
              <input
                id="login-email"
                type="email"
                className={`pe-input${errors.email ? ' pe-input--error' : ''}`}
                placeholder="you@example.com"
                value={email}
                autoComplete="email"
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrors((p) => ({ ...p, email: undefined }));
                }}
              />
            </div>
            {errors.email && <span className="pe-field-error">{errors.email}</span>}
          </div>

          {/* Password */}
          <div className="pe-form-group">
            <div className="pe-label-row">
              <label className="pe-form-label" htmlFor="login-password">Password</label>
            </div>
            <div className="pe-input-wrap">
              <Lock size={16} className="pe-input-icon" />
              <input
                id="login-password"
                type={showPw ? 'text' : 'password'}
                className={`pe-input pe-input--pw${errors.password ? ' pe-input--error' : ''}`}
                placeholder="••••••••"
                value={password}
                autoComplete="current-password"
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrors((p) => ({ ...p, password: undefined }));
                }}
              />
              <button
                type="button"
                className="pe-pw-toggle"
                onClick={() => setShowPw(!showPw)}
                aria-label={showPw ? 'Hide password' : 'Show password'}
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <span className="pe-field-error">{errors.password}</span>}
          </div>

          {/* Submit */}
          <button
            id="login-submit"
            type="submit"
            className="pe-auth-btn"
            disabled={loading}
          >
            {loading ? (
              <span className="pe-btn-spinner" />
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Register link */}
        <p className="pe-auth-footer">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="pe-auth-link">Register</Link>
        </p>
      </div>
    </div>
  );
}
