import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import Navbar from '../components/Navbar';

function CreateAnnouncement() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    targetHostels: [],
    targetBlocks: [],
    targetRoles: [],
  });

  const hostelOptions = ['Hostel A', 'Hostel B', 'Hostel C', 'Hostel D'];
  const roleOptions = ['student', 'staff', 'management'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCheckboxChange = (name, value) => {
    const currentArray = formData[name];
    if (currentArray.includes(value)) {
      setFormData({
        ...formData,
        [name]: currentArray.filter((item) => item !== value),
      });
    } else {
      setFormData({
        ...formData,
        [name]: [...currentArray, value],
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/announcements', formData);
      navigate('/announcements');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create announcement');
    } finally {
      setLoading(false);
    }
  };

  // Redirect if not management
  if (user?.role !== 'management') {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Create Announcement</h1>
          <p className="text-gray-600 mb-6">Post updates and notices for students</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Water Supply Interruption - Tomorrow 2-4 PM"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content <span className="text-red-500">*</span>
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                placeholder="Write the full announcement here..."
                rows="6"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Target Hostels */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Hostels (leave empty for all)
              </label>
              <div className="grid grid-cols-2 gap-3">
                {hostelOptions.map((hostel) => (
                  <label key={hostel} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.targetHostels.includes(hostel)}
                      onChange={() => handleCheckboxChange('targetHostels', hostel)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-gray-700">{hostel}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Target Blocks */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Blocks (optional)
              </label>
              <input
                type="text"
                value={formData.targetBlocks.join(', ')}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    targetBlocks: e.target.value.split(',').map((b) => b.trim()).filter(Boolean),
                  })
                }
                placeholder="e.g., Block 1, Block 2 (comma-separated)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Target Roles */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Roles (leave empty for all)
              </label>
              <div className="grid grid-cols-3 gap-3">
                {roleOptions.map((role) => (
                  <label key={role} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.targetRoles.includes(role)}
                      onChange={() => handleCheckboxChange('targetRoles', role)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-gray-700 capitalize">{role}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                💡 <strong>Tip:</strong> If you don't select any hostels/roles, the announcement
                will be visible to everyone.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400"
              >
                {loading ? 'Creating...' : 'Create Announcement'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/announcements')}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
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

export default CreateAnnouncement;