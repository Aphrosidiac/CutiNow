import React from 'react';
import { useAuth } from '../context/AuthContext';

const Profile: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">My Profile</h2>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-500">Full Name</label>
          <div className="mt-1 text-lg text-gray-900">{user?.full_name}</div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-500">Email Address</label>
          <div className="mt-1 text-lg text-gray-900">{user?.email}</div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-500">Role</label>
          <div className="mt-1 text-lg text-gray-900 capitalize">{user?.role}</div>
        </div>

        {/* Can add more fields like Join Date if available in context or fetch separate */}
      </div>
    </div>
  );
};

export default Profile;
