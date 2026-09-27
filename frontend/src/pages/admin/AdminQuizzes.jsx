import { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { PlusCircle, Trash2, Save, BookOpen, Plus } from 'lucide-react';

const emptyQuestion = () => ({
  questionText: '', questionType: 'MCQ',
  optionA: '', optionB: '', optionC: '', optionD: '',
  correctAnswer: '', explanation: '', marks: 1,
  codeTemplate: '', testCases: '',
});

export default function AdminQuizzes() {
  const toast = useToast();
  const { user } = useAuth();
  const [form, setForm] = useState({
    title: '', description: '', category: '', difficulty: 'MEDIUM', durationMinutes: 30,
  });
  const [questions, setQuestions] = useState([emptyQuestion()]);
  const [saving, setSaving] = useState(false);
  const [expandedQ, setExpandedQ] = useState(0);

  const handleFormChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleQChange = (i, field, val) => {
    setQuestions(qs => qs.map((q, idx) => idx === i ? { ...q, [field]: val } : q));
  };

  const addQuestion = () => {
    setQuestions(qs => [...qs, emptyQuestion()]);
    setExpandedQ(questions.length);
  };

  const removeQuestion = (i) => {
    if (questions.length === 1) { toast.error('At least one question required'); return; }
    setQuestions(qs => qs.filter((_, idx) => idx !== i));
    setExpandedQ(Math.max(0, expandedQ - 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.category) { toast.error('Title and category are required'); return; }
    if (questions.some(q => !q.questionText || !q.correctAnswer)) {
      toast.error('All questions must have text and a correct answer'); return;
    }
    setSaving(true);
    try {
      await api.post('/quizzes', { ...form, durationMinutes: parseInt(form.durationMinutes), questions });
      toast.success('Quiz created successfully!');
      setForm({ title: '', description: '', category: '', difficulty: 'MEDIUM', durationMinutes: 30 });
      setQuestions([emptyQuestion()]);
      setExpandedQ(0);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create quiz');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1><span className="gradient-text">Create Quiz</span></h1>
        <p>Design a new quiz for students</p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Quiz Info */}
        <div className="card mb-6">
          <h3 style={{ marginBottom: '20px' }}>
            <BookOpen size={18} style={{ display: 'inline', marginRight: 8, color: 'var(--accent-primary)' }} />
            Quiz Information
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Quiz Title *</label>
              <input id="quiz-title" className="form-input" name="title" value={form.title} onChange={handleFormChange} placeholder="e.g. Java Core Concepts" required />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-textarea" name="description" value={form.description} onChange={handleFormChange} placeholder="Describe what this quiz covers…" rows={2} />
            </div>

            <div className="grid-3" style={{ gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Category *</label>
                <input id="quiz-category" className="form-input" name="category" value={form.category} onChange={handleFormChange} placeholder="e.g. Java, DSA, SQL" required />
              </div>
              <div className="form-group">
                <label className="form-label">Difficulty</label>
                <select id="quiz-difficulty" className="form-select" name="difficulty" value={form.difficulty} onChange={handleFormChange}>
                  <option value="EASY">Easy</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HARD">Hard</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Duration (minutes)</label>
                <input className="form-input" type="number" name="durationMinutes" value={form.durationMinutes} onChange={handleFormChange} min={5} max={180} />
              </div>
            </div>
          </div>
        </div>

        {/* Questions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
          {questions.map((q, i) => (
            <div key={i} className="card" style={{ borderColor: expandedQ === i ? 'var(--accent-primary)' : 'var(--border)' }}>
              {/* Question header */}
              <div
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
                onClick={() => setExpandedQ(expandedQ === i ? -1 : i)}
              >
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <span style={{ width: 28, height: 28, background: 'var(--accent-gradient)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.8rem', fontWeight: 700, flexShrink: 0 }}>
                    {i + 1}
                  </span>
                  <span style={{ color: q.questionText ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: 500, fontSize: '0.9rem' }}>
                    {q.questionText || `Question ${i + 1}`}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <span className={`badge ${q.questionType === 'MCQ' ? 'badge-primary' : q.questionType === 'CODING' ? 'badge-warning' : 'badge-info'}`}>{q.questionType}</span>
                  <button type="button" className="btn btn-danger btn-sm" onClick={(e) => { e.stopPropagation(); removeQuestion(i); }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* Expanded content */}
              {expandedQ === i && (
                <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Question Text *</label>
                    <textarea className="form-textarea" value={q.questionText} onChange={e => handleQChange(i, 'questionText', e.target.value)} placeholder="Enter your question…" rows={2} />
                  </div>

                  <div className="grid-2" style={{ gap: '14px' }}>
                    <div className="form-group">
                      <label className="form-label">Type</label>
                      <select className="form-select" value={q.questionType} onChange={e => handleQChange(i, 'questionType', e.target.value)}>
                        <option value="MCQ">MCQ</option>
                        <option value="SHORT_ANSWER">Short Answer</option>
                        <option value="CODING">Coding</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Marks</label>
                      <input className="form-input" type="number" value={q.marks} onChange={e => handleQChange(i, 'marks', parseInt(e.target.value) || 1)} min={1} max={10} />
                    </div>
                  </div>

                  {q.questionType === 'MCQ' && (
                    <div className="grid-2" style={{ gap: '12px' }}>
                      {['A', 'B', 'C', 'D'].map(letter => (
                        <div key={letter} className="form-group">
                          <label className="form-label">Option {letter}</label>
                          <input className="form-input" value={q[`option${letter}`]} onChange={e => handleQChange(i, `option${letter}`, e.target.value)} placeholder={`Option ${letter}`} />
                        </div>
                      ))}
                    </div>
                  )}

                  {q.questionType === 'CODING' && (
                    <div className="form-group">
                      <label className="form-label">Code Template (optional)</label>
                      <textarea className="form-textarea" style={{ fontFamily: 'monospace' }} value={q.codeTemplate} onChange={e => handleQChange(i, 'codeTemplate', e.target.value)} placeholder="// Starter code…" rows={4} />
                    </div>
                  )}

                  <div className="form-group">
                    <label className="form-label">Correct Answer *</label>
                    {q.questionType === 'MCQ' ? (
                      <select className="form-select" value={q.correctAnswer} onChange={e => handleQChange(i, 'correctAnswer', e.target.value)}>
                        <option value="">Select correct option</option>
                        {['A', 'B', 'C', 'D'].map(l => q[`option${l}`] && (
                          <option key={l} value={q[`option${l}`]}>{l}: {q[`option${l}`]}</option>
                        ))}
                      </select>
                    ) : (
                      <input className="form-input" value={q.correctAnswer} onChange={e => handleQChange(i, 'correctAnswer', e.target.value)} placeholder="Expected answer or keyword" />
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Explanation (optional)</label>
                    <textarea className="form-textarea" value={q.explanation} onChange={e => handleQChange(i, 'explanation', e.target.value)} placeholder="Explain the correct answer…" rows={2} />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button type="button" id="add-question" className="btn btn-secondary" onClick={addQuestion}>
            <Plus size={16} /> Add Question ({questions.length})
          </button>
          <button type="submit" id="create-quiz" className="btn btn-primary" disabled={saving}>
            <Save size={16} /> {saving ? 'Creating…' : 'Create Quiz'}
          </button>
        </div>
      </form>
    </div>
  );
}
