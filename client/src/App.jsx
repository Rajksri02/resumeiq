import { useState } from 'react'

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl p-8 text-center">
        <h1 className="text-4xl font-bold text-blue-600 mb-4">ResumeIQ</h1>
        <p className="text-gray-600 text-lg mb-6">AI-powered resume analyzer</p>
        <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-lg p-4">
          <p>Client and Server are running successfully!</p>
        </div>
      </div>
    </div>
  )
}

export default App
