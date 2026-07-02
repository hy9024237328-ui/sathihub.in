import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Calendar, Search, CreditCard, User, ArrowRight, Star, Heart } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const name = user?.profile?.name || user?.email?.split('@')[0] || 'User';
  const isSathi = user?.role === 'sathi' || user?.role === 'both';

  const clientCards = [
    { icon: <Search className="w-7 h-7 text-purple-600" />, title: 'Find a Sathi', desc: 'Browse verified Sathis near you', bg: 'bg-purple-50', path: '/find-sathihub' },
    { icon: <Calendar className="w-7 h-7 text-pink-600" />, title: 'My Bookings', desc: 'View & manage your bookings', bg: 'bg-pink-50', path: '/bookings' },
    { icon: <CreditCard className="w-7 h-7 text-green-600" />, title: 'Transactions', desc: 'Payment history', bg: 'bg-green-50', path: '/transactions' },
    { icon: <User className="w-7 h-7 text-indigo-600" />, title: 'My Profile', desc: 'Update your profile info', bg: 'bg-indigo-50', path: '/account/profile' },
  ];

  const sathiCards = [
    { icon: <Star className="w-7 h-7 text-amber-600" />, title: 'My Earnings', desc: 'Track your income & payouts', bg: 'bg-amber-50', path: '/transactions' },
    { icon: <Calendar className="w-7 h-7 text-pink-600" />, title: 'My Bookings', desc: 'Manage client bookings', bg: 'bg-pink-50', path: '/bookings' },
    { icon: <Heart className="w-7 h-7 text-red-500" />, title: 'My Services', desc: 'Manage services you offer', bg: 'bg-red-50', path: '/services' },
    { icon: <User className="w-7 h-7 text-purple-600" />, title: 'My Profile', desc: 'Update your Sathi profile', bg: 'bg-purple-50', path: '/account/profile' },
  ];

  const cards = isSathi ? sathiCards : clientCards;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <Header />
      <div className="pt-28 pb-12 px-4 max-w-5xl mx-auto">

        {/* Welcome banner */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-6 md:p-8 text-white mb-8 shadow-xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-xl font-bold">
              {name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold">Welcome back, {name}! 👋</h1>
              <p className="text-purple-100 text-sm">
                {isSathi ? '💼 Sathi Account — Start earning today!' : '🎯 Client Account — Find your perfect Sathi!'}
              </p>
            </div>
          </div>
        </div>

        {/* Quick action cards */}
        <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {cards.map((card) => (
            <button
              key={card.title}
              onClick={() => navigate(card.path)}
              className="bg-white p-5 rounded-2xl shadow-md hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 text-left border border-gray-100 group">
              <div className={`${card.bg} w-12 h-12 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                {card.icon}
              </div>
              <h3 className="font-bold text-gray-800 text-sm mb-1">{card.title}</h3>
              <p className="text-gray-500 text-xs">{card.desc}</p>
            </button>
          ))}
        </div>

        {/* Membership banner for sathi */}
        {isSathi && (
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white mb-8">
            <h3 className="text-xl font-bold mb-1">💰 Earn Upto ₹2,000/hour!</h3>
            <p className="text-green-100 text-sm mb-4">Complete your profile to start receiving booking requests.</p>
            <button
              onClick={() => navigate('/account/profile')}
              className="bg-white text-green-600 px-6 py-2 rounded-full font-semibold text-sm hover:shadow-lg transition-all flex items-center gap-2">
              Complete Profile <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* For clients — find sathi CTA */}
        {!isSathi && (
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 text-white mb-8">
            <h3 className="text-xl font-bold mb-1">🔍 Find Your Perfect Sathi!</h3>
            <p className="text-purple-100 text-sm mb-4">Browse verified Sathis near you for social support, elder care, and more.</p>
            <button
              onClick={() => navigate('/find-sathihub')}
              className="bg-white text-purple-600 px-6 py-2 rounded-full font-semibold text-sm hover:shadow-lg transition-all flex items-center gap-2">
              Browse Sathis <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Account info */}
        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4">Account Info</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-50">
              <span className="text-gray-500 text-sm">Email</span>
              <span className="text-gray-800 text-sm font-medium">{user?.email || '—'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-50">
              <span className="text-gray-500 text-sm">Phone</span>
              <span className="text-gray-800 text-sm font-medium">{user?.phone || 'Not added'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-50">
              <span className="text-gray-500 text-sm">Account Type</span>
              <span className={`text-sm font-semibold px-3 py-1 rounded-full ${isSathi ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'}`}>
                {isSathi ? 'Sathi' : 'Client'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-500 text-sm">City</span>
              <span className="text-gray-800 text-sm font-medium">{user?.profile?.city || 'Not set'}</span>
            </div>
          </div>
          <button
            onClick={() => navigate('/account/profile')}
            className="mt-4 w-full border-2 border-purple-600 text-purple-600 py-2 rounded-xl font-semibold text-sm hover:bg-purple-50 transition-all">
            Edit Profile →
          </button>
        </div>

      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;
