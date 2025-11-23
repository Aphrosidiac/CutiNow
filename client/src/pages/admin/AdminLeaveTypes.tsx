import React, { useEffect, useState } from 'react';
import api from '../../api';

interface LeaveType {
  id: number;
  name: string;
  default_days: number;
}

const AdminLeaveTypes: React.FC = () => {
  const [types, setTypes] = useState<LeaveType[]>([]);
  const [name, setName] = useState('');
  const [days, setDays] = useState(12);

  useEffect(() => {
    fetchTypes();
  }, []);

  const fetchTypes = () => {
    api.get('/leave-types').then(res => setTypes(res.data)).catch(console.error);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/leave-types', { name, default_days: days });
      setName('');
      setDays(12);
      fetchTypes();
    } catch (error) {
      console.error(error);
      alert('Failed to add leave type');
    }
  };

  return (
    <div className="max-w-4xl">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Manage Leave Types</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b bg-gray-50 font-semibold">Existing Types</div>
          <ul className="divide-y divide-gray-100">
            {types.map(t => (
              <li key={t.id} className="p-4 flex justify-between items-center hover:bg-gray-50">
                <span className="font-medium">{t.name}</span>
                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-sm">{t.default_days} days/year</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Add Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 h-fit">
          <h3 className="text-lg font-bold mb-4">Add New Type</h3>
          <form onSubmit={handleAdd}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Type Name</label>
              <input
                type="text"
                className="w-full border rounded px-3 py-2"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                placeholder="e.g. Maternity Leave"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Default Days</label>
              <input
                type="number"
                className="w-full border rounded px-3 py-2"
                value={days}
                onChange={e => setDays(Number(e.target.value))}
                required
                min={1}
              />
            </div>
            <button type="submit" className="w-full bg-primary text-white py-2 rounded hover:bg-blue-800 transition">
              Create Leave Type
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLeaveTypes;
