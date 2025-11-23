import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, FileText, History, User, LogOut, Shield } from 'lucide-react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Apply Leave', path: '/apply-leave', icon: FileText, role: 'employee' },
    { label: 'History', path: '/history', icon: History, role: 'employee' },
    { label: 'Profile', path: '/profile', icon: User },
  ];

  if (user?.role === 'admin') {
     navItems.push(
       { label: 'Admin Dashboard', path: '/admin', icon: Shield, role: 'admin' },
       { label: 'Employees', path: '/admin/employees', icon: User, role: 'admin' },
       { label: 'Leave Requests', path: '/admin/requests', icon: FileText, role: 'admin' },
       { label: 'Leave Types', path: '/admin/types', icon: LayoutDashboard, role: 'admin' }
     );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="bg-white w-full md:w-64 shadow-md flex-shrink-0">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-primary">CutiNow</h1>
          <p className="text-sm text-gray-500">Welcome, {user?.full_name}</p>
        </div>
        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            if (item.role && item.role !== user?.role && !(item.role === 'employee' && user?.role === 'employee')) {
               if (user?.role === 'admin' && item.role === 'employee') return null;
               if (user?.role === 'employee' && item.role === 'admin') return null;
            }

            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors mt-8"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

export default Layout;
