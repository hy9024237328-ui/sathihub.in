import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, ArrowLeft, LogOut, Settings, User, LayoutDashboard, Calendar } from 'lucide-react';
import Logo from './Logo';
import LoginModal from './LoginModal';
import NotificationBell from './NotificationBell';

const Header = ({ hideLoginButton = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const settingsRef = useRef(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isNotHomePage = location.pathname !== '/';

  useEffect(() => {
    const handler = (e) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target)) setSettingsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleGoBack = () => { if (window.history.length > 1) navigate(-1); else navigate('/'); };
  const handleLogout = async () => { setSettingsOpen(false); setMobileMenuOpen(false); await logout(); navigate('/'); };
  const goTo = (path) => { setSettingsOpen(false); setMobileMenuOpen(false); navigate(path); };
  const scrollToSection = (id) => {
    if (window.location.pathname !== '/') {
      navigate('/');
      setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 100);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  const SETTINGS_ITEMS = [
    { label: 'Dashboard',        icon: LayoutDashboard, path: '/dashboard' },
    { label: 'My Bookings',      icon: Calendar,        path: '/bookings' },
    { label: 'Buy Services',     icon: Calendar,        path: '/services' },
    { label: 'Transactions',     icon: Calendar,        path: '/transactions' },
    { label: 'Account Settings', icon: Settings,        path: '/account/profile' },
  ];

  return (
    <>
      <header className="fixed top-0 w-full bg-white/90 backdrop-blur-xl z-50 border-b border-purple-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3">
              {isNotHomePage && (
                <button onClick={handleGoBack} className="flex items-center gap-1 text-gray-600 hover:text-purple-600 transition-colors px-3 py-2 rounded-lg hover:bg-purple-50">
                  <ArrowLeft size={20} />
                  <span className="hidden sm:inline font-medium">Back</span>
                </button>
              )}
              <button onClick={() => navigate('/')} className="transform hover:scale-105 transition-transform duration-200">
                <Logo size="md" showText={true} />
              </button>
            </div>

            <div className="hidden md:flex items-center space-x-6">
              <button onClick={() => scrollToSection('services')} className="text-gray-700 hover:text-purple-600 transition font-medium">Services</button>
              <button onClick={() => scrollToSection('why-choose')} className="text-gray-700 hover:text-purple-600 transition font-medium">Why Choose Us</button>
              <button onClick={() => scrollToSection('pricing')} className="text-gray-700 hover:text-purple-600 transition font-medium">Pricing</button>

              {user ? (
                <div className="flex items-center gap-2">
                  <NotificationBell />
                  <div className="relative" ref={settingsRef}>
                    <button onClick={() => setSettingsOpen(!settingsOpen)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-full border transition-all ${settingsOpen ? 'bg-purple-50 border-purple-300 text-purple-700' : 'border-gray-300 text-gray-600 hover:border-purple-300 hover:text-purple-600'}`}>
                      {user.profile?.profile_photo
                        ? <img src={user.profile.profile_photo} alt="avatar" className="w-6 h-6 rounded-full object-cover" />
                        : <User size={16} />}
                      <Settings size={16} className={`transition-transform duration-200 ${settingsOpen ? 'rotate-45' : ''}`} />
                    </button>
                    {settingsOpen && (
                      <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50">
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-sm font-semibold text-gray-900 truncate">{user.profile?.name || 'Your Account'}</p>
                          <p className="text-xs text-gray-500 truncate">{user.phone}</p>
                        </div>
                        {SETTINGS_ITEMS.map(({ label, icon: Icon, path }) => (
                          <button key={path} onClick={() => goTo(path)}
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors">
                            <Icon size={15} className="text-gray-400" />{label}
                          </button>
                        ))}
                        <div className="border-t border-gray-100 mt-1">
                          <button onClick={handleLogout}
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                            <LogOut size={15} />Logout
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : !hideLoginButton ? (
                <button onClick={() => setShowAuthModal(true)}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-full font-semibold hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                  Login
                </button>
              ) : null}
            </div>

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-gray-700">
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden py-4 space-y-1 border-t border-gray-100">
              {isNotHomePage && (
                <button onClick={() => { handleGoBack(); setMobileMenuOpen(false); }}
                  className="flex items-center gap-2 w-full text-left px-4 py-3 text-gray-700 hover:bg-purple-50 rounded-lg font-medium">
                  <ArrowLeft size={18} /> Go Back
                </button>
              )}
              <button onClick={() => scrollToSection('services')} className="block w-full text-left px-4 py-3 text-gray-700 hover:bg-purple-50 rounded-lg font-medium">Services</button>
              <button onClick={() => scrollToSection('why-choose')} className="block w-full text-left px-4 py-3 text-gray-700 hover:bg-purple-50 rounded-lg font-medium">Why Choose Us</button>
              <button onClick={() => scrollToSection('pricing')} className="block w-full text-left px-4 py-3 text-gray-700 hover:bg-purple-50 rounded-lg font-medium">Pricing</button>
              {user ? (
                <>
                  <div className="px-4 py-2 border-t border-gray-100 mt-1">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Account</p>
                  </div>
                  {SETTINGS_ITEMS.map(({ label, icon: Icon, path }) => (
                    <button key={path} onClick={() => goTo(path)}
                      className="flex items-center gap-3 w-full text-left px-4 py-3 text-gray-700 hover:bg-purple-50 rounded-lg transition">
                      <Icon size={17} className="text-gray-400" />{label}
                    </button>
                  ))}
                  <button onClick={handleLogout}
                    className="flex items-center gap-3 w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg font-medium">
                    <LogOut size={17} /> Logout
                  </button>
                </>
              ) : !hideLoginButton ? (
                <button onClick={() => { setShowAuthModal(true); setMobileMenuOpen(false); }}
                  className="block w-full text-left px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold">
                  Login
                </button>
              ) : null}
            </div>
          )}
        </div>
      </header>
      <LoginModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
};

export default Header;
