import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import api from '../api/axios';
import { 
  BookOpen, Clock, Star, ChevronRight, Search, Filter, 
  Award, CheckCircle2, XCircle, ArrowRight, RotateCcw, 
  Trophy, Flame, Check, HelpCircle, BarChart3, AlertCircle
} from 'lucide-react';
import { getLocalData, setLocalData } from '../api/mockData';

const TOPIC_QUIZZES = [
  {
    id: 'dsa-core',
    title: 'Data Structures & Algorithms Core',
    category: 'DSA',
    difficulty: 'MEDIUM',
    durationMinutes: 20,
    totalMarks: 50,
    questionCount: 5,
    description: 'Arrays, Linked Lists, Binary Trees, and Big-O Time Complexity analysis.',
    questions: [
      {
        id: 1,
        question: 'What is the average time complexity of searching in a Balanced Binary Search Tree (AVL / Red-Black)?',
        options: ['O(1)', 'O(log N)', 'O(N)', 'O(N log N)'],
        answer: 1,
        explanation: 'In a balanced BST, tree height is strictly bounded by log2(N), giving O(log N) lookup time.'
      },
      {
        id: 2,
        question: 'Which data structure is primarily used in breadth-first search (BFS) graph traversal?',
        options: ['Stack', 'Queue', 'Priority Queue', 'Hash Table'],
        answer: 1,
        explanation: 'BFS explores neighbor vertices in First-In-First-Out order using a Queue.'
      },
      {
        id: 3,
        question: 'What is the worst-case time complexity of QuickSort?',
        options: ['O(N log N)', 'O(N)', 'O(N^2)', 'O(log N)'],
        answer: 2,
        explanation: 'When pivots are chosen poorly (e.g. sorted input with last element as pivot), QuickSort degrades to O(N^2).'
      },
      {
        id: 4,
        question: 'Which of the following sorting algorithms is NOT stable by default?',
        options: ['Merge Sort', 'Insertion Sort', 'Quick Sort', 'Bubble Sort'],
        answer: 2,
        explanation: 'Standard QuickSort swaps non-adjacent elements over the pivot, which can reorder identical elements.'
      },
      {
        id: 5,
        question: 'What is the space complexity of an in-order recursive traversal of a balanced binary tree of N nodes?',
        options: ['O(1)', 'O(log N)', 'O(N)', 'O(N^2)'],
        answer: 1,
        explanation: 'The recursion call stack matches the height of the balanced tree, which is O(log N).'
      }
    ]
  },
  {
    id: 'java-oop',
    title: 'Java Core & Object-Oriented Principles',
    category: 'Java',
    difficulty: 'EASY',
    durationMinutes: 15,
    totalMarks: 40,
    questionCount: 4,
    description: 'Inheritance, Polymorphism, JVM memory architecture, and Collections.',
    questions: [
      {
        id: 101,
        question: 'Which Java memory area stores method code, class structures, and static variables?',
        options: ['Heap Memory', 'Stack Memory', 'Metaspace / Method Area', 'Native Method Stack'],
        answer: 2,
        explanation: 'Since Java 8, class metadata and static structures are stored in off-heap Metaspace.'
      },
      {
        id: 102,
        question: 'Can you override a private or static method in Java?',
        options: ['Yes, both can be overridden', 'Only static can be overridden', 'No, neither can be overridden', 'Only private can be overridden'],
        answer: 2,
        explanation: 'Static methods are hidden (method hiding), while private methods are not inherited or accessible by subclasses.'
      },
      {
        id: 103,
        question: 'What is the default initial capacity and load factor of HashMap in Java?',
        options: ['16 and 0.75', '10 and 0.5', '32 and 0.8', '8 and 0.75'],
        answer: 0,
        explanation: 'By default, Java HashMap creates an array of 16 buckets with a load factor of 0.75.'
      },
      {
        id: 104,
        question: 'Which interface allows a collection to be iterated using the enhanced for loop?',
        options: ['Iterator', 'Iterable', 'Collection', 'Streamable'],
        answer: 1,
        explanation: 'Objects implementing java.lang.Iterable can be the target of the enhanced for-each statement.'
      }
    ]
  },
  {
    id: 'sql-dbms',
    title: 'Database Management Systems & SQL',
    category: 'DBMS',
    difficulty: 'MEDIUM',
    durationMinutes: 20,
    totalMarks: 50,
    questionCount: 5,
    description: 'ACID properties, Normalization (1NF-BCNF), Indexing, and Complex Joins.',
    questions: [
      {
        id: 201,
        question: 'What property of ACID ensures that transactions are either fully committed or rolled back completely?',
        options: ['Atomicity', 'Consistency', 'Isolation', 'Durability'],
        answer: 0,
        explanation: 'Atomicity ensures all-or-nothing execution of database transactions.'
      },
      {
        id: 202,
        question: 'Which Normal Form eliminates transitive dependencies between non-prime attributes?',
        options: ['1NF', '2NF', '3NF', 'BCNF'],
        answer: 2,
        explanation: 'Third Normal Form (3NF) requires 2NF plus no transitive dependencies (X -> Y and Y -> Z).'
      },
      {
        id: 203,
        question: 'What index structure is most widely used by relational engines for range and equality queries?',
        options: ['Hash Index', 'B+ Tree Index', 'Inverted Index', 'Bitmap Index'],
        answer: 1,
        explanation: 'B+ trees keep leaf nodes linked in sequential order, making both point lookups and range scans very fast.'
      },
      {
        id: 204,
        question: 'What is the main difference between WHERE and HAVING in SQL?',
        options: [
          'HAVING filters rows before grouping; WHERE filters aggregated groups',
          'WHERE filters individual rows before aggregation; HAVING filters groups after GROUP BY',
          'There is no difference',
          'HAVING can only be used with subqueries'
        ],
        answer: 1,
        explanation: 'WHERE filters rows prior to GROUP BY, while HAVING filters aggregated summaries.'
      },
      {
        id: 205,
        question: 'Which isolation level prevents Dirty Reads, Non-Repeatable Reads, and Phantom Reads?',
        options: ['Read Uncommitted', 'Read Committed', 'Repeatable Read', 'Serializable'],
        answer: 3,
        explanation: 'Serializable provides the highest isolation level, preventing all anomalies at the cost of concurrency.'
      }
    ]
  },
  {
    id: 'os-system',
    title: 'Operating Systems & Concurrency',
    category: 'OS',
    difficulty: 'MEDIUM',
    durationMinutes: 20,
    totalMarks: 40,
    questionCount: 4,
    description: 'Process Scheduling, Deadlocks, Virtual Memory, and Semaphores.',
    questions: [
      {
        id: 301,
        question: 'Which of the following is NOT one of the 4 Coffman conditions required for a Deadlock?',
        options: ['Mutual Exclusion', 'Hold and Wait', 'Preemption Allowed', 'Circular Wait'],
        answer: 2,
        explanation: 'Deadlock requires NO preemption. If preemption is allowed, resources can be reclaimed and deadlocks avoided.'
      },
      {
        id: 302,
        question: 'What is the phenomenon called where excessive paging degrades system CPU utilization to nearly zero?',
        options: ['Beladys Anomaly', 'Thrashing', 'Starvation', 'Race Condition'],
        answer: 1,
        explanation: 'Thrashing occurs when the OS spends more time swapping pages in and out of memory than executing processes.'
      },
      {
        id: 303,
        question: 'What is the purpose of a translation lookaside buffer (TLB)?',
        options: [
          'Cache recently accessed disk sectors',
          'Cache virtual-to-physical page table address mappings',
          'Store CPU registers during context switches',
          'Buffer network I/O packets'
        ],
        answer: 1,
        explanation: 'TLB is a fast hardware associative cache that accelerates virtual page number to physical frame address translation.'
      },
      {
        id: 304,
        question: 'Which scheduling algorithm is provably optimal for minimizing average waiting time?',
        options: ['First Come First Served (FCFS)', 'Round Robin (RR)', 'Shortest Job First (SJF)', 'Priority Scheduling'],
        answer: 2,
        explanation: 'SJF (Shortest Job First) is provably optimal for minimizing average waiting time for a given set of processes.'
      }
    ]
  },
  {
    id: 'system-design',
    title: 'System Design & Scalability',
    category: 'System Design',
    difficulty: 'HARD',
    durationMinutes: 25,
    totalMarks: 50,
    questionCount: 5,
    description: 'Microservices, Caching (Redis), Load Balancing, and CAP Theorem.',
    questions: [
      {
        id: 401,
        question: 'According to the CAP theorem, what can a distributed data store guarantee during a network partition (P)?',
        options: ['Both Consistency and Availability', 'Either Consistency or Availability', 'Neither Consistency nor Availability', 'Only Durability'],
        answer: 1,
        explanation: 'In the presence of a network partition (P), a distributed system must choose between Consistency (CP) or Availability (AP).'
      },
      {
        id: 402,
        question: 'Which caching strategy writes data to both the cache and the backing database at the exact same time?',
        options: ['Cache-Aside', 'Write-Through', 'Write-Behind (Write-Back)', 'Refresh-Ahead'],
        answer: 1,
        explanation: 'In Write-Through caching, the application writes directly to cache, which synchronously updates the DB before returning.'
      },
      {
        id: 403,
        question: 'Which load balancing algorithm ensures that requests from the same client IP consistently hit the same backend server?',
        options: ['Round Robin', 'Least Connections', 'IP Hash', 'Weighted Random'],
        answer: 2,
        explanation: 'IP Hash hashes the client IP address to route the user consistently to the same server node.'
      },
      {
        id: 404,
        question: 'What is the primary benefit of Consistent Hashing over traditional modulo hashing in distributed clusters?',
        options: [
          'Guarantees 100% data compression',
          'Minimizes key redistribution when nodes are added or removed',
          'Eliminates the need for replicated data',
          'Guarantees sub-millisecond network latency'
        ],
        answer: 1,
        explanation: 'Consistent Hashing only requires redistributing k/N keys on average when a cache node leaves or joins the ring.'
      },
      {
        id: 405,
        question: 'What pattern is used to prevent cascading system failures when downstream remote services become unresponsive?',
        options: ['Circuit Breaker Pattern', 'Saga Pattern', 'BFF (Backend for Frontend)', 'CQRS Pattern'],
        answer: 0,
        explanation: 'The Circuit Breaker pattern trips open when failures cross a threshold, failing fast without tying up threads.'
      }
    ]
  },
  {
    id: 'aptitude-placement',
    title: 'Quantitative & Logical Aptitude',
    category: 'Aptitude',
    difficulty: 'EASY',
    durationMinutes: 15,
    totalMarks: 40,
    questionCount: 4,
    description: 'Speed, Time & Work, Probability, and Logical Reasoning patterns.',
    questions: [
      {
        id: 501,
        question: 'A train 150m long is running at 54 km/hr. How long will it take to pass a telegraph post?',
        options: ['8 seconds', '10 seconds', '12 seconds', '15 seconds'],
        answer: 1,
        explanation: 'Speed = 54 * (5/18) = 15 m/s. Time = Distance / Speed = 150 / 15 = 10 seconds.'
      },
      {
        id: 502,
        question: 'A can do a piece of work in 12 days and B can do it in 24 days. Working together, how many days will it take?',
        options: ['6 days', '8 days', '9 days', '10 days'],
        answer: 1,
        explanation: '1/12 + 1/24 = 3/24 = 1/8. So together they finish in 8 days.'
      },
      {
        id: 503,
        question: 'Two dice are tossed simultaneously. What is the probability of getting a sum of 7?',
        options: ['1/6', '5/36', '7/36', '1/12'],
        answer: 0,
        explanation: 'Pairs giving 7 are (1,6), (2,5), (3,4), (4,3), (5,2), (6,1) = 6 outcomes out of 36 = 1/6.'
      },
      {
        id: 504,
        question: 'Find the next number in the series: 3, 8, 18, 38, 78, ... ?',
        options: ['148', '158', '168', '178'],
        answer: 1,
        explanation: 'Pattern: (N * 2) + 2. (78 * 2) + 2 = 156 + 2 = 158.'
      }
    ]
  }
];

const CATEGORIES = ['All', 'DSA', 'Java', 'DBMS', 'OS', 'System Design', 'Aptitude'];
const DIFFICULTIES = ['All', 'EASY', 'MEDIUM', 'HARD'];
const difficultyBadge = { EASY: 'badge-success', MEDIUM: 'badge-warning', HARD: 'badge-error' };

export default function Quizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [difficulty, setDifficulty] = useState('All');
  const [search, setSearch] = useState('');
  
  // Interactive Quiz Runner state
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  // User Quiz History / Stats stored locally
  const [quizHistory, setQuizHistory] = useState(() => getLocalData('quiz_history', {
    attemptedCount: 3,
    avgScore: 84,
    totalPoints: 340,
    bestTopic: 'Java',
    completedMap: { 'java-oop': 100, 'sql-dbms': 80 }
  }));

  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/quizzes')
      .then(r => {
        const backendQuizzes = r.data.data || [];
        if (backendQuizzes.length > 0) {
          // Merge with topic quizzes
          const combined = [...backendQuizzes, ...TOPIC_QUIZZES];
          setQuizzes(combined);
          setFiltered(combined);
        } else {
          setQuizzes(TOPIC_QUIZZES);
          setFiltered(TOPIC_QUIZZES);
        }
      })
      .catch(() => {
        // Fallback to high quality offline topic quizzes
        setQuizzes(TOPIC_QUIZZES);
        setFiltered(TOPIC_QUIZZES);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = quizzes;
    if (category !== 'All') result = result.filter(q => q.category === category);
    if (difficulty !== 'All') result = result.filter(q => q.difficulty === difficulty);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(item => 
        item.title.toLowerCase().includes(q) || 
        (item.description && item.description.toLowerCase().includes(q))
      );
    }
    setFiltered(result);
  }, [category, difficulty, search, quizzes]);

  const handleStartQuiz = (quiz) => {
    if (typeof quiz.id === 'number') {
      // Backend quiz ID: navigate to standard route
      navigate(`/quizzes/${quiz.id}`);
    } else {
      // Curated topic quiz with questions: run in the interactive runner modal
      setActiveQuiz(quiz);
      setCurrentQIndex(0);
      setSelectedAnswers({});
      setQuizSubmitted(false);
      setQuizScore(0);
    }
  };

  const handleSelectAnswer = (qIndex, optIndex) => {
    if (quizSubmitted) return;
    setSelectedAnswers(prev => ({ ...prev, [qIndex]: optIndex }));
  };

  const submitActiveQuiz = () => {
    if (!activeQuiz) return;
    let score = 0;
    const questions = activeQuiz.questions || [];
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.answer) {
        score += 1;
      }
    });

    const pct = Math.round((score / questions.length) * 100);
    setQuizScore(pct);
    setQuizSubmitted(true);

    // Update history stats
    const updated = {
      ...quizHistory,
      attemptedCount: (quizHistory.attemptedCount || 0) + 1,
      totalPoints: (quizHistory.totalPoints || 0) + (score * 10),
      completedMap: { ...(quizHistory.completedMap || {}), [activeQuiz.id]: pct }
    };
    setQuizHistory(updated);
    setLocalData('quiz_history', updated);

    toast.success(`Quiz completed! You scored ${pct}% (${score}/${questions.length})`);
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loader"><div className="spinner" /></div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1><span className="gradient-text">Topic-Wise Quizzes</span></h1>
          <p>Test your placement readiness across Core Computer Science, Coding, and Aptitude</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <span className="badge badge-primary" style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
            <Trophy size={14} color="#f59e0b" style={{ marginRight: 6 }} />
            {quizHistory.totalPoints} Total XP
          </span>
        </div>
      </div>

      {/* Progress & Score Tracker Cards */}
      <div className="grid-4 mb-6" style={{ gap: 16 }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '18px 20px' }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            background: 'var(--accent-glow)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid var(--accent-primary)', flexShrink: 0
          }}>
            <BookOpen size={22} color="var(--accent-primary)" />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Quizzes Taken</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {quizHistory.attemptedCount}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--success)' }}>+1 this week</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '18px 20px' }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            background: 'var(--success-bg)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid var(--success)', flexShrink: 0
          }}>
            <Award size={22} color="var(--success)" />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Average Score</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {quizHistory.avgScore}%
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--success)' }}>High Proficiency</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '18px 20px' }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            background: 'rgba(245, 158, 11, 0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid var(--warning)', flexShrink: 0
          }}>
            <Flame size={22} color="var(--warning)" />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Best Performing</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {quizHistory.bestTopic}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>94% Accuracy</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '18px 20px' }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            background: 'rgba(56, 189, 248, 0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid var(--info)', flexShrink: 0
          }}>
            <BarChart3 size={22} color="var(--info)" />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Placement Rank</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Top 15%
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--info)' }}>Eligible for Tier-1</div>
          </div>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="card mb-6" style={{ padding: 18 }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              id="quiz-search"
              type="text"
              className="form-input"
              style={{ paddingLeft: '38px' }}
              placeholder="Search quizzes by title or topic..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          
          {/* Difficulty */}
          <div style={{ position: 'relative' }}>
            <Filter size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <select
              id="quiz-difficulty-filter"
              className="form-select"
              style={{ paddingLeft: '32px', width: 'auto', minWidth: 140 }}
              value={difficulty}
              onChange={e => setDifficulty(e.target.value)}
            >
              {DIFFICULTIES.map(d => <option key={d} value={d}>{d === 'All' ? 'All Difficulties' : d}</option>)}
            </select>
          </div>
        </div>

        {/* Category tabs */}
        <div className="filter-tabs" style={{ marginTop: '16px', marginBottom: 0 }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              id={`cat-${cat.toLowerCase().replace(/\s+/g, '-')}`}
              className={`filter-tab${category === cat ? ' active' : ''}`}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Quiz Grid */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <BookOpen size={48} />
          <h3>No quizzes found</h3>
          <p>Try adjusting your category or difficulty filters</p>
          <button className="btn btn-secondary btn-sm" style={{ marginTop: 12 }} onClick={() => { setCategory('All'); setDifficulty('All'); setSearch(''); }}>
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid-3" style={{ gap: 20 }}>
          {filtered.map(quiz => {
            const previousScore = quizHistory.completedMap ? quizHistory.completedMap[quiz.id] : null;
            return (
              <div
                key={quiz.id}
                id={`quiz-${quiz.id}`}
                className="quiz-card card-hover"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  padding: 22,
                  border: previousScore ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border)'
                }}
              >
                <div className="quiz-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span className="badge badge-primary">{quiz.category}</span>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    {previousScore && (
                      <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>
                        ✓ {previousScore}%
                      </span>
                    )}
                    <span className={`badge ${difficultyBadge[quiz.difficulty] || 'badge-info'}`}>
                      {quiz.difficulty}
                    </span>
                  </div>
                </div>

                <h3 className="quiz-card-title" style={{ fontSize: '1.15rem', marginBottom: 8 }}>{quiz.title}</h3>
                <p className="quiz-card-desc" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 16, flex: 1 }}>
                  {quiz.description || 'Test your conceptual and practical readiness.'}
                </p>

                <div className="quiz-card-meta" style={{ display: 'flex', gap: 14, fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 18, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                  <span className="quiz-meta-item" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={13} /> {quiz.durationMinutes} mins
                  </span>
                  <span className="quiz-meta-item" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <HelpCircle size={13} /> {quiz.questionCount || 5} Questions
                  </span>
                  <span className="quiz-meta-item" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Star size={13} /> {quiz.totalMarks || 50} Pts
                  </span>
                </div>

                <button
                  id={`btn-start-quiz-${quiz.id}`}
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center', display: 'flex', gap: 8 }}
                  onClick={() => handleStartQuiz(quiz)}
                >
                  {previousScore ? 'Retake Quiz' : 'Start Quiz'} <ChevronRight size={16} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Interactive Quiz Runner Modal */}
      {activeQuiz && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(11, 15, 25, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: 20
        }}>
          <div className="card" style={{
            maxWidth: 720,
            width: '100%',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            padding: 0,
            border: '1px solid var(--border-hover)',
            boxShadow: 'var(--shadow-lg)'
          }}>
            {/* Modal Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 24px',
              background: 'var(--bg-secondary)',
              borderBottom: '1px solid var(--border)'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)' }}>{activeQuiz.title}</h3>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Question {currentQIndex + 1} of {(activeQuiz.questions || []).length}
                </div>
              </div>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setActiveQuiz(null)}
              >
                ✕ Close
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ padding: 24, overflowY: 'auto', flex: 1 }}>
              {!quizSubmitted ? (
                <>
                  {/* Question */}
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: '0.9rem', color: 'var(--accent-primary)', fontWeight: 600, marginBottom: 6 }}>
                      QUESTION {currentQIndex + 1}
                    </div>
                    <h4 style={{ fontSize: '1.1rem', lineHeight: 1.5, color: 'var(--text-primary)', margin: 0 }}>
                      {activeQuiz.questions[currentQIndex]?.question}
                    </h4>
                  </div>

                  {/* Options */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                    {(activeQuiz.questions[currentQIndex]?.options || []).map((opt, optIdx) => {
                      const isSelected = selectedAnswers[currentQIndex] === optIdx;
                      return (
                        <div
                          key={optIdx}
                          onClick={() => handleSelectAnswer(currentQIndex, optIdx)}
                          style={{
                            padding: '14px 18px',
                            borderRadius: 'var(--radius-md)',
                            border: isSelected ? '2px solid var(--accent-primary)' : '1px solid var(--border)',
                            background: isSelected ? 'var(--accent-glow)' : 'var(--bg-glass)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            transition: 'var(--transition)'
                          }}
                        >
                          <div style={{
                            width: 24, height: 24, borderRadius: '50%',
                            border: isSelected ? '2px solid var(--accent-primary)' : '2px solid var(--text-muted)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.75rem', fontWeight: 700,
                            color: isSelected ? 'var(--accent-primary)' : 'var(--text-muted)'
                          }}>
                            {String.fromCharCode(65 + optIdx)}
                          </div>
                          <span style={{ fontSize: '0.95rem', color: isSelected ? '#fff' : 'var(--text-secondary)' }}>
                            {opt}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                /* Results View */
                <div style={{ textAlign: 'center', padding: '16px 0' }}>
                  <div style={{
                    width: 80, height: 80, borderRadius: '50%',
                    background: quizScore >= 70 ? 'var(--success-bg)' : 'var(--warning-bg)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 16px',
                    border: `2px solid ${quizScore >= 70 ? 'var(--success)' : 'var(--warning)'}`
                  }}>
                    <Trophy size={40} color={quizScore >= 70 ? 'var(--success)' : 'var(--warning)'} />
                  </div>

                  <h2 style={{ marginBottom: 6 }}>Quiz Results</h2>
                  <div style={{ fontSize: '2.5rem', fontWeight: 800, color: quizScore >= 70 ? 'var(--success)' : 'var(--warning)', marginBottom: 8 }}>
                    {quizScore}%
                  </div>
                  <p style={{ color: 'var(--text-secondary)', maxWidth: 450, margin: '0 auto 24px' }}>
                    {quizScore >= 80 
                      ? 'Outstanding performance! You possess solid conceptual command in this topic.' 
                      : quizScore >= 60 
                      ? 'Good job! Review the explanations below to turn weak areas into strengths.'
                      : 'Keep practicing! Review core concepts and attempt this quiz again.'}
                  </p>

                  {/* Answers review */}
                  <div style={{ textAlign: 'left', marginTop: 24 }}>
                    <h4 style={{ marginBottom: 14 }}>Answers & Explanations:</h4>
                    {activeQuiz.questions.map((q, idx) => {
                      const userAns = selectedAnswers[idx];
                      const isCorrect = userAns === q.answer;
                      return (
                        <div key={idx} style={{
                          padding: 14,
                          borderRadius: 'var(--radius-md)',
                          background: 'var(--bg-glass)',
                          border: `1px solid ${isCorrect ? 'rgba(16, 185, 129, 0.4)' : 'rgba(244, 63, 94, 0.4)'}`,
                          marginBottom: 12
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                            {isCorrect ? (
                              <CheckCircle2 size={16} color="var(--success)" />
                            ) : (
                              <XCircle size={16} color="var(--error)" />
                            )}
                            <strong style={{ fontSize: '0.9rem' }}>Q{idx + 1}: {q.question}</strong>
                          </div>
                          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginLeft: 24 }}>
                            Correct Answer: <span style={{ color: 'var(--success)', fontWeight: 600 }}>{q.options[q.answer]}</span>
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginLeft: 24, marginTop: 4 }}>
                            💡 {q.explanation}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Controls */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 24px',
              background: 'var(--bg-secondary)',
              borderTop: '1px solid var(--border)'
            }}>
              {!quizSubmitted ? (
                <>
                  <button
                    className="btn btn-secondary btn-sm"
                    disabled={currentQIndex === 0}
                    onClick={() => setCurrentQIndex(prev => prev - 1)}
                  >
                    Previous
                  </button>

                  <div style={{ display: 'flex', gap: 8 }}>
                    {currentQIndex < (activeQuiz.questions || []).length - 1 ? (
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => setCurrentQIndex(prev => prev + 1)}
                      >
                        Next Question <ArrowRight size={14} />
                      </button>
                    ) : (
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={submitActiveQuiz}
                      >
                        Submit Quiz
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <div style={{ display: 'flex', gap: 10, width: '100%', justifyContent: 'flex-end' }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      setSelectedAnswers({});
                      setQuizSubmitted(false);
                      setCurrentQIndex(0);
                    }}
                  >
                    <RotateCcw size={14} /> Retry Quiz
                  </button>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => setActiveQuiz(null)}
                  >
                    Done
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
