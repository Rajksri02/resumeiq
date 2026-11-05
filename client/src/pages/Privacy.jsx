import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Database, Ban, Trash2, FileText, Check, Server, ExternalLink } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import { GEMINI_TIER_NOTICE } from '../config/privacy';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-700 dark:text-slate-300 pb-20 transition-colors duration-200">
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 transition-colors">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              to="/upload"
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              title="Return to upload"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="pl-4 border-l border-slate-200 dark:border-slate-700">
              <h1 className="text-lg font-bold text-slate-900 dark:text-white">Privacy &amp; Data Transparency</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono font-bold uppercase tracking-wider">
                ResumeIQ Privacy Policy
              </p>
            </div>
          </div>
          <ThemeToggle showLabel={true} />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-10">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 sm:p-12 shadow-xl space-y-10 transition-colors">
          
          {/* Top Banner */}
          <div className="flex items-center space-x-3 pb-6 border-b border-slate-200 dark:border-slate-800">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl shrink-0">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                PRIVACY_MANIFESTO
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-0.5">
                How We Protect &amp; Handle Your Data
              </h2>
            </div>
          </div>

          {/* Section 1: What is Stored */}
          <section className="space-y-4">
            <div className="flex items-center space-x-2 text-slate-900 dark:text-white font-bold text-lg font-mono uppercase tracking-wide">
              <Database className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h3>1. What We Store</h3>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed font-sans">
              ResumeIQ only stores the minimum data required to deliver your structural ATS audits, keyword matching, and history ledger:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 p-5 rounded-2xl space-y-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-500/20">
                  ACCOUNT_INFO
                </span>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">Email &amp; Profile</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
                  Your email address and name to identify your account and send password reset tokens. Passwords are encrypted with salted bcrypt hashing.
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 p-5 rounded-2xl space-y-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-500/20">
                  EXTRACTED_TEXT
                </span>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">Extracted Text</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
                  Plain text extracted from your PDF resume in memory. Temporary PDF files are immediately deleted from disk after text extraction.
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 p-5 rounded-2xl space-y-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-500/20">
                  AUDIT_RESULTS
                </span>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">Analysis &amp; Rewrites</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
                  The structured audit results (ATS score estimate, keyword extractions, weaknesses, suggestions, and bullet rewrite proposals).
                </p>
              </div>
            </div>
          </section>

          {/* Section 2: Third Parties */}
          <section className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center space-x-2 text-slate-900 dark:text-white font-bold text-lg font-mono uppercase tracking-wide">
              <Server className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h3>2. Third Parties</h3>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed font-sans">
              ResumeIQ uses established cloud infrastructure and services to run the application. Below are the third-party providers we use and what each receives:
            </p>
            <div className="space-y-3 pt-1">
              {/* Google Gemini API */}
              <div className="p-5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Google (Gemini API)</span>
                    <span className="text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded">
                      AI PROCESSING
                    </span>
                  </h4>
                  <a
                    href="https://ai.google.dev/gemini-api/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-xs font-mono text-emerald-600 dark:text-emerald-400 hover:underline gap-1"
                  >
                    <span>Google Gemini API Terms</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
                  <strong>Receives:</strong> Extracted resume text and your target job description to evaluate structural ATS compatibility, extract skills tokens, and generate bullet point rewrites.
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-400/90 leading-relaxed font-sans bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl">
                  {GEMINI_TIER_NOTICE} Don't upload sensitive or confidential details, and consider removing your phone number and address first. For full details on Google's data handling practices and user rights, please consult the{' '}
                  <a
                    href="https://ai.google.dev/gemini-api/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline font-semibold hover:text-amber-800 dark:hover:text-amber-300"
                  >
                    Google Gemini API Terms of Service
                  </a>.
                </p>
              </div>

              {/* MongoDB Atlas */}
              <div className="p-5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl space-y-1.5">
                <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>MongoDB Atlas</span>
                  <span className="text-[10px] font-mono uppercase bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded">
                    DATABASE STORAGE
                  </span>
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
                  <strong>Receives:</strong> User account credentials (name, email, salted bcrypt password hashes), extracted resume text, audit timestamps, and structured analysis results. Stored in a MongoDB Atlas database until deleted by the user.
                </p>
              </div>

              {/* Render */}
              <div className="p-5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl space-y-1.5">
                <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Render</span>
                  <span className="text-[10px] font-mono uppercase bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded">
                    BACKEND HOSTING
                  </span>
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
                  <strong>Receives:</strong> Inbound HTTPS API requests, authorization tokens, and uploaded resume files. Temporary files on the server disk are immediately deleted after text extraction.
                </p>
              </div>

              {/* Vercel */}
              <div className="p-5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl space-y-1.5">
                <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Vercel</span>
                  <span className="text-[10px] font-mono uppercase bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded">
                    FRONTEND HOSTING
                  </span>
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
                  <strong>Receives:</strong> Web browser requests to serve the frontend client application. Collects standard edge CDN delivery logs (IP address, browser user-agent, request timestamps).
                </p>
              </div>

              {/* Email Provider */}
              <div className="p-5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl space-y-2">
                <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Mailtrap</span>
                  <span className="text-[10px] font-mono uppercase bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded">
                    TRANSACTIONAL EMAIL
                  </span>
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
                  <strong>Receives:</strong> Your email address and a temporary password reset token, used strictly to deliver a password reset email when account recovery is requested.
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-400/90 leading-relaxed font-sans bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-xl">
                  In this demo, password-reset emails go to a test inbox and don't reach real mailboxes.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3: Nothing is Sold */}
          <section className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center space-x-2 text-slate-900 dark:text-white font-bold text-lg font-mono uppercase tracking-wide">
              <Ban className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h3>3. Nothing is Sold</h3>
            </div>
            <div className="bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-500/30 p-6 rounded-2xl space-y-3">
              <ul className="space-y-2.5 text-sm text-slate-700 dark:text-slate-300 font-sans">
                <li className="flex items-start">
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mr-2.5 mt-0.5 shrink-0 stroke-[3]" />
                  <span><strong>Zero Third-Party Monetization:</strong> We do not sell, rent, trade, or monetize your resume text, email address, or personal data to recruiters, employers, or data brokers.</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mr-2.5 mt-0.5 shrink-0 stroke-[3]" />
                  <span><strong>No Ad Tracking:</strong> ResumeIQ contains no behavioral ad trackers, tracking pixels, or cross-site commercial analytics.</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Section 4: How to Delete Your Data */}
          <section className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center space-x-2 text-slate-900 dark:text-white font-bold text-lg font-mono uppercase tracking-wide">
              <Trash2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h3>4. How to Delete Your Data</h3>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed font-sans">
              You maintain complete ownership and control over your data. We provide two straightforward ways to permanently delete your information:
            </p>
            <div className="space-y-3 pt-1">
              <div className="p-5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl flex items-start space-x-4">
                <div className="p-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl shrink-0 mt-0.5">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white font-mono uppercase tracking-wide">
                    Option A: Discard Individual Audits
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed font-sans">
                    Navigate to any individual audit report from your Dashboard and click the <strong className="text-rose-600 dark:text-rose-400 font-mono">[ DISCARD ]</strong> button in the top header. This immediately and permanently deletes that resume record and its extracted text from our database.
                  </p>
                </div>
              </div>

              <div className="p-5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl flex items-start space-x-4">
                <div className="p-2 bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl shrink-0 mt-0.5">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white font-mono uppercase tracking-wide">
                    Option B: Full Account &amp; Data Deletion
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed font-sans">
                    On your <strong>Dashboard</strong>, scroll to the bottom and click <strong className="text-rose-600 dark:text-rose-400 font-mono">Delete my account</strong>. Confirm with your current account password. This securely and irreversibly wipes your user profile, all historical resume audits, and all associated extracted text from our database.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Bottom Actions */}
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
              LAST_UPDATED: NOVEMBER 2026
            </span>
            <div className="flex items-center space-x-3">
              <Link
                to="/upload"
                className="inline-flex items-center px-5 py-2.5 text-xs font-mono font-bold text-slate-950 bg-emerald-500 hover:bg-emerald-400 rounded-xl transition-all shadow-sm tracking-wider uppercase focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              >
                RETURN TO UPLOAD
              </Link>
              <Link
                to="/dashboard"
                className="inline-flex items-center px-4 py-2.5 text-xs font-mono font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl transition-colors tracking-wider uppercase focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              >
                DASHBOARD
              </Link>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Privacy;

