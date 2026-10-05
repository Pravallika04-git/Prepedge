import { useState } from 'react';
import { useToast } from '../context/ToastContext';
import api from '../api/axios';
import { Mic, ChevronRight, CheckCircle, XCircle, RotateCcw, Star, AlertCircle } from 'lucide-react';

const TOPICS = ['JavaScript', 'React', 'Java', 'Python', 'DSA', 'System Design', 'DBMS', 'OS', 'Networks', 'Machine Learning', 'SQL', 'OOPs'];
const DIFFICULTIES = ['EASY', 'MEDIUM', 'HARD'];

const STAGES = { SELECT: 'select', QUESTIONS: 'questions', EVAL: 'eval' };

export default function MockInterview() {
  const toast = useToast();
  const [stage, setStage] = useState(STAGES.SELECT);
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('MEDIUM');
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentQ, setCurrentQ] = useState(0);
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [evalLoading, setEvalLoading] = useState(false);

  const startInterview = async () => {
    if (!topic) { toast.error('Please select a topic'); return; }
    setLoading(true);
    try {
      const res = await api.post('/ai/interview/questions', { topic, difficulty });
      // Backend returns: { success, message, data: { questions: "1. Q1\n2. Q2..." } }
      const raw = res.data?.data?.questions || '';
      console.log('[MockInterview] Raw questions from backend:', raw);
      const parsed = parseQuestions(raw);
      console.log('[MockInterview] Parsed questions:', parsed);
      if (parsed.length === 0) {
        toast.error('No questions were returned. Please try again.');
        return;
      }
      setQuestions(parsed);
      setStage(STAGES.QUESTIONS);
    } catch (err) {
      console.error('[MockInterview] Failed to generate questions:', err?.response?.data || err?.message || err);
      toast.error(
        err?.response?.data?.message
          ? `Error: ${err.response.data.message}`
          : 'Failed to generate questions. Please check the backend is running.'
      );
    } finally {
      setLoading(false);
    }
  };

  const parseQuestions = (text) => {
    // Try to split by numbered patterns like "1." "Q1:" etc.
    const lines = text.split('\n').filter(l => l.trim());
    const qs = [];
    let current = '';
    for (const line of lines) {
      if (/^(Q?\d+[.):]\s|Question\s+\d+)/i.test(line)) {
        if (current) qs.push(current.trim());
        current = line.replace(/^(Q?\d+[.):]\s+|Question\s+\d+:\s*)/i, '');
      } else if (current) {
        current += ' ' + line;
      }
    }
    if (current) qs.push(current.trim());
    // Fallback: split by newlines if no numbered format
    if (qs.length === 0) return lines.filter(l => l.length > 20).slice(0, 5);
    return qs.slice(0, 5);
  };

  const submitAnswers = async () => {
    setEvalLoading(true);
    try {
      const evals = await Promise.all(
        questions.map(async (q, i) => {
          const userAns = (answers[i] || '').trim();
          const res = await api.post('/ai/interview/evaluate', {
            question: q,
            answer: userAns,
            topic,
          });
          // Backend returns: { success, message, data: { evaluation: "text" } }
          const evaluation = res.data?.data?.evaluation || 'No feedback available.';
          return { question: q, answer: userAns, evaluation };
        })
      );
      setEvaluations(evals);
      setStage(STAGES.EVAL);
    } catch (err) {
      console.error('[MockInterview] Failed to evaluate answers:', err?.response?.data || err?.message || err);
      toast.error(
        err?.response?.data?.message
          ? `Evaluation error: ${err.response.data.message}`
          : 'Failed to evaluate answers. Please check the backend is running.'
      );
    } finally {
      setEvalLoading(false);
    }
  };

  const reset = () => {
    setStage(STAGES.SELECT);
    setTopic('');
    setDifficulty('MEDIUM');
    setQuestions([]);
    setAnswers({});
    setCurrentQ(0);
    setEvaluations([]);
  };

  // ===== SELECT STAGE =====
  if (stage === STAGES.SELECT) return (
    <div className="page-container">
      <div className="page-header">
        <h1><span className="gradient-text">Mock Interview</span></h1>
        <p>Practice with AI-generated interview questions</p>
      </div>

      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <div className="card">
          <h3 style={{ marginBottom: '24px' }}>
            <Mic size={18} style={{ display: 'inline', marginRight: 8, color: 'var(--accent-primary)' }} />
            Configure Your Interview
          </h3>

          <div className="form-group mb-6">
            <label className="form-label">Select Topic</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
              {TOPICS.map(t => (
                <button
                  key={t}
                  id={`topic-${t}`}
                  className={`filter-tab${topic === t ? ' active' : ''}`}
                  onClick={() => setTopic(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group mb-6">
            <label className="form-label">Difficulty</label>
            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
              {DIFFICULTIES.map(d => (
                <button
                  key={d}
                  id={`diff-${d}`}
                  className={`filter-tab${difficulty === d ? ' active' : ''}`}
                  onClick={() => setDifficulty(d)}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div style={{ padding: '14px', background: 'var(--info-bg)', border: '1px solid rgba(56,189,248,0.3)', borderRadius: 'var(--radius-md)', marginBottom: '24px', fontSize: '0.85rem', color: 'var(--info)', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
            5 questions will be generated. Answer thoughtfully — our AI will evaluate your responses and provide detailed feedback.
          </div>

          <button
            id="start-interview"
            className="btn btn-primary btn-full btn-lg"
            onClick={startInterview}
            disabled={loading || !topic}
          >
            <Mic size={18} /> {loading ? 'Generating Questions…' : 'Start Interview'}
          </button>
        </div>
      </div>
    </div>
  );

  // ===== QUESTIONS STAGE =====
  if (stage === STAGES.QUESTIONS) return (
    <div className="page-container">
      <div className="page-header">
        <h1><span className="gradient-text">{topic} Interview</span></h1>
        <p>Answer all {questions.length} questions carefully</p>
      </div>

      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        {/* Progress */}
        <div className="progress-bar mb-6">
          <div className="progress-fill" style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }} />
        </div>

        <div className="question-card">
          <div className="question-number">Question {currentQ + 1} of {questions.length} • {topic} • {difficulty}</div>
          <div className="question-text">{questions[currentQ]}</div>

          <textarea
            id={`interview-answer-${currentQ}`}
            className="form-textarea"
            style={{ minHeight: '160px' }}
            placeholder="Type your detailed answer here. Explain your reasoning, mention examples, and cover edge cases…"
            value={answers[currentQ] || ''}
            onChange={e => setAnswers({ ...answers, [currentQ]: e.target.value })}
          />
        </div>

        {/* Navigator */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', margin: '16px 0' }}>
          {questions.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentQ(i)}
              style={{
                width: 36, height: 36, borderRadius: '8px',
                background: i === currentQ ? 'var(--accent-primary)' : answers[i] ? 'var(--success-bg)' : 'var(--bg-tertiary)',
                color: i === currentQ ? '#fff' : answers[i] ? 'var(--success)' : 'var(--text-muted)',
                border: `1px solid ${i === currentQ ? 'var(--accent-primary)' : 'var(--border)'}`,
                cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit', transition: 'all 0.15s',
              }}
            >
              {i + 1}
            </button>
          ))}
        </div>

        <div className="flex justify-between gap-3">
          {currentQ > 0 && (
            <button className="btn btn-secondary" onClick={() => setCurrentQ(c => c - 1)}>← Previous</button>
          )}
          <div style={{ flex: 1 }} />
          {currentQ < questions.length - 1 ? (
            <button className="btn btn-primary" onClick={() => setCurrentQ(c => c + 1)}>
              Next <ChevronRight size={16} />
            </button>
          ) : (
            <button
              id="submit-interview"
              className="btn btn-success"
              onClick={submitAnswers}
              disabled={evalLoading}
            >
              {evalLoading ? 'Evaluating…' : '🎯 Submit for Evaluation'}
            </button>
          )}
        </div>
      </div>
    </div>
  );

  // ===== EVALUATION STAGE =====
  return (
    <div className="page-container">
      <div className="page-header">
        <h1><span className="gradient-text">Interview Results</span></h1>
        <p>Detailed AI evaluation of your answers</p>
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {evaluations.map((ev, i) => (
          <div key={i} className="card">
            <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0 }}>
                {i + 1}
              </div>
              <div>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>{ev.question}</div>
              </div>
            </div>

            <div style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', marginBottom: '12px' }}>
              <div className="text-xs text-muted" style={{ marginBottom: '6px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Your Answer</div>
              <div className="text-sm" style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{ev.answer || '(No answer provided)'}</div>
            </div>

            <div style={{ padding: '12px', background: 'var(--accent-glow)', border: '1px solid var(--border-hover)', borderRadius: 'var(--radius-md)' }}>
              <div className="text-xs" style={{ marginBottom: '6px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--accent-primary)' }}>
                <Star size={12} style={{ display: 'inline', marginRight: 4 }} /> AI Feedback
              </div>
              <div className="text-sm" style={{ color: 'var(--text-primary)', lineHeight: 1.7, whiteSpace: 'pre-line' }}>{ev.evaluation}</div>
            </div>
          </div>
        ))}

        <button
          id="restart-interview"
          className="btn btn-primary btn-full btn-lg"
          onClick={reset}
        >
          <RotateCcw size={18} /> Start New Interview
        </button>
      </div>
    </div>
  );
}
