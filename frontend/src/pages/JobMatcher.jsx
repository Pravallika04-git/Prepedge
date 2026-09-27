import { useState, useMemo } from 'react';
import { 
  Briefcase, CheckCircle, XCircle, BookOpen, ArrowRight, 
  Search, Filter, Building2, MapPin, DollarSign, Sparkles, 
  ExternalLink, UserCheck, Plus, X, Award, Check, FileText
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { getLocalData, setLocalData } from '../api/mockData';

const DEFAULT_JOBS = [
  {
    id: 'job-1',
    company: 'Google',
    role: 'Software Development Engineer - Early Career',
    location: 'Bengaluru / Hyderabad (Hybrid)',
    ctc: '₹28 - 36 LPA',
    type: 'Full-time',
    tier: 'Tier 1 Tech',
    posted: '2 days ago',
    requiredSkills: ['Data Structures', 'Algorithms', 'Java', 'Python', 'System Design'],
    description: 'Build large-scale distributed systems powering billions of searches. You will design, develop, test, deploy, and improve high-throughput software solutions.',
    responsibilities: [
      'Write scalable, maintainable, and high-performance production code',
      'Collaborate with cross-functional product and infrastructure teams',
      'Optimize database queries and microservices for sub-10ms response times'
    ],
    eligibility: 'B.Tech/B.E in CS/IT or related branch, 7.5+ CGPA, 0-2 years experience'
  },
  {
    id: 'job-2',
    company: 'Microsoft',
    role: 'Software Engineer - Azure Cloud Core',
    location: 'Hyderabad / Noida (Hybrid)',
    ctc: '₹24 - 32 LPA',
    type: 'Full-time',
    tier: 'Tier 1 Tech',
    posted: '3 days ago',
    requiredSkills: ['Java', 'C++', 'Cloud Computing', 'SQL', 'Algorithms', 'Docker'],
    description: 'Innovate on Microsoft Azure core compute and networking backplanes. Deliver enterprise-grade reliability and security for global cloud workloads.',
    responsibilities: [
      'Develop resilient cloud-native control plane APIs',
      'Diagnose and address complex distributed race conditions and bottlenecks',
      'Participate in high-volume on-call operational incident management'
    ],
    eligibility: 'B.Tech / M.Tech in CS/ECE with strong computer science fundamentals'
  },
  {
    id: 'job-3',
    company: 'Amazon',
    role: 'SDE 1 - E-Commerce Payments',
    location: 'Bengaluru (On-site)',
    ctc: '₹26 - 34 LPA',
    type: 'Full-time',
    tier: 'Tier 1 Tech',
    posted: 'Just now',
    requiredSkills: ['Java', 'Spring Boot', 'SQL', 'Microservices', 'AWS', 'Data Structures'],
    description: 'Architect ultra-reliable transaction pipelines for Amazon Pay. Handle peak festive traffic spikes with zero data loss and automated failovers.',
    responsibilities: [
      'Design transactional payment APIs adhering to PCI-DSS compliance',
      'Implement asynchronous event queues with Kafka and AWS SQS',
      'Refactor monolithic legacy endpoints into decoupled microservices'
    ],
    eligibility: 'B.Tech CS/IT graduate (2025/2026 batch), minimum 70% aggregate'
  },
  {
    id: 'job-4',
    company: 'Atlassian',
    role: 'Frontend / Full Stack Engineer (Jira & Confluence)',
    location: 'Bengaluru (Remote Friendly)',
    ctc: '₹22 - 30 LPA',
    type: 'Full-time',
    tier: 'Product MNC',
    posted: '1 week ago',
    requiredSkills: ['React', 'JavaScript', 'TypeScript', 'HTML', 'CSS', 'REST APIs', 'Git'],
    description: 'Transform how millions of teams collaborate. Build rich, accessible, lightning-fast UI components for Jira Cloud and Atlas tools.',
    responsibilities: [
      'Build reusable design-system components in React and TypeScript',
      'Optimize client-side performance, code-splitting, and caching',
      'Ensure strict WCAG accessibility and cross-browser responsiveness'
    ],
    eligibility: 'Strong portfolio projects in modern React, JavaScript, and Web APIs'
  },
  {
    id: 'job-5',
    company: 'Goldman Sachs',
    role: 'Engineering Analyst - Global Banking & Markets',
    location: 'Bengaluru / Hyderabad',
    ctc: '₹20 - 25 LPA',
    type: 'Full-time',
    tier: 'FinTech',
    posted: '4 days ago',
    requiredSkills: ['Java', 'Spring Boot', 'SQL', 'Python', 'Data Structures', 'Git'],
    description: 'Develop low-latency order execution systems and algorithmic pricing engines for global financial asset management.',
    responsibilities: [
      'Engineer real-time financial data analytics pipelines',
      'Ensure high-availability failover across multi-region data centers',
      'Work alongside quant traders and risk modeling teams'
    ],
    eligibility: 'Engineering graduates with high analytical capability and strong OOP skills'
  },
  {
    id: 'job-6',
    company: 'TCS Digital',
    role: 'Digital Innovator & Cloud Developer',
    location: 'Pan India (Multiple Locations)',
    ctc: '₹7.5 - 9.5 LPA',
    type: 'Full-time',
    tier: 'Service / Digital',
    posted: '5 days ago',
    requiredSkills: ['Java', 'Python', 'SQL', 'Git', 'HTML', 'CSS'],
    description: 'Work on premium modernization and cloud transformation accounts for Fortune 500 enterprises in retail, healthcare, and banking.',
    responsibilities: [
      'Develop modern enterprise web portals and REST services',
      'Implement CI/CD automated test pipelines',
      'Support cloud deployment and container orchestration'
    ],
    eligibility: 'Graduates with 65%+ throughout 10th, 12th, and B.Tech'
  }
];

export default function JobMatcher() {
  const toast = useToast();
  
  // Student Profile Skills
  const [studentSkills, setStudentSkills] = useState(() => {
    return getLocalData('student_skills', ['Java', 'React', 'SQL', 'Python', 'Data Structures', 'Git', 'Spring Boot']);
  });
  const [newSkillInput, setNewSkillInput] = useState('');
  const [targetRole, setTargetRole] = useState('Full Stack SDE');

  // Applied Jobs Tracking
  const [appliedJobs, setAppliedJobs] = useState(() => getLocalData('applied_jobs', ['job-6']));
  
  // Navigation tabs: 'recommended' or 'custom'
  const [activeTab, setActiveTab] = useState('recommended');

  // Job Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState('All');
  
  // Modal for Job Details
  const [selectedJob, setSelectedJob] = useState(null);

  // Custom JD tab states
  const [customJd, setCustomJd] = useState('');
  const [customResult, setCustomResult] = useState(null);
  const [customLoading, setCustomLoading] = useState(false);

  // Skill management
  const addSkill = () => {
    const trimmed = newSkillInput.trim();
    if (!trimmed) return;
    if (studentSkills.some(s => s.toLowerCase() === trimmed.toLowerCase())) {
      toast.warning('Skill is already added');
      return;
    }
    const updated = [...studentSkills, trimmed];
    setStudentSkills(updated);
    setLocalData('student_skills', updated);
    setNewSkillInput('');
    toast.success(`Added "${trimmed}" to your profile skills`);
  };

  const removeSkill = (skillToRemove) => {
    const updated = studentSkills.filter(s => s !== skillToRemove);
    setStudentSkills(updated);
    setLocalData('student_skills', updated);
  };

  // Compute Job Match Percentage for each job dynamically
  const jobsWithMatch = useMemo(() => {
    const lowerStudentSkills = studentSkills.map(s => s.toLowerCase());

    return DEFAULT_JOBS.map(job => {
      const required = job.requiredSkills;
      const matched = required.filter(req => 
        lowerStudentSkills.some(us => us.includes(req.toLowerCase()) || req.toLowerCase().includes(us))
      );
      const missing = required.filter(req => !matched.includes(req));
      const percentage = Math.round((matched.length / required.length) * 100);

      return {
        ...job,
        matchPercentage: Math.max(percentage, 25),
        matchedSkills: matched,
        missingSkills: missing
      };
    });
  }, [studentSkills]);

  // Filter recommended jobs
  const filteredJobs = useMemo(() => {
    let list = jobsWithMatch;
    if (tierFilter !== 'All') {
      list = list.filter(j => j.tier.toLowerCase().includes(tierFilter.toLowerCase()));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(j => 
        j.company.toLowerCase().includes(q) || 
        j.role.toLowerCase().includes(q) ||
        j.location.toLowerCase().includes(q) ||
        j.requiredSkills.some(s => s.toLowerCase().includes(q))
      );
    }
    // Sort by match percentage descending
    return list.sort((a, b) => b.matchPercentage - a.matchPercentage);
  }, [jobsWithMatch, tierFilter, searchQuery]);

  // Apply to Job
  const handleApply = (job) => {
    if (appliedJobs.includes(job.id)) {
      toast.info(`You have already applied for ${job.role} at ${job.company}`);
      return;
    }
    const updated = [...appliedJobs, job.id];
    setAppliedJobs(updated);
    setLocalData('applied_jobs', updated);
    toast.success(`Application submitted to ${job.company} for ${job.role}!`);
    if (selectedJob?.id === job.id) {
      setSelectedJob(prev => ({ ...prev, isApplied: true }));
    }
  };

  // Custom JD Analyzer
  const analyzeCustomJd = () => {
    if (!customJd.trim()) return;
    setCustomLoading(true);
    setTimeout(() => {
      const jdLower = customJd.toLowerCase();
      const userSkills = studentSkills.map(s => s.toLowerCase());
      const jdKeywords = [
        'java', 'python', 'react', 'javascript', 'sql', 'html', 'css', 'node', 
        'spring', 'aws', 'docker', 'kubernetes', 'git', 'rest', 'api', 
        'mongodb', 'typescript', 'c++', 'algorithms', 'data structures', 'linux', 'system design'
      ];
      const requiredSkills = jdKeywords.filter(k => jdLower.includes(k));
      const matched = requiredSkills.filter(s => userSkills.some(us => us.includes(s) || s.includes(us)));
      const missing = requiredSkills.filter(s => !matched.includes(s));
      const matchPct = requiredSkills.length ? Math.round((matched.length / requiredSkills.length) * 100) : 65;

      setCustomResult({
        matchPct: Math.max(matchPct, 30),
        matched: matched.length > 0 ? matched : ['Java', 'SQL', 'Git'],
        missing: missing.length > 0 ? missing : ['Docker', 'AWS', 'System Design'],
        recommendations: [
          ...missing.slice(0, 3).map(s => `Build a project demonstrating ${s.toUpperCase()}`),
          'Align your resume headline with the keywords in this job description',
          'Practice topic-specific mock interview questions'
        ]
      });
      setCustomLoading(false);
    }, 800);
  };

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1><span className="gradient-text">Job Matcher</span></h1>
          <p>AI-driven placement matching tailored to your student profile, skills, and target roles</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            className={`btn ${activeTab === 'recommended' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            onClick={() => setActiveTab('recommended')}
          >
            <Sparkles size={14} /> Recommended Jobs ({DEFAULT_JOBS.length})
          </button>
          <button
            className={`btn ${activeTab === 'custom' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            onClick={() => setActiveTab('custom')}
          >
            <FileText size={14} /> Custom JD Analyzer
          </button>
        </div>
      </div>

      {/* Student Profile & Skills Hub Banner */}
      <div className="card mb-6" style={{ background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.95))', border: '1px solid var(--border-hover)', padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              background: 'var(--accent-glow)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '2px solid var(--accent-primary)'
            }}>
              <UserCheck size={22} color="var(--accent-primary)" />
            </div>
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Active Student Profile: <span style={{ color: 'var(--accent-primary)' }}>{targetRole}</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Target Batch: 2026 • 7 Verified Core Skills • Match Readiness: High
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              type="text"
              className="form-input"
              style={{ width: 180, padding: '6px 12px', fontSize: '0.82rem' }}
              placeholder="Add skill (e.g. Docker)..."
              value={newSkillInput}
              onChange={e => setNewSkillInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addSkill()}
            />
            <button className="btn btn-secondary btn-sm" onClick={addSkill} style={{ padding: '6px 12px' }}>
              <Plus size={14} /> Add
            </button>
          </div>
        </div>

        {/* Skill Chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginRight: 4 }}>Your Skills:</span>
          {studentSkills.map((skill, idx) => (
            <span
              key={idx}
              className="badge badge-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '5px 10px',
                fontSize: '0.8rem',
                borderRadius: 'var(--radius-sm)'
              }}
            >
              {skill}
              <X
                size={12}
                style={{ cursor: 'pointer', opacity: 0.8 }}
                onClick={() => removeSkill(skill)}
              />
            </span>
          ))}
        </div>
      </div>

      {/* TAB 1: RECOMMENDED JOBS */}
      {activeTab === 'recommended' && (
        <>
          {/* Filters & Search Toolbar */}
          <div className="card mb-6" style={{ padding: 18 }}>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
                <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  id="job-search-input"
                  className="form-input"
                  style={{ paddingLeft: 38 }}
                  placeholder="Search jobs by role, company, or technology..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                {['All', 'Tier 1', 'Product', 'FinTech', 'Digital'].map(tier => (
                  <button
                    key={tier}
                    className={`btn btn-sm ${tierFilter === tier ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ fontSize: '0.8rem', padding: '6px 14px' }}
                    onClick={() => setTierFilter(tier)}
                  >
                    {tier}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Job Cards Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {filteredJobs.length === 0 ? (
              <div className="empty-state">
                <Briefcase size={48} />
                <h3>No jobs found matching your criteria</h3>
                <p>Try clearing your search query or selecting "All" categories</p>
              </div>
            ) : (
              filteredJobs.map(job => {
                const isApplied = appliedJobs.includes(job.id);
                const isHighMatch = job.matchPercentage >= 75;
                const matchBadgeColor = isHighMatch ? 'var(--success)' : job.matchPercentage >= 50 ? 'var(--warning)' : 'var(--error)';

                return (
                  <div
                    key={job.id}
                    id={`job-card-${job.id}`}
                    className="card card-hover"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      padding: 22,
                      border: isHighMatch ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border)',
                      gap: 16
                    }}
                  >
                    {/* Top Row: Company, Role, Match % */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                        <div style={{
                          width: 48, height: 48, borderRadius: 'var(--radius-md)',
                          background: 'var(--bg-tertiary)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 800, fontSize: '1.2rem', color: '#fff', flexShrink: 0
                        }}>
                          {job.company.charAt(0)}
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                            <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)' }}>{job.role}</span>
                            <span className="badge badge-primary" style={{ fontSize: '0.72rem' }}>{job.tier}</span>
                          </div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 2, display: 'flex', gap: 12, alignItems: 'center' }}>
                            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{job.company}</span>
                            <span>•</span>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><MapPin size={13} /> {job.location}</span>
                            <span>•</span>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--success)', fontWeight: 600 }}>
                              <DollarSign size={13} /> {job.ctc}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Match Percentage Badge */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        background: 'var(--bg-glass)',
                        padding: '8px 16px',
                        borderRadius: 'var(--radius-md)',
                        border: `1px solid ${matchBadgeColor}40`
                      }}>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: matchBadgeColor }}>
                            {job.matchPercentage}%
                          </div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                            Profile Match
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Middle Row: Matched vs Missing Skills */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center', fontSize: '0.85rem' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Matched Skills:</span>
                        {job.matchedSkills.length > 0 ? (
                          job.matchedSkills.map((s, i) => (
                            <span key={i} className="badge badge-success" style={{ fontSize: '0.75rem', padding: '3px 8px' }}>
                              ✓ {s}
                            </span>
                          ))
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>None yet</span>
                        )}
                      </div>

                      {job.missingSkills.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Recommended to learn:</span>
                          {job.missingSkills.map((s, i) => (
                            <span key={i} className="badge badge-warning" style={{ fontSize: '0.75rem', padding: '3px 8px' }}>
                              + {s}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Bottom Action Row */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderTop: '1px solid var(--border)',
                      paddingTop: 14,
                      flexWrap: 'wrap',
                      gap: 12
                    }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        Eligibility: {job.eligibility}
                      </span>

                      <div style={{ display: 'flex', gap: 10 }}>
                        <button
                          id={`btn-view-job-${job.id}`}
                          className="btn btn-secondary btn-sm"
                          style={{ display: 'inline-flex', gap: 6 }}
                          onClick={() => setSelectedJob(job)}
                        >
                          <BookOpen size={14} /> View Details
                        </button>
                        <button
                          id={`btn-apply-job-${job.id}`}
                          className={`btn ${isApplied ? 'btn-secondary' : 'btn-primary'} btn-sm`}
                          style={{ display: 'inline-flex', gap: 6, minWidth: 100, justifyContent: 'center' }}
                          onClick={() => handleApply(job)}
                        >
                          {isApplied ? (
                            <><Check size={14} color="var(--success)" /> Applied</>
                          ) : (
                            <>Apply Now <ArrowRight size={14} /></>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}

      {/* TAB 2: CUSTOM JD ANALYZER */}
      {activeTab === 'custom' && (
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          {!customResult ? (
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ marginBottom: 8, fontSize: '1.2rem' }}>Analyze Any Job Description</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 20, fontSize: '0.9rem' }}>
                Paste the text of any job posting (LinkedIn, Naukri, Indeed) to evaluate how well your profile matches and see tailored recommendations.
              </p>

              <div className="form-group mb-6">
                <label className="form-label">Full Job Description</label>
                <textarea
                  id="custom-jd-textarea"
                  className="form-textarea"
                  rows={8}
                  placeholder="Paste the job requirements, responsibilities, and qualifications here..."
                  value={customJd}
                  onChange={e => setCustomJd(e.target.value)}
                />
              </div>

              <button
                id="btn-analyze-custom-jd"
                className="btn btn-primary btn-full btn-lg"
                onClick={analyzeCustomJd}
                disabled={customLoading || !customJd.trim()}
              >
                <Briefcase size={18} /> {customLoading ? 'Analyzing Keywords & Match...' : 'Analyze Job Match'}
              </button>
            </div>
          ) : (
            <div>
              {/* Score Gauge */}
              <div className="card text-center mb-6" style={{ maxWidth: 440, margin: '0 auto 24px', padding: 24 }}>
                <div style={{
                  width: 100, height: 100, borderRadius: '50%',
                  background: customResult.matchPct >= 70 ? 'var(--success-bg)' : 'var(--warning-bg)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 16px',
                  border: `3px solid ${customResult.matchPct >= 70 ? 'var(--success)' : 'var(--warning)'}`
                }}>
                  <span style={{ fontSize: '2rem', fontWeight: 800, color: customResult.matchPct >= 70 ? 'var(--success)' : 'var(--warning)' }}>
                    {customResult.matchPct}%
                  </span>
                </div>
                <h3>{customResult.matchPct >= 70 ? 'Strong Match! Ready to Apply' : 'Moderate Match — Skill Gaps Found'}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Evaluated against your active profile skills
                </p>
              </div>

              <div className="grid-2 mb-6" style={{ gap: 20 }}>
                <div className="card">
                  <h4 style={{ color: 'var(--success)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <CheckCircle size={16} /> Matching Skills ({customResult.matched.length})
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {customResult.matched.map((s, i) => (
                      <span key={i} className="badge badge-success">{s}</span>
                    ))}
                  </div>
                </div>

                <div className="card">
                  <h4 style={{ color: 'var(--error)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <XCircle size={16} /> Missing Keywords ({customResult.missing.length})
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {customResult.missing.map((s, i) => (
                      <span key={i} className="badge badge-error">{s}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="card mb-6">
                <h4 style={{ marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <BookOpen size={16} color="var(--accent-primary)" /> Recommendations to Boost Interview Calls
                </h4>
                {customResult.recommendations.map((r, i) => (
                  <div key={i} style={{ padding: '10px 14px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-sm)', marginBottom: 8, fontSize: '0.85rem', display: 'flex', gap: 10, alignItems: 'center' }}>
                    <ArrowRight size={14} color="var(--accent-primary)" style={{ flexShrink: 0 }} />
                    <span style={{ color: 'var(--text-secondary)' }}>{r}</span>
                  </div>
                ))}
              </div>

              <button className="btn btn-secondary btn-full" onClick={() => { setCustomResult(null); setCustomJd(''); }}>
                ← Analyze Another Job
              </button>
            </div>
          )}
        </div>
      )}

      {/* Job Details Modal */}
      {selectedJob && (
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
              padding: '18px 24px',
              background: 'var(--bg-secondary)',
              borderBottom: '1px solid var(--border)'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{selectedJob.role}</h3>
                <div style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
                  {selectedJob.company} • {selectedJob.location}
                </div>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setSelectedJob(null)}>
                ✕ Close
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: 24, overflowY: 'auto', flex: 1 }}>
              <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
                <span className="badge badge-primary">{selectedJob.tier}</span>
                <span className="badge badge-success">{selectedJob.ctc}</span>
                <span className="badge badge-info">{selectedJob.type}</span>
                <span className="badge badge-warning">Match: {selectedJob.matchPercentage}%</span>
              </div>

              <h4 style={{ marginBottom: 8 }}>Role Overview</h4>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 20 }}>
                {selectedJob.description}
              </p>

              <h4 style={{ marginBottom: 8 }}>Key Responsibilities</h4>
              <ul style={{ paddingLeft: 20, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 20 }}>
                {selectedJob.responsibilities.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>

              <h4 style={{ marginBottom: 8 }}>Required Tech Stack & Skills</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
                {selectedJob.requiredSkills.map((s, i) => (
                  <span key={i} className="badge badge-primary" style={{ padding: '4px 10px' }}>{s}</span>
                ))}
              </div>

              <h4 style={{ marginBottom: 8 }}>Eligibility Criteria</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', background: 'var(--bg-glass)', padding: 12, borderRadius: 'var(--radius-md)' }}>
                {selectedJob.eligibility}
              </p>
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
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Posted {selectedJob.posted}
              </span>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-secondary btn-sm" onClick={() => setSelectedJob(null)}>
                  Close
                </button>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => handleApply(selectedJob)}
                >
                  {appliedJobs.includes(selectedJob.id) ? '✓ Applied' : 'Submit Application'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
