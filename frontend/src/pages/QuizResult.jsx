import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { CheckCircle, XCircle, Trophy, Clock, RotateCcw, Home } from 'lucide-react';

export default function QuizResult() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const result = state?.result;

  if (!result) {
    navigate('/quizzes');
    return null;
  }

  const pct = Math.round(result.percentage || 0);
  const passed = pct >= 50;

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div className="page-container">
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        {/* Score card */}
        <div className="card text-center mb-6" style={{ padding: '40px' }}>
          {/* Ring */}
          <div
            className="result-score-ring"
            style={{ '--score-pct': `${pct * 3.6}deg` }}
          >
            <div className="result-score-inner">
              <div className="result-score-value">{pct}%</div>
              <div className="result-score-label">SCORE</div>
            </div>
          </div>

          <div style={{ marginBottom: '8px' }}>
            {passed ? (
              <span className="badge badge-success" style={{ fontSize: '0.9rem', padding: '6px 16px' }}>
                <Trophy size={14} style={{ marginRight: 6 }} /> Passed!
              </span>
            ) : (
              <span className="badge badge-error" style={{ fontSize: '0.9rem', padding: '6px 16px' }}>
                Keep trying — you've got this!
              </span>
            )}
          </div>

          <h2 style={{ margin: '16px 0 6px' }}>{result.quizTitle}</h2>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', marginTop: '20px' }}>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {result.score}/{result.totalMarks}
              </div>
              <div className="text-xs text-muted">Marks Scored</div>
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {result.answers?.filter(a => a.isCorrect).length || 0}/{result.answers?.length || 0}
              </div>
              <div className="text-xs text-muted">Correct Answers</div>
            </div>
            {result.timeTakenSeconds && (
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {formatTime(result.timeTakenSeconds)}
                </div>
                <div className="text-xs text-muted">Time Taken</div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '28px' }}>
            <button className="btn btn-secondary" onClick={() => navigate('/quizzes')}>
              <Home size={16} /> All Quizzes
            </button>
            <button className="btn btn-primary" onClick={() => navigate(`/quizzes/${id}`)}>
              <RotateCcw size={16} /> Retry Quiz
            </button>
          </div>
        </div>

        {/* Answer Review */}
        {result.answers && result.answers.length > 0 && (
          <div className="card">
            <h3 style={{ marginBottom: '20px' }}>Answer Review</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {result.answers.map((ans, i) => (
                <div
                  key={i}
                  style={{
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    border: `1px solid ${ans.isCorrect ? 'rgba(16,185,129,0.3)' : 'rgba(244,63,94,0.3)'}`,
                    background: ans.isCorrect ? 'var(--success-bg)' : 'var(--error-bg)',
                  }}
                >
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                    {ans.isCorrect
                      ? <CheckCircle size={18} color="var(--success)" style={{ flexShrink: 0 }} />
                      : <XCircle    size={18} color="var(--error)"   style={{ flexShrink: 0 }} />
                    }
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                      Q{i + 1}: {ans.questionText}
                    </span>
                  </div>

                  <div style={{ paddingLeft: '28px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div className="text-sm">
                      <span className="text-muted">Your answer: </span>
                      <span style={{ color: ans.isCorrect ? 'var(--success)' : 'var(--error)', fontWeight: 600 }}>
                        {ans.selectedAnswer || '(no answer)'}
                      </span>
                    </div>
                    {!ans.isCorrect && (
                      <div className="text-sm">
                        <span className="text-muted">Correct: </span>
                        <span style={{ color: 'var(--success)', fontWeight: 600 }}>{ans.correctAnswer}</span>
                      </div>
                    )}
                    {ans.explanation && (
                      <div className="text-sm text-muted" style={{ marginTop: '6px', fontStyle: 'italic' }}>
                        💡 {ans.explanation}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
