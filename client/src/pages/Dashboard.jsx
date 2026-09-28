import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-blue-600">ResumeIQ Dashboard</h1>
            </div>
            <div className="flex items-center">
              <span className="text-gray-700 mr-4">Welcome, {user?.name || user?.email}</span>
              <button
                onClick={logout}
                className="bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex flex-col items-center justify-center p-8 text-center bg-white">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">You are securely logged in!</h2>
            <p className="text-gray-500 max-w-md">
              This is a protected route. If you log out and try to access this page directly, you will be redirected to the login page.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
