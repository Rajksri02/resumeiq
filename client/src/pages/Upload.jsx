import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UploadCloud, FileText, X } from 'lucide-react';

const Upload = () => {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // Terminal state
  const [terminalLines, setTerminalLines] = useState([]);
  const [isTerminalDone, setIsTerminalDone] = useState(false);
  const [terminalError, setTerminalError] = useState(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = () => {
    setIsDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'application/pdf') {
        setFile(droppedFile);
        setError(null);
      } else {
        setError('ERROR: INVALID_FORMAT. PDF REQUIRED.');
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile);
        setError(null);
      } else {
        setError('ERROR: INVALID_FORMAT. PDF REQUIRED.');
      }
    }
  };

  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const terminalSteps = [
    "> INITIATING_AUDIT...",
    "> EXTRACTING_TOKENS... [OK]",
    "> CROSS_REFERENCING_KEYWORDS... [OK]",
    "> RUNNING_DEEP_ANALYSIS"
  ];

  useEffect(() => {
    if (!loading || terminalError) return;
    
    let currentStep = 0;
    setTerminalLines([terminalSteps[0]]);
    
    const interval = setInterval(() => {
      currentStep++;
      if (currentStep < terminalSteps.length) {
        setTerminalLines(prev => [...prev, terminalSteps[currentStep]]);
      }
      if (currentStep === terminalSteps.length - 1) {
        setIsTerminalDone(true);
        clearInterval(interval);
      }
    }, 800);
    
    return () => clearInterval(interval);
  }, [loading, terminalError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('ERROR: NO_DOCUMENT_DETECTED');
      return;
    }

    setLoading(true);
    setError(null);
    setTerminalError(null);
    setTerminalLines([]);
    setIsTerminalDone(false);

    const formData = new FormData();
    formData.append('resume', file);
    if (jobDescription.trim()) {
      formData.append('jobDescription', jobDescription);
    }

    // 35 second timeout controller
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 35000);

    try {
      const res = await axios.post('/resume/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      navigate(`/analysis/${res.data._id}`);
    } catch (err) {
      clearTimeout(timeoutId);
      console.error(err);
      
      let errorMsg = '> ERROR: AUDIT_FAILED - UNKNOWN_ERROR';
      if (axios.isCancel(err) || err.name === 'CanceledError') {
        errorMsg = '> ERROR: TIMEOUT_EXCEEDED (35000ms)';
      } else if (err.response?.data?.message) {
        errorMsg = `> ERROR: [${err.response.status}] ${err.response.data.message.toUpperCase()}`;
      }
      
      setTerminalError(errorMsg);
      // Wait a moment then stop loading to let user retry
      setTimeout(() => {
        setLoading(false);
        setError(errorMsg.replace('> ERROR: ', ''));
      }, 4000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden rounded-xl">
          {/* Terminal Header */}
          <div className="bg-slate-800 px-4 py-3 border-b border-slate-700 flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-slate-600"></div>
            <div className="w-3 h-3 rounded-full bg-slate-600"></div>
            <div className="w-3 h-3 rounded-full bg-slate-600"></div>
            <span className="ml-2 text-xs font-mono text-slate-400 tracking-wider">audit_process.exe</span>
          </div>
          {/* Terminal Body */}
          <div className="p-8 font-mono text-sm sm:text-base space-y-3 min-h-[300px]">
            {terminalLines.map((line, i) => (
              <div key={i} className="text-emerald-400">
                {line}
              </div>
            ))}
            {isTerminalDone && !terminalError && (
              <div className="text-emerald-400 flex items-center mt-2">
                <span className="mr-2">&gt; AWAITING_SERVER_RESPONSE</span>
                <span className="animate-pulse w-2.5 h-5 bg-emerald-400 inline-block"></span>
              </div>
            )}
            {terminalError && (
              <div className="text-amber-500 mt-4 font-bold border-l-2 border-amber-500 pl-3">
                {terminalError}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
        <div className="px-8 py-10 sm:p-14">
          <div className="mb-10 text-left border-b border-slate-700 pb-8">
            <h1 className="text-3xl font-bold tracking-tight text-white">New Analysis</h1>
            <p className="mt-2 text-slate-400">
              Submit your document for a structural audit and ATS compatibility check.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label className="block text-sm font-bold mb-3 uppercase tracking-wider text-slate-400 font-mono">
                Resume Document (PDF)
              </label>
              
              {!file ? (
                <div
                  className={`mt-1 flex flex-col justify-center px-6 pt-12 pb-12 border-2 transition-all cursor-pointer rounded-xl
                    ${isDragActive ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'border-slate-600 bg-slate-800/50 hover:border-slate-500 hover:bg-slate-700/50'}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="space-y-3 text-center relative">
                    {/* Targeting Brackets */}
                    <div className={`absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 ${isDragActive ? 'border-emerald-500' : 'border-slate-500'}`}></div>
                    <div className={`absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 ${isDragActive ? 'border-emerald-500' : 'border-slate-500'}`}></div>
                    <div className={`absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 ${isDragActive ? 'border-emerald-500' : 'border-slate-500'}`}></div>
                    <div className={`absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 ${isDragActive ? 'border-emerald-500' : 'border-slate-500'}`}></div>
                    
                    <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full transition-colors ${isDragActive ? 'bg-emerald-500/20' : 'bg-slate-700'}`}>
                      <UploadCloud className={`h-6 w-6 ${isDragActive ? 'text-emerald-400' : 'text-slate-300'}`} />
                    </div>
                    <div className="flex flex-col text-sm justify-center items-center mt-4">
                      <span className={`font-mono font-bold tracking-wider transition-colors ${isDragActive ? 'text-emerald-400' : 'text-slate-300'}`}>
                        {isDragActive ? '[ TARGET_ACQUIRED ]' : '[ DROP_DOCUMENT_HERE ]'}
                      </span>
                      <p className="pt-2 text-slate-500 font-sans">or click to browse</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between p-5 border border-emerald-500/30 bg-emerald-500/5 rounded-xl transition-all">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg">
                      <FileText className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white font-mono truncate max-w-[200px] sm:max-w-xs">{file.name}</p>
                      <p className="text-xs text-slate-400 mt-1 font-mono tracking-wider">SIZE: {(file.size / 1024 / 1024).toFixed(2)}MB</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={removeFile}
                    className="p-2 text-slate-400 hover:text-amber-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-md"
                    title="Remove file"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              )}
              
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            <div>
              <label htmlFor="jobDescription" className="block text-sm font-bold mb-3 uppercase tracking-wider text-slate-400 flex items-center justify-between font-mono">
                <span>Target Job Description</span>
                <span className="text-slate-500 font-normal">OPTIONAL</span>
              </label>
              <textarea
                id="jobDescription"
                name="jobDescription"
                rows={6}
                className="block w-full text-sm border-slate-600 bg-slate-900 border p-5 transition-colors focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-none outline-none rounded-xl text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:border-transparent"
                placeholder="Paste the job description here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
            </div>

            {error && (
              <div className="bg-amber-400/10 p-4 border border-amber-400/30 rounded-xl">
                <div className="flex items-start font-mono">
                  <div>
                    <h3 className="text-sm font-bold text-amber-500">&gt; UPLOAD_ERROR</h3>
                    <div className="mt-1 text-sm text-amber-400/90">
                      <p>{error}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-8 flex justify-end space-x-4 border-t border-slate-700">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="py-3 px-6 text-sm font-bold text-slate-400 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!file || loading}
                className={`inline-flex justify-center py-3 px-8 text-sm font-bold text-slate-950 bg-emerald-500 hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 transition-colors rounded-xl font-mono tracking-wider ${
                  (!file || loading) ? 'opacity-50 cursor-not-allowed' : 'shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                }`}
              >
                [ RUN_AUDIT ]
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Upload;
