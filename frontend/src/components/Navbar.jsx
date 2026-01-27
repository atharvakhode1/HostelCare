import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? 'bg-blue-700' : '';
  };

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-2xl font-bold">
            🏠 Hostel Tracker
          </Link>

          <div className="flex items-center gap-4">
            <Link
              to="/"
              className={`px-4 py-2 rounded hover:bg-blue-700 transition ${isActive('/')}`}
            >
              Dashboard
            </Link>

            {user?.role === 'student' && (
              <Link
                to="/create-issue"
                className={`px-4 py-2 rounded hover:bg-blue-700 transition ${isActive('/create-issue')}`}
              >
                Report Issue
              </Link>
            )}

            <Link
              to="/announcements"
              className={`px-4 py-2 rounded hover:bg-blue-700 transition ${isActive('/announcements')}`}
            >
              Announcements
            </Link>

            <Link
              to="/lost-found"
              className={`px-4 py-2 rounded hover:bg-blue-700 transition ${isActive('/lost-found')}`}
            >
              Lost & Found
            </Link>

            {user?.role === 'management' && (
              <Link
                to="/analytics"
                className={`px-4 py-2 rounded hover:bg-blue-700 transition ${isActive('/analytics')}`}
              >
                Analytics
              </Link>
            )}

            <div className="flex items-center gap-3 ml-4 pl-4 border-l border-blue-500">
              <div className="text-right">
                <div className="font-semibold">{user?.name}</div>
                <div className="text-xs text-blue-200 capitalize">{user?.role}</div>
              </div>
              <button
                onClick={logout}
                className="bg-red-500 px-4 py-2 rounded hover:bg-red-600 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;