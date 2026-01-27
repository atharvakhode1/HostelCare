import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import Navbar from '../components/Navbar';

function LostFound() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [claimingItem, setClaimingItem] = useState(null);

  useEffect(() => {
    fetchItems();
  }, [filter]);

  const fetchItems = async () => {
    try {
      const params = filter ? `?status=${filter}` : '';
      const response = await api.get(`/lostfound${params}`);
      setItems(response.data.items);
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async (itemId) => {
    try {
      setClaimingItem(itemId);
      await api.post(`/lostfound/${itemId}/claim`);
      alert('Claim request submitted! The reporter will be notified.');
      fetchItems();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to claim item');
    } finally {
      setClaimingItem(null);
    }
  };

  const handleApproveClaim = async (itemId, claimId, status) => {
    try {
      await api.patch(`/lostfound/${itemId}/claim/${claimId}`, { status });
      alert(`Claim ${status}!`);
      fetchItems();
    } catch (error) {
      alert('Failed to update claim');
    }
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    try {
      await api.delete(`/lostfound/${itemId}`);
      setItems(items.filter(item => item._id !== itemId));
    } catch (error) {
      alert('Failed to delete item');
    }
  };

  const statusColors = {
    lost: 'bg-red-100 text-red-800',
    found: 'bg-green-100 text-green-800',
    claimed: 'bg-blue-100 text-blue-800',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Lost & Found</h1>
            <p className="text-gray-600 mt-2">Report or claim lost items</p>
          </div>
          <Link
            to="/report-item"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            + Report Item
          </Link>
        </div>

        {/* Filter */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex gap-3">
            <button
              onClick={() => setFilter('')}
              className={`px-4 py-2 rounded-lg transition ${
                filter === ''
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Items
            </button>
            <button
              onClick={() => setFilter('lost')}
              className={`px-4 py-2 rounded-lg transition ${
                filter === 'lost'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Lost
            </button>
            <button
              onClick={() => setFilter('found')}
              className={`px-4 py-2 rounded-lg transition ${
                filter === 'found'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Found
            </button>
            <button
              onClick={() => setFilter('claimed')}
              className={`px-4 py-2 rounded-lg transition ${
                filter === 'claimed'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Claimed
            </button>
          </div>
        </div>

        {/* Items Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-xl text-gray-600">Loading items...</div>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <div className="text-6xl mb-4">🔍</div>
            <div className="text-xl text-gray-600">No items found</div>
            <p className="text-gray-500 mt-2">Be the first to report an item!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => {
              const isMyItem = item.reportedBy._id === user?.id;
              const canManage = user?.role === 'management' || isMyItem;

              return (
                <div key={item._id} className="bg-white rounded-lg shadow hover:shadow-lg transition">
                  {/* Image */}
                  {item.images && item.images.length > 0 && (
                    <img
                      src={item.images[0]}
                      alt={item.itemName}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                  )}

                  <div className="p-4">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-bold text-lg">{item.itemName}</h3>
                      <span className={`text-xs px-2 py-1 rounded ${statusColors[item.status]}`}>
                        {item.status}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>

                    {/* Location & Date */}
                    <div className="text-sm text-gray-500 space-y-1 mb-3">
                      <p>📍 Location: <strong>{item.location}</strong></p>
                      <p>🏠 Hostel: <strong>{item.hostel}</strong></p>
                      <p>📅 {new Date(item.createdAt).toLocaleDateString()}</p>
                    </div>

                    {/* Reporter Info */}
                    <div className="text-sm text-gray-600 mb-3 pb-3 border-b">
                      <p>Reported by: <strong>{item.reportedBy.name}</strong></p>
                      {item.contactInfo && <p>📞 {item.contactInfo}</p>}
                    </div>

                    {/* Actions */}
                    <div className="space-y-2">
                      {/* Claim Button */}
                      {item.status !== 'claimed' && !isMyItem && (
                        <button
                          onClick={() => handleClaim(item._id)}
                          disabled={claimingItem === item._id}
                          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
                        >
                          {claimingItem === item._id ? 'Claiming...' : '✋ Claim This Item'}
                        </button>
                      )}

                      {/* Claim Requests (for item owner or management) */}
                      {canManage && item.claimRequests && item.claimRequests.length > 0 && (
                        <div className="bg-yellow-50 p-3 rounded-lg">
                          <p className="font-semibold text-sm mb-2">
                            Claim Requests ({item.claimRequests.length}):
                          </p>
                          <div className="space-y-2">
                            {item.claimRequests.map((claim) => (
                              <div key={claim._id} className="bg-white p-2 rounded text-sm">
                                <p className="font-medium">{claim.claimedBy.name}</p>
                                <p className="text-xs text-gray-600">{claim.claimedBy.phone}</p>
                                {claim.status === 'pending' && (
                                  <div className="flex gap-2 mt-2">
                                    <button
                                      onClick={() => handleApproveClaim(item._id, claim._id, 'approved')}
                                      className="flex-1 bg-green-600 text-white py-1 px-2 rounded text-xs hover:bg-green-700"
                                    >
                                      ✓ Approve
                                    </button>
                                    <button
                                      onClick={() => handleApproveClaim(item._id, claim._id, 'rejected')}
                                      className="flex-1 bg-red-600 text-white py-1 px-2 rounded text-xs hover:bg-red-700"
                                    >
                                      ✗ Reject
                                    </button>
                                  </div>
                                )}
                                {claim.status !== 'pending' && (
                                  <span className={`text-xs ${claim.status === 'approved' ? 'text-green-600' : 'text-red-600'}`}>
                                    {claim.status}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Delete Button */}
                      {canManage && (
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="w-full text-red-600 hover:text-red-700 text-sm py-2"
                        >
                          🗑️ Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default LostFound;