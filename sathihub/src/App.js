import React, { Suspense, lazy } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import HomePage from './pages/HomePage';

// Lazy load pages
const Dashboard        = lazy(() => import('./pages/Dashboard'));
const EmailVerified    = lazy(() => import('./pages/EmailVerified'));
const AccountPage      = lazy(() => import('./pages/AccountPage'));
const ProfileTab       = lazy(() => import('./pages/account/ProfileTab'));
const PasswordTab      = lazy(() => import('./pages/account/PasswordTab'));
const DocumentsTab     = lazy(() => import('./pages/account/DocumentsTab'));
const MembershipTab    = lazy(() => import('./pages/account/MembershipTab'));
const FindSathiHub     = lazy(() => import('./pages/FindSathiHub'));
const MyBookings       = lazy(() => import('./pages/MyBookings'));
const MembershipPage   = lazy(() => import('./pages/MembershipPage'));
const ServicesPage     = lazy(() => import('./pages/ServicesPage'));
const AboutPage        = lazy(() => import('./pages/AboutPage'));
const PrivacyPage      = lazy(() => import('./pages/PrivacyPage'));
const TermsPage        = lazy(() => import('./pages/TermsPage'));
const RefundPage       = lazy(() => import('./pages/RefundPage'));
const CodeOfConductPage= lazy(() => import('./pages/CodeOfConductPage'));
const FAQPage          = lazy(() => import('./pages/FAQPage'));
const ContactPage      = lazy(() => import('./pages/ContactPage'));
const HelpCenter       = lazy(() => import('./pages/HelpCenter'));
const AdminLogin       = lazy(() => import('./pages/AdminLogin'));
const AdminPanel       = lazy(() => import('./pages/AdminPanel'));
const SetPassword      = lazy(() => import('./components/SetPassword'));
const CityPage         = lazy(() => import('./pages/CityPage'));
const PaymentStatus    = lazy(() => import('./pages/PaymentStatus'));
const TransactionHistory = lazy(() => import('./pages/TransactionHistory'));
const SathiHubProfile  = lazy(() => import('./pages/SathiHubProfile'));
const BookingPage      = lazy(() => import('./pages/BookingPage'));

// Page loader
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-pink-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600 mx-auto mb-3"></div>
      <p className="text-gray-500 text-sm">Loading...</p>
    </div>
  </div>
);

// Protected route
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/" replace />;
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public */}
            <Route path="/" element={<HomePage />} />
            <Route path="/verify-email" element={<EmailVerified />} />
            <Route path="/about"           element={<AboutPage />} />
            <Route path="/privacy"         element={<PrivacyPage />} />
            <Route path="/terms"           element={<TermsPage />} />
            <Route path="/refund"          element={<RefundPage />} />
            <Route path="/code-of-conduct" element={<CodeOfConductPage />} />
            <Route path="/faq"             element={<FAQPage />} />
            <Route path="/contact"         element={<ContactPage />} />
            <Route path="/help"            element={<HelpCenter />} />
            <Route path="/admin-login"     element={<AdminLogin />} />
            <Route path="/admin"           element={<AdminPanel />} />
            <Route path="/admin/*"         element={<AdminPanel />} />
            <Route path="/city/:citySlug"  element={<CityPage />} />

            {/* Protected */}
            <Route path="/set-password"  element={<ProtectedRoute><SetPassword /></ProtectedRoute>} />
            <Route path="/dashboard"     element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/find-sathihub" element={<ProtectedRoute><FindSathiHub /></ProtectedRoute>} />
            <Route path="/bookings"      element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
            <Route path="/membership"    element={<ProtectedRoute><MembershipPage /></ProtectedRoute>} />
            <Route path="/services"      element={<ProtectedRoute><ServicesPage /></ProtectedRoute>} />
            <Route path="/payment-status"  element={<ProtectedRoute><PaymentStatus /></ProtectedRoute>} />
            <Route path="/transactions"    element={<ProtectedRoute><TransactionHistory /></ProtectedRoute>} />
            <Route path="/sathihub/:userId" element={<ProtectedRoute><SathiHubProfile /></ProtectedRoute>} />
            <Route path="/book"            element={<ProtectedRoute><BookingPage /></ProtectedRoute>} />

            {/* ✅ Account with NESTED routes — Outlet ke liye zaroori */}
            <Route path="/account" element={<ProtectedRoute><AccountPage /></ProtectedRoute>}>
              <Route index element={<Navigate to="profile" replace />} />
              <Route path="profile"    element={<Suspense fallback={<PageLoader />}><ProfileTab /></Suspense>} />
              <Route path="password"   element={<Suspense fallback={<PageLoader />}><PasswordTab /></Suspense>} />
              <Route path="documents"  element={<Suspense fallback={<PageLoader />}><DocumentsTab /></Suspense>} />
              <Route path="membership" element={<Suspense fallback={<PageLoader />}><MembershipTab /></Suspense>} />
            </Route>

            {/* Legacy redirects */}
            <Route path="/cuddlist-setup"  element={<Navigate to="/account/profile" replace />} />
            <Route path="/kopartner-setup" element={<Navigate to="/dashboard" replace />} />
            <Route path="/book-services"   element={<Navigate to="/find-sathihub" replace />} />
            <Route path="/find-cuddlist"   element={<Navigate to="/find-sathihub" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
