import { useState } from 'react';
import { 
  Building2, Search, Filter, MapPin, DollarSign, Award, 
  CheckCircle, ChevronRight, BookOpen, ExternalLink, Users, 
  Clock, Shield, ArrowRight, Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const COMPANIES_DATA = [
  {
    id: 'google',
    name: 'Google',
    tier: 'Tier 1 Product',
    difficulty: 'HARD',
    logoLetter: 'G',
    color: '#4285F4',
    avgCtc: '₹32 - 45 LPA',
    hiringBatch: '2025 / 2026',
    activeRoles: ['Software Engineer (L3)', 'Associate Cloud Engineer', 'Application Engineer'],
    requiredSkills: ['Data Structures & Algorithms', 'System Design', 'C++', 'Java', 'Python', 'Distributed Systems'],
    eligibility: {
      cgpa: '7.5+ CGPA',
      degree: 'B.Tech / M.Tech / Dual Degree (CS, IT, ECE)',
      backlogs: 'No active backlogs allowed at the time of joining'
    },
    rounds: [
      { name: 'Round 1: Online Assessment (OA)', desc: '2 challenging algorithmic problems on HackerEarth/custom platform (90 mins). Strong focus on Graphs, DP, and Trees.' },
      { name: 'Round 2: Technical Interview 1', desc: '45 mins live coding on Google Docs. Deep dive into time & space complexity, edge-case analysis.' },
      { name: 'Round 3: Technical Interview 2', desc: 'Advanced problem solving, tree traversals, shortest path graph algorithms, and OOP design.' },
      { name: 'Round 4: Googliness & Leadership', desc: 'Behavioral interview evaluating ambiguity navigation, ethical teamwork, and intellectual humility.' }
    ],
    hotTopics: ['Binary Search on Answer', 'Segment Trees & Fenwick Trees', 'Dynamic Programming on DAGs', 'Sliding Window & Hash Maps'],
    prepTip: 'Always speak your thought process out loud. Google interviewers evaluate how you communicate and collaborate when stuck.'
  },
  {
    id: 'microsoft',
    name: 'Microsoft',
    tier: 'Tier 1 Product',
    difficulty: 'HARD',
    logoLetter: 'M',
    color: '#00A4EF',
    avgCtc: '₹28 - 42 LPA',
    hiringBatch: '2025 / 2026',
    activeRoles: ['Software Development Engineer 1', 'Cloud Infrastructure Engineer', 'Data & AI Engineer'],
    requiredSkills: ['Data Structures', 'Operating Systems', 'C# / Java', 'Azure Cloud', 'DBMS', 'Algorithms'],
    eligibility: {
      cgpa: '7.0+ CGPA',
      degree: 'B.Tech / M.Tech / MCA (All engineering disciplines eligible)',
      backlogs: 'Zero backlogs allowed during offer release'
    },
    rounds: [
      { name: 'Round 1: Online Coding Test', desc: '3 coding questions testing Arrays, Strings, and Linked Lists on Codility (60-75 mins).' },
      { name: 'Round 2: Technical Coding', desc: 'Live problem solving on data structures, recursion, and object-oriented architecture.' },
      { name: 'Round 3: OS & System Architecture', desc: 'Operating system internals, multithreading, memory management, and database query optimization.' },
      { name: 'Round 4: AA (As Appropriate) Director Round', desc: 'Senior leadership discussion assessing company culture alignment, past project deep dive.' }
    ],
    hotTopics: ['Linked List Reversal & Fast-Slow Pointers', 'Binary Search Tree Validations', 'Producer-Consumer Threading', 'LRU Cache Design'],
    prepTip: 'Master memory management and operating system basics. Microsoft values clean, modular, and maintainable code structure.'
  },
  {
    id: 'amazon',
    name: 'Amazon',
    tier: 'Tier 1 Product',
    difficulty: 'HARD',
    logoLetter: 'A',
    color: '#FF9900',
    avgCtc: '₹30 - 44 LPA',
    hiringBatch: '2026 Batch',
    activeRoles: ['SDE-1 (Retail / AWS)', 'Support Engineer', 'Quality Assurance Engineer'],
    requiredSkills: ['Data Structures', 'Java', 'Object Oriented Design', 'Microservices', 'SQL', '14 Leadership Principles'],
    eligibility: {
      cgpa: '6.5+ CGPA or 65% aggregate',
      degree: 'B.E. / B.Tech / M.Tech in CS / IT / EE / ECE',
      backlogs: 'Maximum 1 backlog allowed if cleared before onboarding'
    },
    rounds: [
      { name: 'Round 1: Online Assessment + Work Simulation', desc: '2 coding problems + Amazon Workplace Simulation scenarios assessing Leadership Principles.' },
      { name: 'Round 2: Technical Interview 1', desc: 'Data structures & algorithms (Trees, Heaps, Hash Tables) + 2 Leadership Principle STAR stories.' },
      { name: 'Round 3: Technical Interview 2', desc: 'Low-level Object Oriented Design (Parking Lot, Elevator, Chess) + Leadership questions.' },
      { name: 'Round 4: Bar Raiser Round', desc: 'Independent senior interviewer evaluating technical excellence and long-term behavioral fit.' }
    ],
    hotTopics: ['Top K Frequent Elements (Heaps)', 'Subtree of Another Tree', 'Design an In-Memory File System', 'Trapping Rain Water'],
    prepTip: 'Prepare 2 solid STAR-format stories for EVERY Amazon Leadership Principle (Customer Obsession, Ownership, Bias for Action).'
  },
  {
    id: 'atlassian',
    name: 'Atlassian',
    tier: 'Product MNC',
    difficulty: 'HARD',
    logoLetter: 'A',
    color: '#0052CC',
    avgCtc: '₹26 - 38 LPA',
    hiringBatch: '2025 / 2026',
    activeRoles: ['Associate Software Engineer', 'Product Designer', 'Site Reliability Engineer'],
    requiredSkills: ['JavaScript / TypeScript', 'React', 'Java', 'System Scalability', 'REST APIs', 'Git'],
    eligibility: {
      cgpa: '7.0+ CGPA',
      degree: 'B.Tech / B.E in CS / IT / Software Engineering',
      backlogs: 'Zero active backlogs'
    },
    rounds: [
      { name: 'Round 1: Hackerrank OA', desc: '3 problems focusing on String algorithms, Dynamic Programming, and Graph connectivity.' },
      { name: 'Round 2: DSA & Problem Solving', desc: 'Deep dive into data structure design and optimal memory usage.' },
      { name: 'Round 3: System Design & Code Craftsmanship', desc: 'Modular design, unit testability, clean architecture, and error handling.' },
      { name: 'Round 4: Values & Culture Interview', desc: 'Atlassian values: Open company no bullshit, Build with heart and balance, Play as a team.' }
    ],
    hotTopics: ['Rate Limiter Algorithm', 'File System Directory Search', 'LRU Cache with TTL', 'React Component State Optimization'],
    prepTip: 'Write unit tests during your live coding interview. Atlassian values automated testing and clean production-ready code.'
  },
  {
    id: 'goldman-sachs',
    name: 'Goldman Sachs',
    tier: 'FinTech MNC',
    difficulty: 'HARD',
    logoLetter: 'G',
    color: '#7399C6',
    avgCtc: '₹24 - 32 LPA',
    hiringBatch: '2026 Batch',
    activeRoles: ['Engineering Analyst', 'Quantitative Risk Analyst', 'Securities Operations Engineer'],
    requiredSkills: ['Java', 'C++', 'Data Structures', 'Probability & Math', 'SQL', 'Multithreading'],
    eligibility: {
      cgpa: '7.0+ CGPA',
      degree: 'All Engineering & Applied Math disciplines welcome',
      backlogs: 'No active backlogs'
    },
    rounds: [
      { name: 'Round 1: Aptitude + Coding OA', desc: 'Math, Probability, Advanced Quantitative aptitude + 2 medium coding problems.' },
      { name: 'Round 2: Technical Interview 1', desc: 'Data structures, Linked lists, String manipulation, and complexity analysis.' },
      { name: 'Round 3: Technical Interview 2', desc: 'Puzzles, Probability questions, SQL queries, and OOP design.' },
      { name: 'Round 4: Vice President / Managing Director Round', desc: 'Financial awareness, passion for fintech, and behavioral scenarios.' }
    ],
    hotTopics: ['Probability puzzles & Coin tosses', 'String Anagrams & Palindromic partitions', '25 Horses Puzzle', 'High-throughput thread pools'],
    prepTip: 'Brush up on discrete mathematics, probability, and classic interview puzzles alongside LeetCode problems.'
  },
  {
    id: 'tcs',
    name: 'TCS (Tata Consultancy Services)',
    tier: 'Service / Digital',
    difficulty: 'EASY',
    logoLetter: 'T',
    color: '#0F52BA',
    avgCtc: '₹7.5 - 9.5 LPA (Digital) / ₹3.6 LPA (Ninja)',
    hiringBatch: '2026 Batch',
    activeRoles: ['TCS Digital Engineer', 'TCS Prime Innovator', 'TCS Ninja Developer'],
    requiredSkills: ['Java / Python / C', 'Basic DSA', 'SQL Queries', 'Verbal Aptitude', 'Communication'],
    eligibility: {
      cgpa: '6.0+ CGPA or 60% throughout 10th, 12th, and UG',
      degree: 'B.Tech / M.Tech / MCA / M.Sc (CS/IT)',
      backlogs: 'Maximum 1 backlog permitted at test time'
    },
    rounds: [
      { name: 'Round 1: TCS NQT (National Qualifier Test)', desc: 'Cognitive (Numerical, Verbal, Reasoning) + Advanced Coding (2 problems, 60 mins).' },
      { name: 'Round 2: Technical Interview', desc: 'College projects, DBMS fundamentals, OOP concepts, basic SQL, and language syntax.' },
      { name: 'Round 3: Managerial & HR Interview', desc: 'Relocation preferences, shift flexibility, communication, and background verification.' }
    ],
    hotTopics: ['Matrix Transpose & Rotations', 'Prime Number Sieve', 'SQL Joins & Group By', 'OOP Encapsulation & Inheritance'],
    prepTip: 'High score in the Advanced Coding section of NQT directly upgrades your interview call from Ninja (3.6 LPA) to Digital (7.5 LPA) or Prime (9.5 LPA).'
  }
];

const difficultyBadge = {
  EASY: 'badge-success',
  MEDIUM: 'badge-warning',
  HARD: 'badge-error'
};

export default function Companies() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('All');
  const [diffFilter, setDiffFilter] = useState('All');
  const [selectedCompany, setSelectedCompany] = useState(null);

  const filteredCompanies = COMPANIES_DATA.filter(comp => {
    if (tierFilter !== 'All' && !comp.tier.toLowerCase().includes(tierFilter.toLowerCase())) return false;
    if (diffFilter !== 'All' && comp.difficulty !== diffFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        comp.name.toLowerCase().includes(q) ||
        comp.activeRoles.some(r => r.toLowerCase().includes(q)) ||
        comp.requiredSkills.some(s => s.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1><span className="gradient-text">Company Preparation Guides</span></h1>
          <p>Explore top recruiting companies, selection patterns, eligibility criteria, and interview questions</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span className="badge badge-primary" style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
            <Building2 size={14} style={{ marginRight: 6 }} />
            {COMPANIES_DATA.length} Top Recruiters Tracked
          </span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="card mb-6" style={{ padding: 18 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginBottom: 14 }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              id="company-search-input"
              className="form-input"
              style={{ paddingLeft: 38 }}
              placeholder="Search companies, roles, or skills..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Difficulty Dropdown */}
          <select
            className="form-select"
            style={{ width: 'auto', minWidth: 140 }}
            value={diffFilter}
            onChange={e => setDiffFilter(e.target.value)}
          >
            <option value="All">All Difficulties</option>
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
          </select>
        </div>

        {/* Tier Tabs */}
        <div className="filter-tabs" style={{ marginBottom: 0 }}>
          {['All', 'Product', 'FinTech', 'Service'].map(t => (
            <button
              key={t}
              className={`filter-tab${tierFilter === t ? ' active' : ''}`}
              onClick={() => setTierFilter(t)}
            >
              {t === 'All' ? 'All Tiers' : `${t} Companies`}
            </button>
          ))}
        </div>
      </div>

      {/* Company Cards Grid */}
      <div className="grid-2" style={{ gap: 20 }}>
        {filteredCompanies.map(comp => (
          <div
            key={comp.id}
            id={`company-card-${comp.id}`}
            className="card card-hover"
            style={{
              display: 'flex',
              flexDirection: 'column',
              padding: 24,
              border: '1px solid var(--border)',
              position: 'relative'
            }}
          >
            {/* Top Row: Logo, Name, Tier, Difficulty */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 'var(--radius-md)',
                  background: comp.color || 'var(--accent-primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: '1.4rem', color: '#fff',
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  {comp.logoLetter}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-primary)' }}>{comp.name}</h3>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{comp.tier}</div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                <span className={`badge ${difficultyBadge[comp.difficulty] || 'badge-info'}`}>
                  {comp.difficulty}
                </span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--success)' }}>
                  {comp.avgCtc}
                </span>
              </div>
            </div>

            {/* Active Roles */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: 4 }}>
                Active Hiring Roles:
              </div>
              <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                {comp.activeRoles.join(' • ')}
              </div>
            </div>

            {/* Required Skills */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: 6 }}>
                Key Technical Skills:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {comp.requiredSkills.map((s, idx) => (
                  <span key={idx} className="badge badge-primary" style={{ fontSize: '0.75rem', padding: '3px 8px' }}>
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Eligibility Summary */}
            <div style={{
              padding: '10px 14px',
              background: 'var(--bg-glass)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.8rem',
              color: 'var(--text-secondary)',
              marginBottom: 18,
              border: '1px solid var(--border)'
            }}>
              <strong>Eligibility:</strong> {comp.eligibility.cgpa} • {comp.eligibility.degree}
            </div>

            {/* View Details Action Button */}
            <button
              id={`btn-view-company-${comp.id}`}
              className="btn btn-primary"
              style={{ marginTop: 'auto', display: 'flex', justifyContent: 'center', gap: 8 }}
              onClick={() => setSelectedCompany(comp)}
            >
              <BookOpen size={16} /> View Company Details & Rounds
            </button>
          </div>
        ))}
      </div>

      {/* Comprehensive Company Dossier Modal */}
      {selectedCompany && (
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
            maxWidth: 780,
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
              padding: '20px 24px',
              background: 'var(--bg-secondary)',
              borderBottom: '1px solid var(--border)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 46, height: 46, borderRadius: 'var(--radius-md)',
                  background: selectedCompany.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: '1.25rem', color: '#fff'
                }}>
                  {selectedCompany.logoLetter}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{selectedCompany.name} Placement Dossier</h3>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {selectedCompany.tier} • Average Package: <strong style={{ color: 'var(--success)' }}>{selectedCompany.avgCtc}</strong>
                  </div>
                </div>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setSelectedCompany(null)}>
                ✕ Close
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ padding: 24, overflowY: 'auto', flex: 1 }}>
              {/* Eligibility Box */}
              <div style={{ padding: 16, background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', marginBottom: 20 }}>
                <h4 style={{ fontSize: '0.95rem', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Shield size={16} color="var(--accent-primary)" /> Strict Eligibility Criteria
                </h4>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  <div>• <strong>Minimum Academic Score:</strong> {selectedCompany.eligibility.cgpa}</div>
                  <div>• <strong>Permitted Degrees:</strong> {selectedCompany.eligibility.degree}</div>
                  <div>• <strong>Backlog Policy:</strong> {selectedCompany.eligibility.backlogs}</div>
                </div>
              </div>

              {/* Selection Process */}
              <h4 style={{ fontSize: '1rem', marginBottom: 14 }}>Hiring Workflow & Interview Rounds</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                {selectedCompany.rounds.map((round, idx) => (
                  <div key={idx} style={{
                    padding: 14,
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border)'
                  }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--accent-primary)', marginBottom: 4 }}>
                      {round.name}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      {round.desc}
                    </div>
                  </div>
                ))}
              </div>

              {/* Hot Topics */}
              <h4 style={{ fontSize: '1rem', marginBottom: 10 }}>Most Frequently Tested Topics</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
                {selectedCompany.hotTopics.map((topic, idx) => (
                  <span key={idx} className="badge badge-warning" style={{ fontSize: '0.8rem', padding: '5px 10px' }}>
                    🔥 {topic}
                  </span>
                ))}
              </div>

              {/* Insider Tip */}
              <div style={{
                padding: 16,
                background: 'rgba(99, 102, 241, 0.1)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                borderRadius: 'var(--radius-md)'
              }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--accent-primary)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Sparkles size={16} /> Placement Edge Insider Advice
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {selectedCompany.prepTip}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 24px',
              background: 'var(--bg-secondary)',
              borderTop: '1px solid var(--border)'
            }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setSelectedCompany(null)}>
                Close
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => {
                  setSelectedCompany(null);
                  navigate('/coding');
                }}
              >
                Practice Company Questions <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
