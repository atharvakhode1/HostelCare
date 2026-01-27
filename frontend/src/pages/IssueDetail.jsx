import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import Navbar from '../components/Navbar';

function IssueDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusData, setStatusData] = useState({ status: '', remarks: '' });

  useEffect(() => {
    fetchIssue();
  }, [id]);

  const fetchIssue = async () => {
    try {
      const response = await api.get(`/issues/${id}`);
      setIssue(response.data);
      setStatusData({ status: response.data.status, remarks: '' });
    } catch (error) {
      console.error('Error fetching issue:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = async () => {
    try {
      const response = await api.post(`/issues/${id}/upvote`);
      setIssue({
        ...issue,
        upvotes: response.data.hasUpvoted
          ? [...issue.upvotes, user.id]
          : issue.upvotes.filter(uid => uid !== user.id),
      });
    } catch (error) {
      console.error('Error upvoting:', error);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setSubmittingComment(true);
    try {
      const response = await api.post(`/issues/${id}/comment`, { text: comment });
      setIssue({ ...issue, comments: response.data.comments });
      setComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    setUpdatingStatus(true);
    try {
      const response = await api.patch(`/issues/${id}/status`, statusData);
      setIssue(response.data.issue);
      setStatusData({ ...statusData, remarks: '' });
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this issue?')) return;
    try {
      await api.delete(`/issues/${id}`);
      navigate('/');
    } catch (error) {
      console.error('Error deleting issue:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8 text-center text-xl">
          Loading...
        </div>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8 text-center text-xl text-red-600">
          Issue not found
        </div>
      </div>
    );
  }

  const priorityColors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    emergency: 'bg-red-100 text-red-800',
  };

  const statusColors = {
    reported: 'bg-blue-100 text-blue-800',
    assigned: 'bg-purple-100 text-purple-800',
    'in-progress': 'bg-yellow-100 text-yellow-800',
    resolved: 'bg-green-100 text-green-800',
    closed: 'bg-gray-100 text-gray-800',
  };

  const canUpdateStatus = user?.role === 'staff' || user?.role === 'management';
  const canDelete =
    user?.role === 'management' || issue.reportedBy?._id === user?.id;
  const hasUpvoted = issue.upvotes?.includes(user?.id);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <button
          onClick={() => navigate('/')}
          className="mb-4 text-blue-600 hover:text-blue-700"
        >
          ← Back to Dashboard
        </button>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <div className="flex justify-between mb-4">
            <h1 className="text-3xl font-bold">{issue.title}</h1>
            {canDelete && (
              <button
                onClick={handleDelete}
                className="text-red-600 hover:text-red-700"
              >
                🗑️ Delete
              </button>
            )}
          </div>

          <div className="flex gap-2 mb-4 flex-wrap">
            <span className={`px-3 py-1 rounded text-sm ${priorityColors[issue.priority]}`}>
              {issue.priority}
            </span>
            <span className={`px-3 py-1 rounded text-sm ${statusColors[issue.status] || ''}`}>
              {issue.status}
            </span>
            <span className="px-3 py-1 rounded text-sm bg-gray-100">
              {issue.category}
            </span>
          </div>

          <p className="mb-6 whitespace-pre-wrap">{issue.description}</p>

          {issue.media?.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Attachments</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {issue.media.map((url, index) => (
                  <a
                    key={index}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      src={url}
                      alt={`Attachment ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg hover:opacity-80"
                    />
                  </a>
                ))}
              </div>
            </div>
          )}

          {issue.isPublic && (
            <button
              onClick={handleUpvote}
              className={`px-4 py-2 rounded ${
                hasUpvoted ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}
            >
              👍 {issue.upvotes?.length || 0}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default IssueDetail;
