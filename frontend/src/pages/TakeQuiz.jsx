import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import api from '../api/axios';
import { Clock, ChevronLeft, ChevronRight, Send, AlertCircle } from 'lucide-react';

export default function TakeQuiz() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [current, setCurrent] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    Promise.all([
      api.get(`/quizzes/${id}`),
      api.get(`/quizzes/${id}/questions`),
    ]).then(([qRes, questRes]) => {
      setQuiz(qRes.data.data);
      setQuestions(questRes.data.data || []);
      setTimeLeft((qRes.data.data.durationMinutes || 30) * 60);
    }).catch(() => {
      toast.error('Failed to load quiz');
      navigate('/quizzes');
    }).finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!timeLeft || loading) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); handleSubmit(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [loading]);

  const handleSubmit = useCallback(async () => {
    clearInterval(timerRef.current);
    setSubmitting(true);
    try {
      const payload = {
        quizId: parseInt(id),
        answers: Object.entries(answers).map(([questionId, selectedAnswer]) => ({
          questionId: parseInt(questionId),
          selectedAnswer,
        })),
        timeTakenSeconds: (quiz?.durationMinutes || 30) * 60 - timeLeft,
      };
      const res = await api.post('/quizzes/submit', payload);
      navigate(`/quizzes/${id}/result`, { state: { result: res.data.data } });
    } catch (err) {
      toast.error('Failed to submit quiz');
      setSubmitting(false);
    }
  }, [id, answers, timeLeft, quiz]);

  if (loading) return <div className="page-container"><div className="loader"><div className="spinner" /></div></div>;

  const mins = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const secs = (timeLeft % 60).toString().padStart(2, '0');
  const timerClass = timeLeft < 60 ? 'danger' : timeLeft < 300 ? 'warning' : '';

  const q = questions[current];
  const options = q ? [
    { key: 'A', val: q.optionA },
    { key: 'B', val: q.optionB },
    { key: 'C', val: q.optionC },
    { key: 'D', val: q.optionD },
  ].filter(o => o.val) : [];

  const answered = Object.keys(answers).length;

  return (
    <div className="page-container">
      <div className="quiz-container">
        {/* Header bar */}
        <div className="quiz-header-bar">
          <div>
            <h3 style={{ margin: 0, fontSize: '1rem' }}>{quiz?.title}</h3>
            <div className="text-xs text-muted">{answered} / {questions.length} answered</div>
          </div>

          <div className={`quiz-timer ${timerClass}`}>
            <Clock size={18} />
            {mins}:{secs}
          </div>

          <button
            id="submit-quiz"
            className="btn btn-primary btn-sm"
            onClick={handleSubmit}
            disabled={submitting}
          >
            <Send size={14} /> {submitting ? 'Submitting…' : 'Submit'}
          </button>
        </div>

        {/* Progress */}
        <div className="progress-bar mb-6">
          <div className="progress-fill" style={{ width: `${((current + 1) / questions.length) * 100}%` }} />
        </div>

        {/* Question navigator */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '20px' }}>
          {questions.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              style={{
                width: 32, height: 32, borderRadius: '6px',
                background: i === current ? 'var(--accent-primary)' : answers[questions[i]?.id] ? 'var(--success-bg)' : 'var(--bg-tertiary)',
                color: i === current ? '#fff' : answers[questions[i]?.id] ? 'var(--success)' : 'var(--text-muted)',
                border: `1px solid ${i === current ? 'var(--accent-primary)' : 'var(--border)'}`,
                cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, fontFamily: 'inherit',
                transition: 'all 0.15s',
              }}
            >
              {i + 1}
            </button>
          ))}
        </div>

        {/* Question */}
        {q && (
          <div className="question-card">
            <div className="question-number">Question {current + 1} of {questions.length} • {q.marks} mark{q.marks !== 1 ? 's' : ''}</div>
            <div className="question-text">{q.questionText}</div>

            {q.questionType === 'MCQ' && (
              <div className="options-grid">
                {options.map(({ key, val }) => (
                  <button
                    key={key}
                    id={`option-${key}`}
                    className={`option-btn${answers[q.id] === val ? ' selected' : ''}`}
                    onClick={() => setAnswers({ ...answers, [q.id]: val })}
                  >
                    <span className="option-letter">{key}</span>
                    {val}
                  </button>
                ))}
              </div>
            )}

            {q.questionType === 'SHORT_ANSWER' && (
              <textarea
                id={`short-answer-${q.id}`}
                className="form-textarea"
                placeholder="Type your answer here..."
                value={answers[q.id] || ''}
                onChange={e => setAnswers({ ...answers, [q.id]: e.target.value })}
              />
            )}

            {q.questionType === 'CODING' && (
              <div>
                {q.codeTemplate && (
                  <pre style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '16px', marginBottom: '12px', fontSize: '0.85rem', color: 'var(--text-secondary)', overflow: 'auto' }}>
                    {q.codeTemplate}
                  </pre>
                )}
                <textarea
                  id={`code-answer-${q.id}`}
                  className="form-textarea"
                  style={{ fontFamily: 'monospace', minHeight: '150px' }}
                  placeholder="Write your code here..."
                  value={answers[q.id] || ''}
                  onChange={e => setAnswers({ ...answers, [q.id]: e.target.value })}
                />
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between" style={{ gap: '12px' }}>
          <button
            id="prev-question"
            className="btn btn-secondary"
            onClick={() => setCurrent(c => Math.max(0, c - 1))}
            disabled={current === 0}
          >
            <ChevronLeft size={16} /> Previous
          </button>

          {current < questions.length - 1 ? (
            <button
              id="next-question"
              className="btn btn-primary"
              onClick={() => setCurrent(c => Math.min(questions.length - 1, c + 1))}
            >
              Next <ChevronRight size={16} />
            </button>
          ) : (
            <button
              id="finish-quiz"
              className="btn btn-success"
              onClick={handleSubmit}
              disabled={submitting}
            >
              <Send size={16} /> Finish Quiz
            </button>
          )}
        </div>

        {/* Unanswered warning */}
        {answered < questions.length && (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '16px', padding: '10px 14px', background: 'var(--warning-bg)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', color: 'var(--warning)' }}>
            <AlertCircle size={16} />
            {questions.length - answered} question{questions.length - answered !== 1 ? 's' : ''} unanswered
          </div>
        )}
      </div>
    </div>
  );
}
