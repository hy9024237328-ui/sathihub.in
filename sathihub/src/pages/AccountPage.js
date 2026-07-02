import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Lock, FileText, Star } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const AccountPage = () => {
  const { user } = useAuth();
  const isSathi = user?.role === 'sathi' || user?.role === 'both';

  const tabs = [
    { path: 'profile',    label: 'Profile',    icon: <User className="w-4 h-4" /> },
    { path: 'password',   label: 'Password',   icon: <Lock className="w-4 h-4" /> },
    { path: 'documents',  label: 'Documents',  icon: <FileText className="w-4 h-4" /> },
    ...(isSathi ? [{ path: 'membership', label: 'Membership', icon: <Star className="w-4 h-4" /> }] : []),
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <Header />
      <div className="pt-24 pb-12 px-4 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
          Account Settings
        </h1>

        {/* Tab nav */}
        <div className="flex gap-2 bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100 mb-6 overflow-x-auto">
          {tabs.map(tab => (
            <NavLink key={tab.path} to={tab.path}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                  isActive ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`
              }>
              {tab.icon}{tab.label}
            </NavLink>
          ))}
        </div>

        {/* Tab content */}
        <Outlet />
      </div>
      <Footer />
    </div>
  );
};

export default AccountPage;
