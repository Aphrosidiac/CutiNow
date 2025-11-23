import React, { useEffect, useState } from 'react';
import api from '../../api';

interface Request {
  id: number;
  start_date: string;
  end_date: string;
  days_count: number;
  status: string;
  reason: string;
  file_path: string | null;
  User: {
    full_name: string;
    email: string;
  };
  LeaveType: {
    name: string;
  };
}

const AdminLeaveRequests: React.FC = () => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [remarks, setRemarks] = useState('');
  const [action, setAction] = useState<'approved' | 'rejected' | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = () => {
    api.get('/leaves/admin').then(res => setRequests(res.data)).catch(console.error);
  };

  const handleActionClick = (req: Request, act: 'approved' | 'rejected') => {
    setSelectedRequest(req);
    setAction(act);
    setRemarks('');
  };

  const handleSubmit = async () => {
    if (!selectedRequest || !action) return;
    try {
      await api.put(`/leaves/${selectedRequest.id}/status`, {
        status: action,
        admin_remarks: remarks
      });
      setSelectedRequest(null);
      setAction(null);
      fetchRequests();
    } catch (error) {
      console.error(error);
      alert('Failed to update status');
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Manage Leave Requests</h2>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-900 font-semibold border-b">
              <tr>
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Dates</th>
                <th className="px-6 py-4">Days</th>
                <th className="px-6 py-4">Reason</th>
                <th className="px-6 py-4">Document</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {requests.map(req => (
                <tr key={req.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{req.User.full_name}</div>
                    <div className="text-xs text-gray-500">{req.User.email}</div>
                  </td>
                  <td className="px-6 py-4">{req.LeaveType.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{req.start_date} <br/><span className="text-xs text-gray-400">to</span> {req.end_date}</td>
                  <td className="px-6 py-4">{req.days_count}</td>
                  <td className="px-6 py-4 max-w-xs truncate" title={req.reason}>{req.reason || '-'}</td>
                  <td className="px-6 py-4">
                    {req.file_path ? (
                      <a
                        href={`/${req.file_path}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        View
                      </a>
                    ) : '-'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize
                      ${req.status === 'approved' ? 'bg-green-100 text-green-700' :
                        req.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {req.status === 'pending' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleActionClick(req, 'approved')}
                          className="text-green-600 hover:text-green-800 font-medium"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleActionClick(req, 'rejected')}
                          className="text-red-600 hover:text-red-800 font-medium"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      {selectedRequest && action && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4 capitalize">{action} Request</h3>
            <p className="mb-4 text-gray-600">
              Are you sure you want to {action} the leave request for <b>{selectedRequest.User.full_name}</b>?
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Remarks (Optional)</label>
              <textarea
                className="w-full border rounded px-3 py-2"
                rows={3}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              ></textarea>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => { setSelectedRequest(null); setAction(null); }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className={`px-4 py-2 text-white rounded capitalize ${action === 'approved' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
              >
                Confirm {action}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminLeaveRequests;
