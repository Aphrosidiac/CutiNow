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
               // Show employee items to employees, admin items to admins.
               // Actually, admin might want to apply leave too? Requirements said "Admin Features... Edit leave balance per employee".
               // Let's assume Admin is pure management for now based on requirements, but often they are employees too.
               // Requirement says: "User Roles: Employee (default), Admin".
               // Requirements: "Admin Features: Admin dashboard, View all leave submissions...".
               // Requirements: "Employee Features: Apply for leave...".
               // I will show Employee features ONLY to 'employee' role and Admin features to 'admin'.
               // Wait, usually admins can also be employees. But let's stick to strict separation if simplest, or maybe Admin sees everything.
               // Let's allow Admin to see Admin links AND Profile. But maybe not Apply Leave?
               // "Employee Features" list implies these are for Employees.
               // I will hide 'Apply Leave' and 'History' from Admin for now to keep it clean, unless I decide Admin is a super-employee.
               // Let's stick to: Admin sees Admin stuff + Profile. Employee sees Employee stuff + Profile.

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
