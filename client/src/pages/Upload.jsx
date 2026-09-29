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
      
      // Navigate to analysis page on success
      navigate(`/analysis/${res.data._id}`);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'An error occurred during analysis. Make sure your PDF is text-based and not a scanned image.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg flex flex-col items-center max-w-md w-full text-center">
          <div className="relative mb-8 mt-4">
            <div className="absolute inset-0 animate-ping rounded-full bg-blue-100"></div>
            <div className="relative bg-blue-600 rounded-full p-5 text-white shadow-md">
              <FileSearch size={48} className="animate-pulse" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Analyzing your resume...</h2>
          <p className="text-gray-500 mb-2">
            Our AI is reading your experience, calculating your ATS score, and generating feedback.
          </p>
          <p className="text-sm text-gray-400">
            This usually takes 5-10 seconds.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-8 sm:p-10">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">New Analysis</h1>
            <p className="mt-3 text-sm text-gray-600">
              Upload your resume and optional job description to get instant, AI-powered feedback.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resume (PDF only)
              </label>
              
              {!file ? (
                <div
                  className={`mt-1 flex justify-center px-6 pt-10 pb-10 border-2 border-dashed rounded-xl transition-all duration-200 cursor-pointer
                    ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="space-y-2 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                      <UploadCloud className="h-8 w-8 text-gray-500" />
                    </div>
                    <div className="flex text-sm text-gray-600 justify-center items-center mt-4">
                      <span className="relative rounded-md font-semibold text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                        Upload a file
                      </span>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PDF up to 5MB</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 border rounded-xl bg-blue-50/50 border-blue-200 transition-all shadow-sm">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-blue-100/50 rounded-lg">
                      <FileText className="h-7 w-7 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 truncate max-w-[200px] sm:max-w-xs">{file.name}</p>
                      <p className="text-xs text-gray-500 font-medium">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={removeFile}
                    className="p-2 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 focus:outline-none transition-colors"
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
              <label htmlFor="jobDescription" className="block text-sm font-medium text-gray-700 mb-2">
                Job Description <span className="text-gray-400 font-normal">(Optional, but recommended)</span>
              </label>
              <textarea
                id="jobDescription"
                name="jobDescription"
                rows={5}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-xl border p-4 transition-colors resize-none"
                placeholder="Paste the job description here to see how well your resume matches..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 p-4 border border-red-100">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-0.5">
                    <X className="h-5 w-5 text-red-500" aria-hidden="true" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Upload failed</h3>
                    <div className="mt-1 text-sm text-red-700">
                      <p>{error}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-6 flex justify-end space-x-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="bg-white py-2.5 px-5 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!file || loading}
                className={`inline-flex justify-center py-2.5 px-6 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${
                  (!file || loading) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                Analyze Resume
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Upload;
