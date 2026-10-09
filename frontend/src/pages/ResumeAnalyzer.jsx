import { useState } from 'react';
import { useToast } from '../context/ToastContext';
import api from '../api/axios';
import { FileText, Upload, CheckCircle, AlertTriangle, TrendingUp, Star, ShieldAlert, Check, Loader2, X } from 'lucide-react';

export default function ResumeAnalyzer() {
  const toast = useToast();
  const [file, setFile] = useState(null);
  const [resumeText, setResumeText] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [error, setError] = useState(null);

  const importFileText = async (selectedFile) => {
    if (!selectedFile) return;
    setFile(selectedFile);
    setError(null);

    // If plain text or markdown, read directly in browser
    if (selectedFile.type.startsWith('text/') || selectedFile.name.endsWith('.txt') || selectedFile.name.endsWith('.md')) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target?.result || '';
        setResumeText(text);
        toast.success(`Imported text from ${selectedFile.name}`);
      };
      reader.readAsText(selectedFile);
      return;
    }

    // For PDF, DOCX, or other formats, send to server extraction endpoint
    setExtracting(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const res = await api.post('/ai/resume/extract-text', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const extracted = res.data?.data?.text;
      if (extracted && extracted.trim().length > 0) {
        setResumeText(extracted);
        toast.success(`Successfully imported text from ${selectedFile.name}!`);
      } else {
        toast.warning('File was uploaded, but no text could be extracted. Please paste your resume text below.');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not extract text from this file. Please paste your resume text below.';
      toast.error(msg);
      setError(msg);
    } finally {
      setExtracting(false);
    }
  };

  const handleFileInputChange = (e) => {
    const f = e.target.files?.[0];
    if (f) {
      importFileText(f);
    }
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer?.files?.[0];
    if (f) {
      importFileText(f);
    }
  };

  const clearFile = (e) => {
    e.stopPropagation();
    setFile(null);
    setResumeText('');
    setError(null);
  };

  const validateResumeContent = (text) => {
    if (!text || text.trim().length < 100) {
      return {
        valid: false,
        message: 'The text is too short to be a resume (minimum 100 characters required). Please enter your complete resume details.'
      };
    }

    const lower = text.toLowerCase();
    const hasEducation = /\b(education|degree|b\.?tech|b\.?e|m\.?tech|m\.?e|bca|mca|bachelor|master|university|college|school|cgpa|gpa|percentage|academics|diploma)\b/i.test(lower);
    const hasSkills = /\b(skills|technical skills|technologies|programming|languages|frameworks|tools|competencies|proficiencies|database|tech stack|libraries|developer)\b/i.test(lower);
    const hasProjects = /\b(experience|work experience|employment|internship|intern|projects|project|responsibilities|contributions|developed|implemented|designed|built)\b/i.test(lower);
    const hasContact = /\b(email|phone|mobile|contact|linkedin|github|portfolio|summary|objective|profile)\b/i.test(lower) || lower.includes('@');

    const count = (hasEducation ? 1 : 0) + (hasSkills ? 1 : 0) + (hasProjects ? 1 : 0) + (hasContact ? 1 : 0);

    if (count < 2) {
      return {
        valid: false,
        message: 'This document does not match resume criteria. A valid resume must contain at least 2 standard sections such as Education, Technical Skills, Projects, or Experience.'
      };
    }

    return { valid: true };
  };

  const analyze = async () => {
    const textToAnalyze = resumeText.trim();

    // If text is not populated but file is uploaded, upload file directly
    if (!textToAnalyze && file) {
      setLoading(true);
      setError(null);
      const formData = new FormData();
      formData.append('file', file);

      try {
        const res = await api.post('/ai/resume/analyze', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        const raw = res.data?.data?.analysis;
        let parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;

        if (!parsed || parsed.isResume === false) {
          const msg = parsed?.error || 'The uploaded file was rejected because it does not appear to be a resume.';
          toast.error(msg);
          setError(msg);
          return;
        }

        setAnalysis(parsed);
      } catch (err) {
        const errMsg = err.response?.data?.message || err.response?.data?.error || 'Failed to analyze resume. Please ensure the document contains valid resume sections (Education, Skills, Experience).';
        toast.error(errMsg);
        setError(errMsg);
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!textToAnalyze) {
      toast.error('Please upload a resume or paste your resume text.');
      return;
    }

    // Client-side rule check
    const check = validateResumeContent(textToAnalyze);
    if (!check.valid) {
      toast.error(check.message);
      setError(check.message);
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await api.post('/ai/resume/analyze', { resumeText: textToAnalyze });
      const raw = res.data?.data?.analysis;
      let parsed;
      try {
        parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
      } catch {
        parsed = null;
      }

      if (!parsed || parsed.isResume === false) {
        const msg = parsed?.error || 'The uploaded text was rejected because it does not appear to be a resume.';
        toast.error(msg);
        setError(msg);
        return;
      }

      setAnalysis(parsed);
      setError(null);
    } catch (err) {
      const errMsg = err.response?.data?.message || err.response?.data?.error || 'Failed to analyze resume. Please ensure the content contains valid resume sections (Education, Skills, Experience).';
      toast.error(errMsg);
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1><span className="gradient-text">Resume Analyzer</span></h1>
        <p>Get AI-powered feedback on your resume</p>
      </div>

      {!analysis ? (
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          {error && (
            <div style={{
              display: 'flex',
              gap: 12,
              padding: '14px 16px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 'var(--radius-md)',
              marginBottom: 20,
              color: '#f87171',
              fontSize: '0.88rem',
              alignItems: 'flex-start'
            }}>
              <ShieldAlert size={20} style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>Resume Verification Failed</div>
                <div>{error}</div>
              </div>
            </div>
          )}

          <div
            className="resume-dropzone"
            onDrop={handleDrop}
            onDragOver={e => e.preventDefault()}
            onClick={() => document.getElementById('resume-file').click()}
            style={{ position: 'relative' }}
          >
            {extracting ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                <Loader2 size={36} color="var(--accent-primary)" className="spin-animation" style={{ animation: 'spin 1s linear infinite' }} />
                <h3 style={{ color: 'var(--text-primary)', fontSize: '1.05rem', margin: 0 }}>
                  Extracting text from {file?.name}…
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                  Reading PDF content and preparing resume data
                </p>
              </div>
            ) : file ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: 'rgba(16, 185, 129, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <CheckCircle size={28} color="var(--success)" />
                </div>
                <h3 style={{ color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                  {file.name}
                  <button
                    onClick={clearFile}
                    title="Remove file"
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      padding: 2,
                      display: 'inline-flex'
                    }}
                  >
                    <X size={16} />
                  </button>
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--success)', margin: 0 }}>
                  {resumeText ? '✓ Text extracted & imported below' : 'Click to replace or upload another file'}
                </p>
              </div>
            ) : (
              <>
                <Upload size={40} color="var(--text-muted)" style={{ marginBottom: 12 }} />
                <h3 style={{ color: 'var(--text-secondary)', marginBottom: 4 }}>Drop your resume here</h3>
                <p style={{ fontSize: '0.85rem' }}>or click to browse · PDF, DOCX, TXT supported</p>
              </>
            )}
            <input id="resume-file" type="file" accept=".pdf,.doc,.docx,.txt,.md" style={{ display: 'none' }} onChange={handleFileInputChange} />
          </div>

          <div className="form-group" style={{ marginTop: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label className="form-label" style={{ margin: 0 }}>
                {file && resumeText ? 'Imported Resume Text (Review or Edit)' : 'Or paste resume text'}
              </label>
              {resumeText && (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {resumeText.length} characters
                </span>
              )}
            </div>
            <textarea
              className="form-textarea"
              rows={8}
              placeholder="Paste your full resume content here (including Education, Skills, Projects, and Experience)..."
              value={resumeText}
              onChange={e => {
                setResumeText(e.target.value);
                if (error) setError(null);
              }}
            />
          </div>

          {/* Resume Rules Checklist */}
          <div style={{
            background: 'var(--bg-glass)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '14px 16px',
            marginTop: 16
          }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
              📋 Resume Verification Rules:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 12px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Check size={14} color="var(--accent-primary)" /> Minimum 100+ characters
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Check size={14} color="var(--accent-primary)" /> Education & Degree info
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Check size={14} color="var(--accent-primary)" /> Technical & Core Skills
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Check size={14} color="var(--accent-primary)" /> Projects or Work Experience
              </div>
            </div>
          </div>

          <button
            className="btn btn-primary btn-full btn-lg"
            style={{ marginTop: 20 }}
            onClick={analyze}
            disabled={loading || extracting}
          >
            <FileText size={18} /> {loading ? 'Analyzing with Gemini…' : extracting ? 'Importing File…' : 'Analyze Resume'}
          </button>
        </div>
      ) : (
        <div>
          {/* Score cards */}
          <div className="resume-stats-grid" style={{ marginTop: 0 }}>
            <div className="card text-center">
              <div className="readiness-score-ring" style={{ '--readiness-score': `${analysis.score || 70}%`, width: 100, height: 100, margin: '0 auto 12px' }}>
                <div className="readiness-score-inner" style={{ width: 80, height: 80 }}>
                  <span style={{ fontSize: '1.5rem', fontWeight: 800 }}>{analysis.score || 70}</span>
                </div>
              </div>
              <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>Overall Score</div>
            </div>
            <div className="card text-center">
              <div className="readiness-score-ring" style={{ '--readiness-score': `${analysis.atsScore || 65}%`, width: 100, height: 100, margin: '0 auto 12px' }}>
                <div className="readiness-score-inner" style={{ width: 80, height: 80 }}>
                  <span style={{ fontSize: '1.5rem', fontWeight: 800 }}>{analysis.atsScore || 65}</span>
                </div>
              </div>
              <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>ATS Score</div>
            </div>
            <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
              <Star size={32} color="#f59e0b" style={{ marginBottom: 8 }} />
              <div style={{ fontWeight: 700, fontSize: '1.2rem' }}>{(analysis.score || 70) >= 80 ? 'Strong' : (analysis.score || 70) >= 60 ? 'Average' : 'Needs Work'}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Rating</div>
            </div>
          </div>

          {/* Details */}
          <div className="grid-2" style={{ gap: 20, marginTop: 20 }}>
            <div className="card">
              <h3 style={{ marginBottom: 16, color: 'var(--success)' }}><CheckCircle size={18} style={{ display: 'inline', marginRight: 8 }} />Strengths</h3>
              {(analysis.strengths || []).map((s, i) => (
                <div key={i} style={{ padding: '10px 14px', background: 'var(--success-bg)', borderRadius: 'var(--radius-md)', marginBottom: 8, fontSize: '0.85rem', color: 'var(--success)' }}>✅ {s}</div>
              ))}
            </div>
            <div className="card">
              <h3 style={{ marginBottom: 16, color: 'var(--warning)' }}><AlertTriangle size={18} style={{ display: 'inline', marginRight: 8 }} />Weaknesses</h3>
              {(analysis.weaknesses || []).map((w, i) => (
                <div key={i} style={{ padding: '10px 14px', background: 'var(--warning-bg)', borderRadius: 'var(--radius-md)', marginBottom: 8, fontSize: '0.85rem', color: 'var(--warning)' }}>⚠️ {w}</div>
              ))}
            </div>
          </div>

          <div className="card" style={{ marginTop: 20 }}>
            <h3 style={{ marginBottom: 16 }}><TrendingUp size={18} style={{ display: 'inline', marginRight: 8, color: 'var(--accent-primary)' }} />Improvement Suggestions</h3>
            {(analysis.suggestions || []).map((s, i) => (
              <div key={i} style={{ padding: '12px 16px', background: 'var(--bg-glass)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', marginBottom: 8, fontSize: '0.85rem', display: 'flex', gap: 10, alignItems: 'center' }}>
                <span style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>{i + 1}.</span>
                <span style={{ color: 'var(--text-secondary)' }}>{s}</span>
              </div>
            ))}
          </div>

          <button className="btn btn-secondary btn-full" style={{ marginTop: 20 }} onClick={() => { setAnalysis(null); setFile(null); setResumeText(''); setError(null); }}>
            Analyze Another Resume
          </button>
        </div>
      )}
    </div>
  );
}
