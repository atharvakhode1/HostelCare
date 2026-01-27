import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import IssueCard from '../components/IssueCard';
import Navbar from '../components/Navbar';

function Dashboard() {
  const { user } = useAuth();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    status: '',
    category: '',
    priority: '',
  });

  useEffect(() => {
    fetchIssues();
  }, [filter]);

  const fetchIssues = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter.status) params.append('status', filter.status);
      if (filter.category) params.append('category', filter.category);
      if (filter.priority) params.append('priority', filter.priority);

      const response = await api.get(`/issues?${params.toString()}`);
      setIssues(response.data.issues);
    } catch (error) {
      console.error('Error fetching issues:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {user?.role === 'student' && 'My Issues & Public Issues'}
            {user?.role === 'staff' && 'Assigned Issues'}
            {user?.role === 'management' && 'All Issues'}
          </h1>
          <p className="text-gray-600">
            Welcome back, {user?.name}! Here's what's happening.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filter.status}
                onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="reported">Reported</option>
                <option value="assigned">Assigned</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={filter.category}
                onChange={(e) => setFilter({ ...filter, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                <option value="plumbing">Plumbing</option>
                <option value="electrical">Electrical</option>
                <option value="cleanliness">Cleanliness</option>
                <option value="internet">Internet</option>
                <option value="furniture">Furniture</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                value={filter.priority}
                onChange={(e) => setFilter({ ...filter, priority: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="emergency">Emergency</option>
              </select>
            </div>
          </div>
        </div>

        {/* Issues Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-xl text-gray-600">Loading issues...</div>
          </div>
        ) : issues.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <div className="text-6xl mb-4">📭</div>
            <div className="text-xl text-gray-600">No issues found</div>
            <p className="text-gray-500 mt-2">
              {user?.role === 'student'
                ? 'Create your first issue to get started!'
                : 'No issues match your current filters.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {issues.map((issue) => (
              <IssueCard key={issue._id} issue={issue} />
            ))}
          </div>
        )}

        {/* Stats */}
        {!loading && issues.length > 0 && (
          <div className="mt-8 bg-white p-6 rounded-lg shadow">
            <h3 className="font-semibold text-lg mb-4">Quick Stats</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{issues.length}</div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {issues.filter((i) => i.status === 'reported').length}
                </div>
                <div className="text-sm text-gray-600">Reported</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {issues.filter((i) => i.status === 'assigned').length}
                </div>
                <div className="text-sm text-gray-600">Assigned</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {issues.filter((i) => i.status === 'in-progress').length}
                </div>
                <div className="text-sm text-gray-600">In Progress</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {issues.filter((i) => i.status === 'resolved' || i.status === 'closed').length}
                </div>
                <div className="text-sm text-gray-600">Resolved</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;