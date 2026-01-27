import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import Navbar from '../components/Navbar';

function Announcements() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await api.get('/announcements');
      setAnnouncements(response.data.announcements);
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;

    try {
      await api.delete(`/announcements/${id}`);
      setAnnouncements(announcements.filter(a => a._id !== id));
    } catch (error) {
      console.error('Error deleting announcement:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Announcements</h1>
            <p className="text-gray-600 mt-2">Stay updated with hostel news and notices</p>
          </div>
          {user?.role === 'management' && (
            <Link
              to="/create-announcement"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              + Create Announcement
            </Link>
          )}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="text-xl text-gray-600">Loading announcements...</div>
          </div>
        ) : announcements.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <div className="text-6xl mb-4">📢</div>
            <div className="text-xl text-gray-600">No announcements yet</div>
            <p className="text-gray-500 mt-2">Check back later for updates</p>
          </div>
        ) : (
          <div className="space-y-4">
            {announcements.map((announcement) => (
              <div
                key={announcement._id}
                className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-2xl font-bold text-gray-800">
                        {announcement.title}
                      </h2>
                      {announcement.isActive ? (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                          Active
                        </span>
                      ) : (
                        <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                          Inactive
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      By {announcement.createdBy?.name} ({announcement.createdBy?.role}) •{' '}
                      {new Date(announcement.createdAt).toLocaleDateString()} at{' '}
                      {new Date(announcement.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                  {user?.role === 'management' && (
                    <button
                      onClick={() => handleDelete(announcement._id)}
                      className="text-red-600 hover:text-red-700 text-sm ml-4"
                    >
                      🗑️ Delete
                    </button>
                  )}
                </div>

                <p className="text-gray-700 whitespace-pre-wrap mb-4">
                  {announcement.content}
                </p>

                <div className="flex flex-wrap gap-2">
                  {announcement.targetHostels && announcement.targetHostels.length > 0 && (
                    <div className="text-sm">
                      <span className="text-gray-600">📍 Hostels: </span>
                      <span className="text-gray-800 font-medium">
                        {announcement.targetHostels.join(', ')}
                      </span>
                    </div>
                  )}
                  {announcement.targetBlocks && announcement.targetBlocks.length > 0 && (
                    <div className="text-sm ml-4">
                      <span className="text-gray-600">🏢 Blocks: </span>
                      <span className="text-gray-800 font-medium">
                        {announcement.targetBlocks.join(', ')}
                      </span>
                    </div>
                  )}
                  {announcement.targetRoles && announcement.targetRoles.length > 0 && (
                    <div className="text-sm ml-4">
                      <span className="text-gray-600">👥 For: </span>
                      <span className="text-gray-800 font-medium capitalize">
                        {announcement.targetRoles.join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Announcements;