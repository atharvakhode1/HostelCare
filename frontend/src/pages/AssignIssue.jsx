import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import Navbar from '../components/Navbar';

function AssignIssue() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [issue, setIssue] = useState(null);
  const [staff, setStaff] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user?.role !== 'management') {
      navigate('/');
      return;
    }
    fetchData();
  }, [id, user, navigate]);

  const fetchData = async () => {
    try {
      const [issueRes, staffRes] = await Promise.all([
        api.get(`/issues/${id}`),
        api.get('/auth/staff'),
      ]);
      setIssue(issueRes.data);
      setStaff(staffRes.data);
      setSelectedStaff(issueRes.data.assignedTo?._id || '');
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedStaff) {
      alert('Please select a staff member');
      return;
    }

    setSubmitting(true);
    try {
      await api.patch(`/issues/${id}/assign`, { assignedTo: selectedStaff });
      navigate(`/issue/${id}`);
    } catch (error) {
      alert('Failed to assign issue');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8 text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <button
          onClick={() => navigate(`/issue/${id}`)}
          className="mb-4 text-blue-600 hover:text-blue-700"
        >
          ← Back to Issue
        </button>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Assign Issue to Staff</h1>

          {issue && (
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h3 className="font-semibold mb-2">Issue Details:</h3>
              <p className="text-lg font-medium">{issue.title}</p>
              <p className="text-sm text-gray-600 mt-1">{issue.description}</p>
            </div>
          )}

          <form onSubmit={handleAssign}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Staff Member
              </label>
              <select
                value={selectedStaff}
                onChange={(e) => setSelectedStaff(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">-- Select Staff --</option>
                {staff.map((member) => (
                  <option key={member._id} value={member._id}>
                    {member.name} - {member.hostel} ({member.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
              >
                {submitting ? 'Assigning...' : 'Assign Issue'}
              </button>
              <button
                type="button"
                onClick={() => navigate(`/issue/${id}`)}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AssignIssue;