import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../api/axios';
import { User, Save, Upload, Link, Code, Phone, BookOpen, GraduationCap, FileText } from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();
  const toast = useToast();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    api.get('/profile')
      .then(r => setProfile(r.data.data))
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => setProfile({ ...profile, [e.target.name]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put('/profile', profile);
      setProfile(res.data.data);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error('File size exceeds 10MB'); return; }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      await api.post('/profile/resume', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Resume uploaded successfully!');
    } catch (err) {
      toast.error('Failed to upload resume');
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="page-container"><div className="loader"><div className="spinner" /></div></div>;

  const initials = user?.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';

  return (
    <div className="page-container">
      <div className="page-header">
        <h1><span className="gradient-text">My Profile</span></h1>
        <p>Keep your information up to date</p>
      </div>

      <div className="grid-2" style={{ gap: '24px', alignItems: 'start' }}>
        {/* Left: Avatar + Resume */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Avatar card */}
          <div className="card text-center" style={{ padding: '32px' }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: 'var(--accent-gradient)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontSize: '2rem', fontWeight: 800, color: '#fff',
              margin: '0 auto 16px', boxShadow: '0 0 30px var(--accent-glow)'
            }}>
              {initials}
            </div>
            <h3 style={{ margin: '0 0 4px' }}>{user?.fullName}</h3>
            <p className="text-sm text-muted">{user?.email}</p>
            <span className="badge badge-primary" style={{ marginTop: '8px' }}>{user?.role}</span>
          </div>

          {/* Resume upload */}
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <FileText size={20} color="var(--accent-primary)" />
              <h3 style={{ margin: 0 }}>Resume</h3>
            </div>

            {profile?.resumePath && (
              <div style={{ padding: '10px 14px', background: 'var(--success-bg)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 'var(--radius-md)', marginBottom: '12px', fontSize: '0.85rem', color: 'var(--success)' }}>
                ✅ Resume uploaded
              </div>
            )}

            <label
              htmlFor="resume-upload"
              className="btn btn-secondary btn-full"
              style={{ cursor: 'pointer', justifyContent: 'center' }}
            >
              <Upload size={16} /> {uploading ? 'Uploading…' : 'Upload Resume (PDF)'}
            </label>
            <input
              id="resume-upload"
              type="file"
              accept=".pdf,.doc,.docx"
              style={{ display: 'none' }}
              onChange={handleResumeUpload}
              disabled={uploading}
            />
            <p className="text-xs text-muted" style={{ marginTop: '8px', textAlign: 'center' }}>Max 10MB · PDF, DOC, DOCX</p>
          </div>
        </div>

        {/* Right: Profile form */}
        <div className="card">
          <h3 style={{ marginBottom: '24px' }}>
            <User size={18} style={{ display: 'inline', marginRight: 8, color: 'var(--accent-primary)' }} />
            Personal Information
          </h3>

          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="grid-2" style={{ gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" name="fullName" value={profile?.fullName || ''} onChange={handleChange} placeholder="John Doe" />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input className="form-input" name="phone" style={{ paddingLeft: '32px' }} value={profile?.phone || ''} onChange={handleChange} placeholder="+91 00000 00000" />
                </div>
              </div>
            </div>

            <div className="grid-2" style={{ gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">College</label>
                <div style={{ position: 'relative' }}>
                  <GraduationCap size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input className="form-input" name="college" style={{ paddingLeft: '32px' }} value={profile?.college || ''} onChange={handleChange} placeholder="Your College" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Branch</label>
                <input className="form-input" name="branch" value={profile?.branch || ''} onChange={handleChange} placeholder="Computer Science" />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Graduation Year</label>
              <input className="form-input" type="number" name="graduationYear" value={profile?.graduationYear || ''} onChange={handleChange} placeholder="2025" min="2020" max="2030" />
            </div>

            <div className="form-group">
              <label className="form-label">Skills (comma-separated)</label>
              <div style={{ position: 'relative' }}>
                <BookOpen size={14} style={{ position: 'absolute', left: 10, top: 13, color: 'var(--text-muted)' }} />
                <input className="form-input" name="skills" style={{ paddingLeft: '32px' }} value={profile?.skills || ''} onChange={handleChange} placeholder="Java, Python, React, SQL…" />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Bio</label>
              <textarea className="form-textarea" name="bio" value={profile?.bio || ''} onChange={handleChange} placeholder="Tell us about yourself…" rows={3} />
            </div>

            <div className="form-group">
              <label className="form-label">LinkedIn URL</label>
              <div style={{ position: 'relative' }}>
                <Link size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input className="form-input" name="linkedinUrl" style={{ paddingLeft: '32px' }} value={profile?.linkedinUrl || ''} onChange={handleChange} placeholder="https://linkedin.com/in/..." />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">GitHub URL</label>
              <div style={{ position: 'relative' }}>
                <Code size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input className="form-input" name="githubUrl" style={{ paddingLeft: '32px' }} value={profile?.githubUrl || ''} onChange={handleChange} placeholder="https://github.com/..." />
              </div>
            </div>

            <button
              id="save-profile"
              type="submit"
              className="btn btn-primary btn-full"
              disabled={saving}
              style={{ marginTop: '8px' }}
            >
              <Save size={16} /> {saving ? 'Saving…' : 'Save Profile'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
