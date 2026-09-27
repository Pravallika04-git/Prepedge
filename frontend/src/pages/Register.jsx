import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Zap, Mail, Lock, User, Eye, EyeOff, ShieldCheck } from 'lucide-react';

export default function Register() {
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { register, user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setErrors((p) => ({ ...p, [name]: undefined, form: undefined }));
  };

  const validate = () => {
    const errs = {};
    if (!form.fullName.trim()) {
      errs.fullName = 'Full name is required';
    } else if (form.fullName.trim().length < 2) {
      errs.fullName = 'Name must be at least 2 characters';
    }
    if (!form.email.trim()) {
      errs.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = 'Please enter a valid email address';
    }
    if (!form.password) {
      errs.password = 'Password is required';
    } else if (form.password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }
    if (!form.confirmPassword) {
      errs.confirmPassword = 'Please confirm your password';
    } else if (form.password !== form.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await register(form.fullName, form.email, form.password);
      toast.success('Account created! Welcome aboard 🎉');
      navigate('/dashboard');
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        (err.code === 'ERR_NETWORK' || !err.response
          ? 'Unable to connect to backend server. Please verify the backend is running.'
          : 'Registration failed. Please check your details and try again.');
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

        <h1 className="auth-title">Create account</h1>
        <p className="auth-subtitle">Start your placement preparation today</p>

        {errors.form && (
          <div className="form-field-error" style={{ marginBottom: '12px', textAlign: 'center' }}>
            {errors.form}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {/* Full Name */}
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div style={{ position: 'relative' }}>
              <User size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                id="reg-name"
                type="text"
                name="fullName"
                className={`form-input${errors.fullName ? ' input-error' : ''}`}
                style={{ paddingLeft: '38px' }}
                placeholder="John Doe"
                value={form.fullName}
                onChange={handleChange}
                required
              />
            </div>
            {errors.fullName && <span className="form-field-error">{errors.fullName}</span>}
          </div>

          {/* Email */}
          <div className="form-group">
            <label className="form-label">Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                id="reg-email"
                type="email"
                name="email"
                className={`form-input${errors.email ? ' input-error' : ''}`}
                style={{ paddingLeft: '38px' }}
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
            {errors.email && <span className="form-field-error">{errors.email}</span>}
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                id="reg-password"
                type={showPw ? 'text' : 'password'}
                name="password"
                className={`form-input${errors.password ? ' input-error' : ''}`}
                style={{ paddingLeft: '38px', paddingRight: '38px' }}
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={handleChange}
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

          {/* Confirm Password */}
          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <div style={{ position: 'relative' }}>
              <ShieldCheck size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                id="reg-confirm-password"
                type={showConfirmPw ? 'text' : 'password'}
                name="confirmPassword"
                className={`form-input${errors.confirmPassword ? ' input-error' : ''}`}
                style={{ paddingLeft: '38px', paddingRight: '38px' }}
                placeholder="Re-enter your password"
                value={form.confirmPassword}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPw(!showConfirmPw)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}
              >
                {showConfirmPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.confirmPassword && <span className="form-field-error">{errors.confirmPassword}</span>}
          </div>

          <button
            id="reg-submit"
            type="submit"
            className="btn btn-primary btn-full btn-lg"
            disabled={loading}
            style={{ marginTop: '8px' }}
          >
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="auth-divider" style={{ marginTop: '20px' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
