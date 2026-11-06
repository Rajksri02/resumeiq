import { Link } from 'react-router-dom';
import { Check, AlertTriangle, ArrowLeft, Sparkles, UserCheck, ShieldCheck } from 'lucide-react';
import ScoreGauge from '../components/ScoreGauge';
import SkillBadge from '../components/SkillBadge';
import FeedbackAccordion from '../components/FeedbackAccordion';
import RewriteSuggestions from '../components/RewriteSuggestions';
import ThemeToggle from '../components/ThemeToggle';
import useDocumentTitle from '../hooks/useDocumentTitle';

const SAMPLE_ANALYSIS = {
  fileName: 'Jane_Doe_Resume_2026.pdf',
  createdAt: '2026-11-02T10:00:00.000Z',
  targetRole: 'Senior Full-Stack Engineer',
  candidate: {
    name: 'Jane Doe',
    email: 'jane.doe@example.com',
    title: 'Senior Full-Stack Engineer'
  },
  analysis: {
    atsScore: 82,
    overallSummary:
      'Strong full-stack engineering profile demonstrating deep expertise across modern TypeScript, React, Node.js, and cloud deployments. The resume showcases clear architectural ownership, clean modular structure, and solid distributed systems fundamentals. Minor defects include unquantified test automation outcomes and passive phrasing in earlier project descriptions.',
    matchedSkills: [
      'REACT',
      'NODE.JS',
      'TYPESCRIPT',
      'TAILWIND CSS',
      'EXPRESS.JS',
      'POSTGRESQL',
      'DOCKER',
      'REST APIS',
      'GIT',
      'CI/CD'
    ],
    missingSkills: [
      'GRAPHQL',
      'KUBERNETES',
      'REDIS'
    ],
    strengths: [
      'Strong technical vocabulary featuring active engineering verbs (Architected, Engineered, Implemented, Deployed) across recent roles.',
      'Clear technological stack cohesion centered on enterprise React, TypeScript, and Node.js microservices.',
      'Consistent reverse-chronological layout with standardized section headers that parse cleanly through ATS scanners.',
      'Comprehensive coverage of software development lifecycle including testing, containerization, and automated deployments.'
    ],
    weaknesses: [
      'Passive phrasing detected in earlier experience bullets (e.g., "Responsible for developing the customer dashboard").',
      'Unquantified impact on core infrastructure initiatives—features are described without baseline latency or coverage metrics.',
      'Missing target keywords for high-throughput caching (Redis) and container orchestration (Kubernetes).'
    ],
    suggestions: [
      'Replace passive openers with active technical verbs (e.g., replace "Responsible for developing" with "Engineered").',
      'Add verifiable engineering metrics to project bullets where performance or testing benchmarks were measured.',
      'Incorporate missing keywords (Redis, Kubernetes, GraphQL) into your skills list if you have hands-on project experience with them.',
      'Ensure contact details remain at the top in simple text format with your verified LinkedIn and GitHub profiles.'
    ],
    sectionFeedback: {
      summary:
        'Professional and concise. Clearly states 5+ years of full-stack engineering experience with target frontend and backend technologies. Avoid subjective buzzwords like "hard-working visionary".',
      experience:
        'Recent role descriptions are well-organized with clear bullet hierarchies. Ensure older roles match the same active verb density and eliminate passive opening phrases.',
      education:
        'B.S. in Computer Science cleanly presented with graduation year and relevant coursework.',
      skills:
        'Well-categorized into Languages, Frameworks, Databases, and Tools with standard naming conventions for clear token categorization across parsers.',
      formatting:
        'Clean single-column layout with consistent margins and standardized section headings. Free of tables, text boxes, or graphics that impede linear text extraction.'
    }
  },
  rewrites: [
    {
      section: 'EXPERIENCE',
      original:
        'Responsible for developing the customer dashboard using React, Tailwind CSS, and TypeScript to ensure a seamless user experience.',
      improved:
        'Engineered the customer dashboard using React, Tailwind CSS, and TypeScript.',
      reason:
        "Replaces passive phrasing 'Responsible for developing' with active technical verb and eliminates subjective filler clause 'to ensure a seamless user experience'."
    }
  ],
  metricPrompts: [
    {
      section: 'EXPERIENCE',
      original:
        'Designed and implemented end-to-end automated test suites using Playwright for core authentication and checkout workflows.',
      prompt:
        "Did you track test coverage? If so: '...achieving [N]% test coverage across critical paths.'"
    }
  ],
  rewritesNote: '',
  note: '',
  rewritesGeneratedAt: '2026-11-02T10:00:00.000Z'
};

const Demo = () => {
  useDocumentTitle('Sample Report Demo');
  const analysis = SAMPLE_ANALYSIS;
  const result = analysis.analysis;
  const hasSkillsData = result.matchedSkills?.length > 0 || result.missingSkills?.length > 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-700 dark:text-slate-300 pb-16 transition-colors duration-200">
      {/* Top Banner: Public Sample Notice with Sign-up CTA */}
      <aside aria-label="Demo notice" className="bg-emerald-500/10 dark:bg-emerald-500/15 border-b border-emerald-500/30 px-4 py-3 sm:px-6 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center space-x-2 text-emerald-900 dark:text-emerald-200 text-xs sm:text-sm font-medium">
            <Sparkles className="w-4 h-4 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>
              Sample report from a fictional resume. Create a free account to analyze your own.
            </span>
          </div>
          <Link
            to="/register"
            className="inline-flex items-center justify-center px-4 py-2 min-h-[44px] text-xs font-mono font-bold text-slate-950 bg-emerald-500 hover:bg-emerald-400 rounded-xl transition-all shadow-sm tracking-wider uppercase focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            CREATE FREE ACCOUNT
          </Link>
        </div>
      </aside>

      {/* Header Bar */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link
                to="/"
                className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                title="Return home"
                aria-label="Return home"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="pl-3 sm:pl-4 border-l border-slate-200 dark:border-slate-700">
                <div className="flex items-center space-x-2">
                  <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate max-w-[130px] xs:max-w-[180px] sm:max-w-md md:max-w-lg lg:max-w-xl">
                    {analysis.fileName}
                  </h1>
                  <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                    SAMPLE_PREVIEW
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-mono font-bold uppercase tracking-wider mt-0.5 flex items-center space-x-2">
                  <span>CANDIDATE: {analysis.candidate.name} &lt;{analysis.candidate.email}&gt;</span>
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <ThemeToggle showLabel={true} />
              <Link
                to="/register"
                className="hidden sm:inline-flex items-center justify-center px-3.5 py-2 min-h-[44px] text-xs font-mono font-bold text-slate-950 bg-emerald-500 hover:bg-emerald-400 rounded-xl transition-colors shadow-sm tracking-wider uppercase focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Analysis Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Rail: Hero Score & Skills */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-white dark:bg-slate-800 shadow-sm hover:shadow-md p-6 border border-slate-200 dark:border-slate-700 rounded-2xl transition-all">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 border-b border-slate-200 dark:border-slate-700 pb-4 flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Audit Result</span>
              </h2>
              <ScoreGauge score={result.atsScore} />
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-6 leading-relaxed border-t border-slate-200 dark:border-slate-700 pt-4">
                An AI estimate of how well your resume may parse and match a job. It is not a result from a real applicant tracking system.
              </p>
            </div>

            {hasSkillsData && (
              <div className="bg-white dark:bg-slate-800 shadow-sm hover:shadow-md border border-slate-200 dark:border-slate-700 p-6 rounded-2xl transition-all">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-5 pb-3 border-b border-slate-200 dark:border-slate-700">Keyword Extraction</h2>
                
                {result.matchedSkills?.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-500 uppercase tracking-widest mb-3 flex items-center">
                      <Check className="w-3 h-3 mr-1 stroke-[3]" /> VERIFIED_TOKENS
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {result.matchedSkills.map((skill, i) => (
                        <SkillBadge key={`match-${i}`} skill={skill} type="match" />
                      ))}
                    </div>
                  </div>
                )}
                
                {result.missingSkills?.length > 0 && (
                  <div>
                    <h3 className="text-xs font-mono font-bold text-amber-600 dark:text-amber-500 uppercase tracking-widest mb-3 flex items-center">
                      <AlertTriangle className="w-3 h-3 mr-1 stroke-[2.5]" /> MISSING_TOKENS
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {result.missingSkills.map((skill, i) => (
                        <SkillBadge key={`miss-${i}`} skill={skill} type="missing" />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Quick Demo Watermark Card */}
            <div className="bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl">
              <div className="flex items-center space-x-2 text-slate-900 dark:text-white font-bold text-sm mb-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Zero Storage &amp; Safe Demo</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
                This sample is static. It makes no analysis requests and uses no AI quota.
              </p>
            </div>
          </div>

          {/* Right Rail: Detailed Breakdown */}
          <div className="lg:col-span-8 space-y-8">
            
            <div className="bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 p-5 sm:p-8 rounded-2xl border-t-4 border-t-emerald-500 transition-all">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Executive Summary</h2>
              <p className="text-base sm:text-lg text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                {result.overallSummary}
              </p>
            </div>
            
            {/* Strengths & Weaknesses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white dark:bg-slate-800 shadow-sm border border-emerald-300 dark:border-emerald-500/30 p-5 sm:p-6 rounded-2xl transition-all">
                <div className="flex items-center mb-6 pb-3 border-b border-emerald-100 dark:border-emerald-500/10">
                  <h2 className="text-lg font-bold text-emerald-700 dark:text-emerald-400">Structural Strengths</h2>
                </div>
                <ul className="space-y-4">
                  {result.strengths?.map((strength, i) => (
                    <li key={i} className="flex items-start">
                      <div className="flex-shrink-0 mt-0.5 bg-emerald-50 dark:bg-emerald-500/10 p-1 mr-3 rounded-md">
                        <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 stroke-[3]" />
                      </div>
                      <span className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white dark:bg-slate-800 shadow-sm border border-amber-300 dark:border-amber-500/30 p-5 sm:p-6 rounded-2xl transition-all">
                <div className="flex items-center mb-6 pb-3 border-b border-amber-100 dark:border-amber-500/10">
                  <h2 className="text-lg font-bold text-amber-700 dark:text-amber-400">Critical Issues</h2>
                </div>
                <ul className="space-y-4">
                  {result.weaknesses?.map((weakness, i) => (
                    <li key={i} className="flex items-start">
                      <div className="flex-shrink-0 mt-0.5 bg-amber-50 dark:bg-amber-500/10 p-1 mr-3 rounded-md">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 stroke-[3]" />
                      </div>
                      <span className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">{weakness}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Actionable Suggestions */}
            <div className="bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 p-5 sm:p-8 rounded-2xl transition-all">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 pb-4 border-b border-slate-200 dark:border-slate-700">Remediation Plan</h2>
              <div className="pl-2">
                <ol className="space-y-5">
                  {result.suggestions?.map((suggestion, i) => (
                    <li key={i} className="flex items-start font-sans">
                      <span className="flex-shrink-0 text-sm font-mono font-black text-slate-400 dark:text-slate-500 w-8 pt-0.5">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="text-slate-700 dark:text-slate-300 text-base leading-relaxed">{suggestion}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {/* Section Feedback */}
            <div className="bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 p-5 sm:p-8 rounded-2xl transition-all">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 pb-4 border-b border-slate-200 dark:border-slate-700">Section Audit</h2>
              <div className="space-y-3">
                {result.sectionFeedback && Object.entries(result.sectionFeedback).map(([section, feedback]) => (
                  <FeedbackAccordion key={section} section={section} feedback={feedback} />
                ))}
              </div>
            </div>

            {/* Rewrite Suggestions */}
            <RewriteSuggestions
              resumeId="demo-sample"
              initialData={{
                rewrites: analysis.rewrites,
                metricPrompts: analysis.metricPrompts,
                rewritesNote: analysis.rewritesNote,
                note: analysis.note || analysis.rewritesNote,
                rewritesGeneratedAt: analysis.rewritesGeneratedAt
              }}
              isDemo={true}
            />

          </div>
        </div>

        {/* Bottom CTA Section with Sign-Up Button */}
        <section aria-labelledby="cta-heading" className="mt-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-12 shadow-xl text-center max-w-4xl mx-auto transition-all relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600"></div>
          
          <div className="mx-auto flex h-16 w-16 items-center justify-center bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl mb-6 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
            <UserCheck className="w-8 h-8" />
          </div>
          
          <h2 id="cta-heading" className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">
            Ready to audit your own resume?
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto text-sm sm:text-base mb-8 leading-relaxed font-sans">
            Create a free account to upload your PDF resume, benchmark against real job descriptions, and unlock tailored ATS enhancements and bullet rewrites.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 min-h-[44px] text-sm font-mono font-bold text-slate-950 bg-emerald-500 hover:bg-emerald-400 rounded-xl transition-all shadow-lg hover:shadow-emerald-500/25 tracking-wider uppercase focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              CREATE A FREE ACCOUNT
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 min-h-[44px] text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 border border-slate-300 dark:border-slate-700 rounded-xl transition-colors uppercase tracking-wider focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
            >
              Sign In
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Demo;
