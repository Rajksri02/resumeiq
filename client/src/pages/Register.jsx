import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BarChart2 } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(name, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register');
    }
  };

  return (
    <div className="min-h-screen bg-brand-pearl flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans text-brand-ink">
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
        <div className="bg-brand-ink p-2 mb-6">
          <BarChart2 className="w-8 h-8 text-brand-white" />
        </div>
        <h2 className="text-center text-3xl font-display font-bold tracking-tight">ResumeIQ</h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Create a new account
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-brand-white py-10 px-8 border border-gray-200 shadow-audit sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-brand-coral/10 border-l-4 border-brand-coral text-brand-coral px-4 py-3 font-bold text-sm">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-bold uppercase tracking-wider text-gray-500 mb-2">Full Name</label>
              <div className="mt-1">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 focus:outline-none focus:border-brand-ink focus:ring-0 sm:text-sm transition-colors bg-brand-pearl/30"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold uppercase tracking-wider text-gray-500 mb-2">Email address</label>
              <div className="mt-1">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 focus:outline-none focus:border-brand-ink focus:ring-0 sm:text-sm transition-colors bg-brand-pearl/30"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold uppercase tracking-wider text-gray-500 mb-2">Password</label>
              <div className="mt-1">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 focus:outline-none focus:border-brand-ink focus:ring-0 sm:text-sm transition-colors bg-brand-pearl/30"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold text-brand-white bg-brand-ink hover:bg-black focus:outline-none transition-colors"
              >
                REGISTER
              </button>
            </div>
          </form>
          
          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <Link to="/login" className="text-sm font-bold text-gray-500 hover:text-brand-ink transition-colors uppercase tracking-wider">
              Already have an account? Sign in.
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
