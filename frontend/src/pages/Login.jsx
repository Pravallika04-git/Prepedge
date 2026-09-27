import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Zap, Mail, Lock, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { login, user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate(user.role === 'ADMIN' ? '/admin' : '/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const validate = () => {
    const errs = {};
    if (!email.trim()) {
      errs.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = 'Please enter a valid email address';
    }
    if (!password) {
      errs.password = 'Password is required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.fullName}!`);
      navigate(user.role === 'ADMIN' ? '/admin' : '/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Check your credentials.';
      toast.error(msg);
      setErrors({ form: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-orb auth-bg-orb-1" />
      <div className="auth-bg-orb auth-bg-orb-2" />

      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <Zap size={22} color="#fff" />
          </div>
          <span className="auth-logo-text">PrepEdge</span>
        </div>

        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Sign in to continue your placement journey</p>

        {errors.form && (
          <div className="form-field-error" style={{ marginBottom: '12px', textAlign: 'center' }}>
            {errors.form}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label">Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                id="login-email"
                type="email"
                className={`form-input${errors.email ? ' input-error' : ''}`}
                style={{ paddingLeft: '38px' }}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: undefined, form: undefined })); }}
                required
              />
            </div>
            {errors.email && <span className="form-field-error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <div className="flex items-center justify-between">
              <label className="form-label">Password</label>
              <button
                type="button"
                className="auth-forgot-link"
                onClick={() => toast.info('Password reset is not available yet. Contact your admin.')}
              >
                Forgot password?
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                id="login-password"
                type={showPw ? 'text' : 'password'}
                className={`form-input${errors.password ? ' input-error' : ''}`}
                style={{ paddingLeft: '38px', paddingRight: '38px' }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: undefined, form: undefined })); }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <span className="form-field-error">{errors.password}</span>}
          </div>

          <button
            id="login-submit"
            type="submit"
            className="btn btn-primary btn-full btn-lg"
            disabled={loading}
            style={{ marginTop: '8px' }}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="auth-divider" style={{ marginTop: '20px' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ fontWeight: 600 }}>Create one</Link>
        </p>
      </div>
    </div>
  );
}
