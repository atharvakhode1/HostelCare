import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import Navbar from '../components/Navbar';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  ResponsiveContainer,
} from 'recharts';

function Analytics() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [trends, setTrends] = useState(null);

  useEffect(() => {
    if (user?.role !== 'management') {
      navigate('/');
      return;
    }
    fetchAnalytics();
    fetchTrends();
  }, [user, navigate]);

  const fetchAnalytics = async () => {
    try {
      const response = await api.get('/analytics/overview');
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrends = async () => {
    try {
      const response = await api.get('/analytics/trends?days=30');
      setTrends(response.data);
    } catch (error) {
      console.error('Error fetching trends:', error);
    }
  };

  if (user?.role !== 'management') {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="text-xl">Loading analytics...</div>
        </div>
      </div>
    );
  }

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  // Prepare data for charts
  const categoryData = analytics?.issuesByCategory || [];
  const priorityData = analytics?.issuesByPriority || [];
  const hostelData = analytics?.issuesByHostel || [];

  const statusData = Object.entries(analytics?.issuesByStatus || {}).map(([key, value]) => ({
    name: key,
    value: value,
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-2">Overview of hostel issues and performance metrics</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Issues</p>
                <p className="text-3xl font-bold text-blue-600">{analytics?.totalIssues || 0}</p>
              </div>
              <div className="text-4xl">📊</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Resolved Issues</p>
                <p className="text-3xl font-bold text-green-600">{analytics?.resolvedCount || 0}</p>
              </div>
              <div className="text-4xl">✅</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Avg Resolution Time</p>
                <p className="text-3xl font-bold text-orange-600">
                  {analytics?.avgResolutionTimeHours?.toFixed(1) || 0}h
                </p>
              </div>
              <div className="text-4xl">⏱️</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Resolution Rate</p>
                <p className="text-3xl font-bold text-purple-600">
                  {analytics?.totalIssues > 0
                    ? ((analytics.resolvedCount / analytics.totalIssues) * 100).toFixed(0)
                    : 0}
                  %
                </p>
              </div>
              <div className="text-4xl">📈</div>
            </div>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Issues by Status - Pie Chart */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Issues by Status</h2>
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-center py-12">No data available</p>
            )}
          </div>

          {/* Issues by Category - Bar Chart */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Issues by Category</h2>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-center py-12">No data available</p>
            )}
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Issues by Priority - Bar Chart */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Issues by Priority</h2>
            {priorityData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={priorityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="priority" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#F59E0B" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-center py-12">No data available</p>
            )}
          </div>

          {/* Issues by Hostel - Bar Chart */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Issues by Hostel</h2>
            {hostelData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={hostelData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hostel" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-center py-12">No data available</p>
            )}
          </div>
        </div>

        {/* Trends Chart */}
        {trends && trends.trends && trends.trends.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-bold mb-4">Issue Trends (Last 30 Days)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trends.trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="count" stroke="#8B5CF6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Issues by Block - Table */}
        {analytics?.issuesByBlock && analytics.issuesByBlock.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Issues by Block</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-2 text-left">Hostel</th>
                    <th className="px-4 py-2 text-left">Block</th>
                    <th className="px-4 py-2 text-right">Issue Count</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.issuesByBlock.map((block, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-2">{block.hostel}</td>
                      <td className="px-4 py-2">{block.block}</td>
                      <td className="px-4 py-2 text-right font-semibold">{block.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {analytics?.totalIssues === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <div className="text-6xl mb-4">📊</div>
            <div className="text-xl text-gray-600">No data available yet</div>
            <p className="text-gray-500 mt-2">Analytics will appear once issues are reported</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Analytics;