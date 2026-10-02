import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UploadCloud, FileText, X, FileSearch } from 'lucide-react';

const Upload = () => {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

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
        setError('Please upload a valid PDF file.');
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
        setError('Please upload a valid PDF file.');
      }
    }
  };

  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a resume to upload.');
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('resume', file);
    if (jobDescription.trim()) {
      formData.append('jobDescription', jobDescription);
    }

    try {
      const res = await axios.post('/resume/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      navigate(`/analysis/${res.data._id}`);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'An error occurred during analysis. Make sure your PDF is text-based.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-pearl flex flex-col items-center justify-center p-4 font-sans text-brand-ink">
        <div className="bg-brand-white p-12 border border-gray-200 flex flex-col items-center max-w-lg w-full text-center">
          <div className="relative mb-8 mt-4">
            <div className="absolute inset-0 animate-ping bg-brand-pearl opacity-50"></div>
            <div className="relative bg-brand-ink p-5 text-brand-white">
              <FileSearch size={40} className="animate-pulse" />
            </div>
          </div>
          <h2 className="text-2xl font-display font-bold mb-4 tracking-tight">Auditing Resume Structure...</h2>
          <p className="text-gray-500 mb-2 leading-relaxed">
            Our engine is parsing your experience, extracting skills, and generating an objective ATS score.
          </p>
          <p className="text-xs text-gray-400 uppercase tracking-widest mt-6 font-medium">
            Estimated time: 5-10s
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-pearl py-12 px-4 sm:px-6 lg:px-8 font-sans text-brand-ink">
      <div className="max-w-3xl mx-auto bg-brand-white border border-gray-200 shadow-audit">
        <div className="px-8 py-10 sm:p-14">
          <div className="mb-10 text-left border-b border-gray-100 pb-8">
            <h1 className="text-3xl font-display font-bold tracking-tight">New Analysis</h1>
            <p className="mt-2 text-gray-600">
              Submit your document for a structural audit and ATS compatibility check.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label className="block text-sm font-bold mb-3 uppercase tracking-wider text-gray-500">
                Resume Document (PDF)
              </label>
              
              {!file ? (
                <div
                  className={`mt-1 flex justify-center px-6 pt-12 pb-12 border-2 border-dashed transition-colors cursor-pointer
                    ${isDragActive ? 'border-brand-emerald bg-brand-pearl' : 'border-gray-300 hover:border-brand-ink hover:bg-brand-pearl'}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="space-y-3 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center bg-gray-100">
                      <UploadCloud className="h-6 w-6 text-gray-600" />
                    </div>
                    <div className="flex flex-col text-sm justify-center items-center mt-4">
                      <span className="font-bold text-brand-ink focus-within:outline-none underline decoration-2 underline-offset-4 cursor-pointer hover:text-brand-emerald transition-colors">
                        Click to upload
                      </span>
                      <p className="pt-2 text-gray-500">or drag and drop your file here</p>
                    </div>
                    <p className="text-xs text-gray-400 font-medium">Maximum size: 5MB</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between p-5 border border-brand-emerald bg-brand-emerald/5 transition-all">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-brand-emerald/10 text-brand-emerald">
                      <FileText className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-brand-ink truncate max-w-[200px] sm:max-w-xs">{file.name}</p>
                      <p className="text-xs text-gray-500 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={removeFile}
                    className="p-2 text-gray-400 hover:text-brand-coral transition-colors focus:outline-none"
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
              <label htmlFor="jobDescription" className="block text-sm font-bold mb-3 uppercase tracking-wider text-gray-500 flex items-center justify-between">
                <span>Target Job Description</span>
                <span className="text-gray-400 font-normal normal-case tracking-normal">Optional</span>
              </label>
              <textarea
                id="jobDescription"
                name="jobDescription"
                rows={6}
                className="block w-full text-sm border-gray-300 border p-5 transition-colors focus:border-brand-ink focus:ring-0 resize-none outline-none bg-brand-pearl/30"
                placeholder="Paste the job description here to audit your alignment with the role's specific requirements..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
            </div>

            {error && (
              <div className="bg-brand-coral/10 p-4 border-l-4 border-brand-coral">
                <div className="flex items-start">
                  <div className="ml-3">
                    <h3 className="text-sm font-bold text-brand-coral">Upload failed</h3>
                    <div className="mt-1 text-sm text-brand-ink/80">
                      <p>{error}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-8 flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="bg-brand-white py-3 px-6 border border-gray-300 text-sm font-bold text-brand-ink hover:bg-gray-50 focus:outline-none transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!file || loading}
                className={`inline-flex justify-center py-3 px-8 border border-transparent text-sm font-bold text-brand-white bg-brand-ink hover:bg-black focus:outline-none transition-colors ${
                  (!file || loading) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                Run Audit
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Upload;
