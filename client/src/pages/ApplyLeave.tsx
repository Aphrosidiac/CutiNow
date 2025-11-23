import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import api from '../api';
import { useNavigate } from 'react-router-dom';

interface LeaveType {
  id: number;
  name: string;
}

const ApplyLeave: React.FC = () => {
  const [types, setTypes] = useState<LeaveType[]>([]);
  const [selectedType, setSelectedType] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [reason, setReason] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/leave-types').then(res => setTypes(res.data)).catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate || !selectedType) {
      setError('Please fill in all required fields');
      return;
    }

    const formData = new FormData();
    formData.append('leaveTypeId', selectedType);
    formData.append('start_date', startDate.toISOString());
    formData.append('end_date', endDate.toISOString());
    formData.append('reason', reason);
    if (file) {
      formData.append('document', file);
    }

    try {
      await api.post('/leaves', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      navigate('/history');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit application');
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Apply for Leave</h2>

      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">Leave Type</label>
          <select
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            required
          >
            <option value="">Select a type</option>
            {types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">Start Date</label>
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              dateFormat="yyyy-MM-dd"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">End Date</label>
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              dateFormat="yyyy-MM-dd"
              minDate={startDate || undefined}
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">Reason</label>
          <textarea
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Please explain why you need leave..."
          ></textarea>
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">Supporting Document (Optional)</label>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-primary hover:file:bg-blue-100"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-primary text-white px-6 py-2 rounded hover:bg-blue-800 transition"
          >
            Submit Application
          </button>
        </div>
      </form>
    </div>
  );
};

export default ApplyLeave;
