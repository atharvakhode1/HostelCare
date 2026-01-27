import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import Navbar from '../components/Navbar';

function ReportItem() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    itemName: '',
    description: '',
    location: '',
    status: 'lost',
    contactInfo: user?.phone || '',
  });
  const [files, setFiles] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length > 3) {
      setError('Maximum 3 images allowed');
      return;
    }
    setFiles(selectedFiles);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('itemName', formData.itemName);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('location', formData.location);
      formDataToSend.append('status', formData.status);
      formDataToSend.append('contactInfo', formData.contactInfo);

      files.forEach((file) => {
        formDataToSend.append('images', file);
      });

      await api.post('/lostfound', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      navigate('/lost-found');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to report item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Report Lost/Found Item</h1>
          <p className="text-gray-600 mb-6">Help reunite people with their belongings</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Status Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Item Status <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label
                  className={`border-2 rounded-lg p-4 cursor-pointer transition ${
                    formData.status === 'lost'
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <input
                    type="radio"
                    name="status"
                    value="lost"
                    checked={formData.status === 'lost'}
                    onChange={handleChange}
                    className="hidden"
                  />
                  <div className="text-center">
                    <div className="text-4xl mb-2">😢</div>
                    <div className="font-semibold">I Lost Something</div>
                    <div className="text-sm text-gray-600">Report a missing item</div>
                  </div>
                </label>

                <label
                  className={`border-2 rounded-lg p-4 cursor-pointer transition ${
                    formData.status === 'found'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <input
                    type="radio"
                    name="status"
                    value="found"
                    checked={formData.status === 'found'}
                    onChange={handleChange}
                    className="hidden"
                  />
                  <div className="text-center">
                    <div className="text-4xl mb-2">😊</div>
                    <div className="font-semibold">I Found Something</div>
                    <div className="text-sm text-gray-600">Report a found item</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Item Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Item Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="itemName"
                value={formData.itemName}
                onChange={handleChange}
                placeholder="e.g., Black Wallet, Blue Water Bottle, ID Card"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the item in detail (color, brand, distinctive features, etc.)"
                rows="4"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location {formData.status === 'lost' ? '(Where you lost it)' : '(Where you found it)'}{' '}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., Mess Hall, Library, Block 1 Corridor"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Contact Info */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="contactInfo"
                value={formData.contactInfo}
                onChange={handleChange}
                placeholder="Your phone number"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Images (Optional)
              </label>
              <input
                type="file"
                onChange={handleFileChange}
                multiple
                accept="image/*"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-sm text-gray-500 mt-2">Maximum 3 images, up to 10MB each</p>
              {files.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-medium text-gray-700">Selected files:</p>
                  <ul className="list-disc list-inside text-sm text-gray-600">
                    {files.map((file, index) => (
                      <li key={index}>{file.name}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Auto-filled Info */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">Auto-filled Information:</h3>
              <div className="text-sm text-blue-800">
                <p>📍 Hostel: <strong>{user?.hostel}</strong></p>
              </div>
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
                {loading ? 'Submitting...' : 'Report Item'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/lost-found')}
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

export default ReportItem;