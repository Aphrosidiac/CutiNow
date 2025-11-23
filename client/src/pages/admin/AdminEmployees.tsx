import React, { useEffect, useState } from 'react';
import api from '../../api';
import { Edit2, Save, X } from 'lucide-react';

interface User {
  id: number;
  full_name: string;
  email: string;
  role: string;
}

interface Balance {
  id: number;
  balance: number;
  LeaveType: {
    name: string;
  };
}

const AdminEmployees: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [balances, setBalances] = useState<Balance[]>([]);
  const [editMode, setEditMode] = useState<number | null>(null); // Balance ID being edited
  const [newBalance, setNewBalance] = useState<number>(0);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    api.get('/users').then(res => setUsers(res.data)).catch(console.error);
  };

  const handleManage = async (user: User) => {
    setSelectedUser(user);
    try {
      const res = await api.get(`/users/${user.id}/balances`);
      setBalances(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSaveBalance = async (balanceId: number) => {
    try {
      await api.put(`/users/balances/${balanceId}`, { balance: newBalance });
      const updatedBalances = balances.map(b => b.id === balanceId ? { ...b, balance: newBalance } : b);
      setBalances(updatedBalances);
      setEditMode(null);
    } catch (error) {
      console.error(error);
      alert('Failed to update balance');
    }
  };

  return (
    <div className="max-w-6xl">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Manage Employees</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* User List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-900 font-semibold border-b">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map(u => (
                <tr key={u.id} className={`hover:bg-gray-50 ${selectedUser?.id === u.id ? 'bg-blue-50' : ''}`}>
                  <td className="px-6 py-4 font-medium">{u.full_name}</td>
                  <td className="px-6 py-4">{u.email}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleManage(u)}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Balance Editor */}
        <div>
          {selectedUser ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold mb-4 text-gray-800">
                Balances for {selectedUser.full_name}
              </h3>
              <div className="space-y-4">
                {balances.map(b => (
                  <div key={b.id} className="flex items-center justify-between p-3 border rounded bg-gray-50">
                    <span className="font-medium text-gray-700">{b.LeaveType.name}</span>

                    <div className="flex items-center space-x-3">
                      {editMode === b.id ? (
                        <>
                          <input
                            type="number"
                            className="w-20 border rounded px-2 py-1 text-right"
                            value={newBalance}
                            onChange={(e) => setNewBalance(Number(e.target.value))}
                          />
                          <button onClick={() => handleSaveBalance(b.id)} className="text-green-600 hover:text-green-800">
                            <Save size={18} />
                          </button>
                          <button onClick={() => setEditMode(null)} className="text-red-600 hover:text-red-800">
                            <X size={18} />
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="text-lg font-bold text-gray-900">{b.balance}</span>
                          <button
                            onClick={() => {
                              setEditMode(b.id);
                              setNewBalance(b.balance);
                            }}
                            className="text-gray-400 hover:text-blue-600"
                          >
                            <Edit2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg border border-dashed border-gray-300 p-8 text-center text-gray-500">
              Select an employee to manage their leave balances.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AdminEmployees;
