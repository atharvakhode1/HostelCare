import { Link } from 'react-router-dom';

function IssueCard({ issue }) {
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

  const categoryEmojis = {
    plumbing: '🚰',
    electrical: '⚡',
    cleanliness: '🧹',
    internet: '📡',
    furniture: '🪑',
    other: '📋',
  };

  return (
    <Link to={`/issue/${issue._id}`}>
      <div className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition border border-gray-200">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{categoryEmojis[issue.category]}</span>
            <h3 className="font-semibold text-lg">{issue.title}</h3>
          </div>
          {issue.isPublic && (
            <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded">
              Public
            </span>
          )}
        </div>

        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{issue.description}</p>

        <div className="flex flex-wrap gap-2 mb-3">
          <span className={`text-xs px-2 py-1 rounded ${priorityColors[issue.priority]}`}>
            {issue.priority}
          </span>
          <span className={`text-xs px-2 py-1 rounded ${statusColors[issue.status]}`}>
            {issue.status}
          </span>
          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
            {issue.category}
          </span>
        </div>

        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>
            {issue.hostel} - {issue.block} {issue.room && `- Room ${issue.room}`}
          </span>
          <span>{new Date(issue.createdAt).toLocaleDateString()}</span>
        </div>

        {issue.upvotes && issue.upvotes.length > 0 && (
          <div className="mt-2 text-xs text-gray-600">
            👍 {issue.upvotes.length} {issue.upvotes.length === 1 ? 'upvote' : 'upvotes'}
          </div>
        )}
      </div>
    </Link>
  );
}

export default IssueCard;