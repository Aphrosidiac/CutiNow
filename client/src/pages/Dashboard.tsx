import React, { useEffect, useState } from 'react';
import api from '../api';
import { CreditCard, Clock, CheckCircle, XCircle } from 'lucide-react';

interface Balance {
  id: number;
  balance: number;
  LeaveType: {
    name: string;
  };
}

interface Request {
  id: number;
  start_date: string;
  end_date: string;
  days_count: number;
  status: string;
  LeaveType: {
    name: string;
  };
}

const Dashboard: React.FC = () => {
  const [balances, setBalances] = useState<Balance[]>([]);
  const [recentRequests, setRecentRequests] = useState<Request[]>([]);

  useEffect(() => {
    // Fetch Balances
    api.get('/leaves/balances').then(res => setBalances(res.data)).catch(console.error);
    // Fetch History (limit to 5 for dashboard)
    api.get('/leaves').then(res => setRecentRequests(res.data.slice(0, 5))).catch(console.error);
  }, []);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'approved': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-yellow-600 bg-yellow-100';
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Dashboard</h2>

      {/* Balances Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {balances.map((item) => (
          <div key={item.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-700">{item.LeaveType.name}</h3>
              <CreditCard className="text-primary opacity-50" size={24} />
            </div>
            <p className="text-3xl font-bold text-gray-900">{item.balance} <span className="text-sm font-normal text-gray-500">days</span></p>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-800">Recent Applications</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-900 font-semibold border-b">
              <tr>
                <th className="px-6 py-4">Leave Type</th>
                <th className="px-6 py-4">Dates</th>
                <th className="px-6 py-4">Days</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentRequests.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-400">No leave applications found.</td>
                </tr>
              ) : (
                recentRequests.map(req => (
                  <tr key={req.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">{req.LeaveType.name}</td>
                    <td className="px-6 py-4">{req.start_date} to {req.end_date}</td>
                    <td className="px-6 py-4">{req.days_count}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(req.status)} capitalize`}>
                        {req.status}
                      </span>
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

export default Dashboard;
