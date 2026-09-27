import { useState, useEffect } from 'react';
import { 
  Code, Play, Send, ChevronRight, CheckCircle, Search, Filter, 
  Sparkles, Award, Clock, ArrowLeft, RefreshCw, Terminal, Check, 
  SlidersHorizontal, Lightbulb, Flame, FileCode
} from 'lucide-react';
import { getLocalData, setLocalData, MOCK_PROBLEMS } from '../api/mockData';
import { useToast } from '../context/ToastContext';

const EXTENDED_PROBLEMS = [
  ...MOCK_PROBLEMS,
  {
    id: 6,
    title: "Longest Substring Without Repeating Characters",
    difficulty: "MEDIUM",
    category: "DSA",
    acceptance: "78%",
    estimatedTime: "25 mins",
    description: "Given a string `s`, find the length of the longest substring without duplicate characters.",
    constraints: "0 <= s.length <= 5 * 10^4\n`s` consists of English letters, digits, symbols and spaces.",
    template: `function lengthOfLongestSubstring(s) {\n    // Write your code here\n    let maxLen = 0;\n    let start = 0;\n    const map = new Map();\n    \n    for (let i = 0; i < s.length; i++) {\n        if (map.has(s[i]) && map.get(s[i]) >= start) {\n            start = map.get(s[i]) + 1;\n        }\n        map.set(s[i], i);\n        maxLen = Math.max(maxLen, i - start + 1);\n    }\n    return maxLen;\n}`,
    testCases: [
      { input: `"abcabcbb"`, expected: "3" },
      { input: `"bbbbb"`, expected: "1" },
      { input: `"pwwkew"`, expected: "3" }
    ],
    solved: false
  },
  {
    id: 7,
    title: "Merge Two Sorted Lists",
    difficulty: "EASY",
    category: "DSA",
    acceptance: "89%",
    estimatedTime: "15 mins",
    description: "Merge two sorted linked lists and return it as a new sorted list. The new list should be made by splicing together the nodes of the first two lists.",
    constraints: "The number of nodes in both lists is in the range [0, 50].\n-100 <= Node.val <= 100",
    template: `function mergeTwoLists(list1, list2) {\n    // Write your code here\n    \n}`,
    testCases: [
      { input: `[1,2,4], [1,3,4]`, expected: "[1,1,2,3,4,4]" },
      { input: `[], []`, expected: "[]" }
    ],
    solved: false
  },
  {
    id: 8,
    title: "Coin Change (Min Coins)",
    difficulty: "HARD",
    category: "Dynamic Programming",
    acceptance: "54%",
    estimatedTime: "35 mins",
    description: "You are given an integer array `coins` representing coins of different denominations and an integer `amount` representing a total amount of money. Return the fewest number of coins that you need to make up that amount.",
    constraints: "1 <= coins.length <= 12\n1 <= coins[i] <= 2^31 - 1\n0 <= amount <= 10^4",
    template: `function coinChange(coins, amount) {\n    // Write dynamic programming solution\n    \n}`,
    testCases: [
      { input: `coins = [1,2,5], amount = 11`, expected: "3" },
      { input: `coins = [2], amount = 3`, expected: "-1" }
    ],
    solved: false
  },
  {
    id: 9,
    title: "Employee Highest Salary Department",
    difficulty: "MEDIUM",
    category: "SQL",
    acceptance: "66%",
    estimatedTime: "20 mins",
    description: "Write a SQL query to find employees who have the highest salary in each of the departments.",
    constraints: "Employee table: (id, name, salary, departmentId)\nDepartment table: (id, name)",
    template: `SELECT d.name AS Department, e.name AS Employee, e.salary AS Salary\nFROM Employee e\nJOIN Department d ON e.departmentId = d.id\nWHERE (e.departmentId, e.salary) IN (\n    SELECT departmentId, MAX(salary)\n    FROM Employee\n    GROUP BY departmentId\n);`,
    testCases: [
      { input: `Employee & Department records`, expected: "Highest salary row per department" }
    ],
    solved: false
  },
  {
    id: 10,
    title: "Design a Distributed Rate Limiter",
    difficulty: "HARD",
    category: "System Design",
    acceptance: "48%",
    estimatedTime: "40 mins",
    description: "Design an API Rate Limiter using Token Bucket or Sliding Window algorithm capable of handling 50k requests per second across multiple server instances.",
    constraints: "Low latency (< 5ms overhead), distributed storage (Redis cluster), burst resilience.",
    template: `class TokenBucketRateLimiter {\n    constructor(capacity, refillRatePerSec) {\n        this.capacity = capacity;\n        this.refillRate = refillRatePerSec;\n        this.tokens = capacity;\n        this.lastRefill = Date.now();\n    }\n    \n    allowRequest(tokensRequired = 1) {\n        // Implement token bucket logic\n        return true;\n    }\n}`,
    testCases: [
      { input: `100 requests in 1 sec with bucket 50`, expected: "First 50 allowed, rest rate-limited (429)" }
    ],
    solved: false
  }
];

const CATEGORIES = ['All', 'DSA', 'Dynamic Programming', 'SQL', 'System Design'];
const DIFFICULTIES = ['All', 'EASY', 'MEDIUM', 'HARD'];
const diffBadge = { EASY: 'badge-success', MEDIUM: 'badge-warning', HARD: 'badge-error' };

export default function Coding() {
  const toast = useToast();
  const [problems, setProblems] = useState(() => {
    const saved = getLocalData('problems', null);
    if (!saved || saved.length < EXTENDED_PROBLEMS.length) {
      // Merge saved solved status with extended list
      const savedMap = (saved || []).reduce((acc, p) => ({ ...acc, [p.id]: p.solved }), {});
      const merged = EXTENDED_PROBLEMS.map(p => ({
        ...p,
        solved: savedMap[p.id] ?? p.solved
      }));
      setLocalData('problems', merged);
      return merged;
    }
    return saved;
  });

  const [selected, setSelected] = useState(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [category, setCategory] = useState('All');
  const [difficulty, setDifficulty] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('description');

  // Stats calculation
  const total = problems.length;
  const solvedCount = problems.filter(p => p.solved).length;
  const easySolved = problems.filter(p => p.difficulty === 'EASY' && p.solved).length;
  const easyTotal = problems.filter(p => p.difficulty === 'EASY').length;
  const medSolved = problems.filter(p => p.difficulty === 'MEDIUM' && p.solved).length;
  const medTotal = problems.filter(p => p.difficulty === 'MEDIUM').length;
  const hardSolved = problems.filter(p => p.difficulty === 'HARD' && p.solved).length;
  const hardTotal = problems.filter(p => p.difficulty === 'HARD').length;
  const solvedPct = total > 0 ? Math.round((solvedCount / total) * 100) : 0;

  let filtered = problems;
  if (category !== 'All') filtered = filtered.filter(p => p.category === category);
  if (difficulty !== 'All') filtered = filtered.filter(p => p.difficulty === difficulty);
  if (statusFilter === 'Solved') filtered = filtered.filter(p => p.solved);
  if (statusFilter === 'Unsolved') filtered = filtered.filter(p => !p.solved);
  if (search.trim()) {
    const q = search.toLowerCase();
    filtered = filtered.filter(p => p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
  }

  const selectProblem = (p) => {
    setSelected(p);
    setCode(p.template || `// Write your solution for ${p.title} here\n`);
    setOutput('');
    setActiveTab('description');
  };

  const runCode = () => {
    setIsRunning(true);
    setOutput('▶ Compiling and running tests against sample cases...\n');
    setTimeout(() => {
      setIsRunning(false);
      const testResults = (selected.testCases || []).map((tc, i) => 
        `Test Case #${i + 1}:\n  Input:    ${tc.input}\n  Expected: ${tc.expected}\n  Result:   ${tc.expected} ✓ (Match)\n  Runtime:  ${Math.floor(Math.random() * 25 + 12)}ms`
      ).join('\n\n');

      setOutput(`[PASSED] All sample test cases succeeded!\n\n${testResults}\n\nMemory: 41.2 MB | CPU: 0.04s\nClick 'Submit' to run against full placement test suites.`);
      toast.success('Sample test cases passed!');
    }, 700);
  };

  const submitCode = () => {
    setIsSubmitting(true);
    setOutput('▶ Evaluating submission against 48 hidden test cases...\n');
    setTimeout(() => {
      setIsSubmitting(false);
      const updated = problems.map(p => p.id === selected.id ? { ...p, solved: true } : p);
      setProblems(updated);
      setLocalData('problems', updated);
      setSelected(prev => ({ ...prev, solved: true }));
      
      // Update XP in achievements
      const streak = getLocalData('streak', { count: 3 });
      setLocalData('streak', { ...streak, count: (streak.count || 3) + 1 });

      setOutput(`🎉 ACCEPTED!\n\nStatus: 48/48 Test Cases Passed\nRuntime: 34ms (Faster than 89.4% of submissions)\nMemory Usage: 42.1 MB (Better than 91.2%)\nXP Awarded: +75 XP earned towards your rank!`);
      toast.success(`Problem solved! +75 XP earned.`);
    }, 900);
  };

  const resetCode = () => {
    if (selected) {
      setCode(selected.template || '');
      setOutput('');
      toast.info('Editor reset to initial template.');
    }
  };

  // Problem list view
  if (!selected) {
    return (
      <div className="page-container">
        {/* Header */}
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1><span className="gradient-text">Coding Practice</span></h1>
            <p>Master Data Structures, Algorithms, SQL, and System Design for top technical interviews</p>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <span className="badge badge-primary" style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
              <Flame size={14} color="#f59e0b" style={{ marginRight: 6 }} />
              Active Streak: 4 Days
            </span>
          </div>
        </div>

        {/* Progress & Stats Cards */}
        <div className="grid-4 mb-6" style={{ gap: 16 }}>
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '18px 20px' }}>
            <div style={{
              width: 52, height: 52, borderRadius: '50%',
              background: 'var(--accent-glow)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '2px solid var(--accent-primary)', flexShrink: 0
            }}>
              <Award size={24} color="var(--accent-primary)" />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Total Solved</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {solvedCount} <span style={{ fontSize: '0.95rem', color: 'var(--text-muted)', fontWeight: 500 }}>/ {total}</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--success)' }}>{solvedPct}% Completed</div>
            </div>
          </div>

          <div className="card" style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--success)', fontWeight: 600 }}>Easy</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{easySolved} / {easyTotal}</span>
            </div>
            <div style={{ height: 6, background: 'var(--bg-tertiary)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ width: `${easyTotal ? (easySolved / easyTotal) * 100 : 0}%`, height: '100%', background: 'var(--success)', borderRadius: 3 }} />
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 8 }}>Foundational algorithms</div>
          </div>

          <div className="card" style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--warning)', fontWeight: 600 }}>Medium</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{medSolved} / {medTotal}</span>
            </div>
            <div style={{ height: 6, background: 'var(--bg-tertiary)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ width: `${medTotal ? (medSolved / medTotal) * 100 : 0}%`, height: '100%', background: 'var(--warning)', borderRadius: 3 }} />
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 8 }}>Core interview level</div>
          </div>

          <div className="card" style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--error)', fontWeight: 600 }}>Hard</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{hardSolved} / {hardTotal}</span>
            </div>
            <div style={{ height: 6, background: 'var(--bg-tertiary)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ width: `${hardTotal ? (hardSolved / hardTotal) * 100 : 0}%`, height: '100%', background: 'var(--error)', borderRadius: 3 }} />
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 8 }}>Tier-1 company standard</div>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="card mb-6" style={{ padding: 18 }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
              <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                id="coding-search-input"
                className="form-input"
                style={{ paddingLeft: 38 }}
                placeholder="Search coding problems or topics..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <select
                id="coding-difficulty-filter"
                className="form-select"
                style={{ width: 'auto', minWidth: 130 }}
                value={difficulty}
                onChange={e => setDifficulty(e.target.value)}
              >
                <option value="All">All Difficulties</option>
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>

              <select
                id="coding-status-filter"
                className="form-select"
                style={{ width: 'auto', minWidth: 130 }}
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
              >
                <option value="All">All Status</option>
                <option value="Solved">Solved Only</option>
                <option value="Unsolved">Unsolved Only</option>
              </select>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="filter-tabs" style={{ marginBottom: 0 }}>
            {CATEGORIES.map(c => (
              <button
                key={c}
                id={`cat-btn-${c.toLowerCase().replace(/\s+/g, '-')}`}
                className={`filter-tab${category === c ? ' active' : ''}`}
                onClick={() => setCategory(c)}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Problem List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.length === 0 ? (
            <div className="empty-state">
              <Code size={48} />
              <h3>No problems match your filter</h3>
              <p>Try clearing filters or search queries</p>
              <button className="btn btn-secondary btn-sm" style={{ marginTop: 12 }} onClick={() => { setCategory('All'); setDifficulty('All'); setStatusFilter('All'); setSearch(''); }}>
                Reset Filters
              </button>
            </div>
          ) : (
            filtered.map((p, idx) => (
              <div
                key={p.id}
                id={`problem-card-${p.id}`}
                className="card card-hover"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  padding: '16px 20px',
                  borderLeft: p.solved ? '4px solid var(--success)' : '4px solid transparent',
                  transition: 'var(--transition)'
                }}
              >
                {/* Status Icon */}
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: p.solved ? 'var(--success-bg)' : 'var(--bg-tertiary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {p.solved ? (
                    <CheckCircle size={20} color="var(--success)" />
                  ) : (
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                      #{idx + 1}
                    </span>
                  )}
                </div>

                {/* Problem Info */}
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                      {p.title}
                    </h3>
                    {p.solved && (
                      <span className="badge badge-success" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>
                        Solved
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <span>{p.category}</span>
                    <span>•</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={12} /> {p.estimatedTime || '20 mins'}
                    </span>
                    {p.acceptance && (
                      <>
                        <span>•</span>
                        <span>Acceptance: {p.acceptance}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Difficulty */}
                <span className={`badge ${diffBadge[p.difficulty]}`} style={{ padding: '6px 12px' }}>
                  {p.difficulty}
                </span>

                {/* Start Button */}
                <button
                  id={`btn-start-${p.id}`}
                  className={`btn ${p.solved ? 'btn-secondary' : 'btn-primary'} btn-sm`}
                  style={{ display: 'inline-flex', gap: 6, minWidth: 105, justifyContent: 'center' }}
                  onClick={() => selectProblem(p)}
                >
                  {p.solved ? (
                    <>Review <ChevronRight size={14} /></>
                  ) : (
                    <>Start <Play size={12} fill="currentColor" /></>
                  )}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  // Interactive Problem Editor View
  return (
    <div className="page-container" style={{ maxWidth: '100%', padding: '0 24px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            id="coding-back-btn"
            className="btn btn-ghost btn-sm"
            style={{ display: 'inline-flex', gap: 6 }}
            onClick={() => setSelected(null)}
          >
            <ArrowLeft size={16} /> All Problems
          </button>
          <div style={{ height: 20, width: 1, background: 'var(--border)' }} />
          <h2 style={{ margin: 0, fontSize: '1.25rem' }}>{selected.title}</h2>
          <span className={`badge ${diffBadge[selected.difficulty]}`}>{selected.difficulty}</span>
          <span className="badge badge-primary">{selected.category}</span>
          {selected.solved && <span className="badge badge-success">✓ Solved</span>}
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <select
            className="form-select"
            style={{ width: 'auto', padding: '6px 12px', fontSize: '0.85rem' }}
            value={language}
            onChange={e => setLanguage(e.target.value)}
          >
            <option value="javascript">JavaScript (ES6)</option>
            <option value="python">Python 3</option>
            <option value="java">Java 17</option>
            <option value="cpp">C++ 20</option>
          </select>
          <button className="btn btn-ghost btn-sm" title="Reset Code" onClick={resetCode}>
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Workspace Grid */}
      <div className="coding-layout" style={{ display: 'grid', gridTemplateColumns: 'minmax(350px, 1fr) minmax(450px, 1.3fr)', gap: 16, minHeight: 'calc(100vh - 180px)' }}>
        {/* Left Pane: Problem Description & Test Cases */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', padding: 0 }}>
          {/* Subtabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', background: 'var(--bg-glass)', padding: '8px 16px', gap: 8 }}>
            <button
              className={`btn btn-sm ${activeTab === 'description' ? 'btn-secondary' : 'btn-ghost'}`}
              onClick={() => setActiveTab('description')}
              style={{ fontSize: '0.8rem', padding: '6px 12px' }}
            >
              <FileCode size={14} /> Description
            </button>
            <button
              className={`btn btn-sm ${activeTab === 'hints' ? 'btn-secondary' : 'btn-ghost'}`}
              onClick={() => setActiveTab('hints')}
              style={{ fontSize: '0.8rem', padding: '6px 12px' }}
            >
              <Lightbulb size={14} /> Interview Hints
            </button>
          </div>

          <div style={{ padding: 20, overflowY: 'auto', flex: 1 }}>
            {activeTab === 'description' ? (
              <>
                <h3 style={{ fontSize: '1.1rem', marginBottom: 12 }}>Problem Statement</h3>
                <p style={{ lineHeight: 1.7, marginBottom: 20, whiteSpace: 'pre-wrap', color: 'var(--text-secondary)' }}>
                  {selected.description}
                </p>

                <h4 style={{ fontSize: '0.9rem', marginBottom: 8, color: 'var(--text-primary)' }}>Constraints:</h4>
                <pre style={{
                  fontSize: '0.85rem',
                  color: 'var(--text-secondary)',
                  whiteSpace: 'pre-wrap',
                  background: 'var(--bg-primary)',
                  padding: 14,
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  marginBottom: 20
                }}>
                  {selected.constraints}
                </pre>

                <h4 style={{ fontSize: '0.9rem', marginBottom: 12, color: 'var(--text-primary)' }}>Sample Test Cases:</h4>
                {(selected.testCases || []).map((tc, i) => (
                  <div key={i} style={{
                    padding: 12,
                    background: 'var(--bg-primary)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    marginBottom: 10,
                    fontSize: '0.85rem'
                  }}>
                    <div style={{ marginBottom: 4 }}>
                      <span style={{ color: 'var(--text-muted)' }}>Input: </span>
                      <code style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>{tc.input}</code>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Expected Output: </span>
                      <code style={{ color: 'var(--success)', fontWeight: 600 }}>{tc.expected}</code>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Sparkles size={18} color="var(--warning)" /> Optimal Approach & Complexity
                </h3>
                <div style={{ padding: 16, background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', marginBottom: 16 }}>
                  <div style={{ fontWeight: 600, color: 'var(--warning)', marginBottom: 6 }}>Time Complexity Target</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Aim for O(N) or O(N log N) with auxiliary hash map space O(N). Avoid nested O(N^2) brute force loops.</div>
                </div>
                <div style={{ padding: 16, background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                  <div style={{ fontWeight: 600, color: 'var(--accent-primary)', marginBottom: 6 }}>Key Interview Tip</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Clarify edge cases (empty input, negative values, very large arrays) with the interviewer before writing the code.</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Pane: Code Editor & Console Output */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: 0, overflow: 'hidden' }}>
          {/* Action Toolbar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 16px',
            background: 'var(--bg-secondary)',
            borderBottom: '1px solid var(--border)'
          }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Code size={14} color="var(--accent-primary)" /> Solution Editor ({language})
            </span>

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                id="btn-run-code"
                className="btn btn-secondary btn-sm"
                onClick={runCode}
                disabled={isRunning || isSubmitting}
              >
                <Play size={14} /> {isRunning ? 'Running...' : 'Run Code'}
              </button>
              <button
                id="btn-submit-code"
                className="btn btn-primary btn-sm"
                onClick={submitCode}
                disabled={isRunning || isSubmitting}
              >
                <Send size={14} /> {isSubmitting ? 'Evaluating...' : 'Submit Solution'}
              </button>
            </div>
          </div>

          {/* Textarea Code Editor */}
          <textarea
            id="code-editor-area"
            style={{
              flex: 1,
              width: '100%',
              minHeight: 280,
              background: '#0b1120',
              color: '#38bdf8',
              fontFamily: 'Consolas, "Fira Code", monospace',
              fontSize: '0.9rem',
              lineHeight: 1.6,
              padding: 16,
              border: 'none',
              outline: 'none',
              resize: 'none'
            }}
            value={code}
            onChange={e => setCode(e.target.value)}
            spellCheck={false}
          />

          {/* Output / Console Bar */}
          <div style={{
            background: '#0f172a',
            borderTop: '1px solid var(--border)',
            padding: 14,
            maxHeight: 180,
            overflowY: 'auto'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 8
            }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Terminal size={12} /> Execution Console
              </span>
              {output && (
                <button
                  className="btn btn-ghost btn-sm"
                  style={{ padding: '2px 8px', fontSize: '0.7rem' }}
                  onClick={() => setOutput('')}
                >
                  Clear
                </button>
              )}
            </div>

            <pre style={{
              fontSize: '0.82rem',
              fontFamily: 'monospace',
              color: output.includes('PASSED') || output.includes('ACCEPTED') ? 'var(--success)' : 'var(--text-secondary)',
              whiteSpace: 'pre-wrap',
              margin: 0
            }}>
              {output || 'Click "Run Code" to test against test cases or "Submit Solution" to evaluate.'}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
