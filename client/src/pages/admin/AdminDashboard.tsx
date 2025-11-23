import React, { useEffect, useState } from 'react';
import api from '../../api';
import { Users, FileText, CheckSquare } from 'lucide-react';

interface Request {
  id: number;
  status: string;
}

const AdminDashboard: React.FC = () => {
  const [requests, setRequests] = useState<Request[]>([]);

  useEffect(() => {
    api.get('/leaves/admin').then(res => setRequests(res.data)).catch(console.error);
  }, []);

  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const approvedCount = requests.filter(r => r.status === 'approved').length;
  const totalCount = requests.length;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Admin Overview</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">Pending Requests</p>
            <p className="text-3xl font-bold text-orange-500">{pendingCount}</p>
          </div>
          <ClockIcon className="text-orange-200" size={40} />
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">Approved Requests</p>
            <p className="text-3xl font-bold text-green-600">{approvedCount}</p>
          </div>
          <CheckSquare className="text-green-200" size={40} />
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Applications</p>
            <p className="text-3xl font-bold text-blue-600">{totalCount}</p>
          </div>
          <FileText className="text-blue-200" size={40} />
        </div>
      </div>
    </div>
  );
};

const ClockIcon = ({ className, size }: { className?: string, size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
)

export default AdminDashboard;
