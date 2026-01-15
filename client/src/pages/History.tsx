import React, { useEffect, useState } from 'react';
import api from '../api';

interface Request {
  id: string;
  start_date: string;
  end_date: string;
  days_count: number;
  status: string;
  reason: string;
  admin_remarks: string;
  leave_types: {
    name: string;
  };
}

const History: React.FC = () => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('/leaves');
        console.log('Leave history:', res.data);
        setRequests(res.data);
      } catch (err: any) {
        console.error('History fetch error:', err);
        setError(err.message || 'Failed to load history');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-yellow-600 bg-yellow-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        <p><strong>Error:</strong> {error}</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-gray-800">My Leave History</h2>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-900 font-semibold border-b">
              <tr>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Period</th>
                <th className="px-6 py-4">Days</th>
                <th className="px-6 py-4">Reason</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-400">No history found.</td>
                </tr>
              ) : (
                requests.map(req => (
                  <tr key={req.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">{req.leave_types?.name || 'Unknown'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{req.start_date} <br /><span className="text-xs text-gray-400">to</span> {req.end_date}</td>
                    <td className="px-6 py-4">{req.days_count}</td>
                    <td className="px-6 py-4 max-w-xs truncate" title={req.reason}>{req.reason || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(req.status)} capitalize`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate text-gray-500" title={req.admin_remarks}>
                      {req.admin_remarks || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default History;
