import React, { useState, useEffect } from 'react';
import { useAuth, authAxios } from '../context/AuthContext';
import { Calendar, Clock, MapPin, CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const STATUS_STYLES = {
  pending:   { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: <AlertCircle className="w-4 h-4" />, label: 'Pending' },
  confirmed: { bg: 'bg-green-100',  text: 'text-green-700',  icon: <CheckCircle className="w-4 h-4" />, label: 'Confirmed' },
  rejected:  { bg: 'bg-red-100',    text: 'text-red-700',    icon: <XCircle className="w-4 h-4" />,    label: 'Rejected' },
  completed: { bg: 'bg-blue-100',   text: 'text-blue-700',   icon: <CheckCircle className="w-4 h-4" />,label: 'Completed' },
  cancelled: { bg: 'bg-gray-100',   text: 'text-gray-700',   icon: <XCircle className="w-4 h-4" />,    label: 'Cancelled' },
};

const MyBookings = () => {
  const { user } = useAuth();
  const isSathi = user?.role === 'sathi' || user?.role === 'both';
  const [view, setView] = useState(isSathi ? 'sathi' : 'client');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await authAxios.get(`/api/v1/bookings?role=${view}`);
      setBookings(res.data.data || []);
    } catch (err) {
      console.error('Fetch bookings error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, [view]);

  const handleStatusUpdate = async (bookingId, status) => {
    setUpdating(bookingId);
    try {
      await authAxios.patch(`/api/v1/bookings/${bookingId}/status`, { status });
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <Header />
      <div className="pt-28 pb-12 px-4 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
          My Bookings
        </h1>

        {/* View toggle for sathi+both */}
        {(user?.role === 'both') && (
          <div className="flex gap-2 mb-6 bg-white rounded-xl p-1 w-fit shadow-sm border border-gray-100">
            {['client', 'sathi'].map(v => (
              <button key={v} onClick={() => setView(v)}
                className={`px-5 py-2 rounded-lg font-medium text-sm transition-all ${view === v ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow' : 'text-gray-500 hover:text-gray-700'}`}>
                {v === 'client' ? '🙋 As Client' : '💼 As Sathi'}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-purple-600" /></div>
        ) : bookings.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No bookings yet</h3>
            <p className="text-gray-500 text-sm">
              {view === 'client' ? 'Find a Sathi and make your first booking!' : 'Booking requests will appear here.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map(booking => {
              const s = STATUS_STYLES[booking.status] || STATUS_STYLES.pending;
              return (
                <div key={booking.id} className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">{booking.service_type}</h3>
                      <p className="text-purple-600 font-semibold text-sm">₹{booking.total_amount}</p>
                    </div>
                    <span className={`flex items-center gap-1 ${s.bg} ${s.text} text-xs font-semibold px-3 py-1.5 rounded-full`}>
                      {s.icon}{s.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1"><Calendar className="w-4 h-4 text-purple-400" />{booking.scheduled_date}</div>
                    <div className="flex items-center gap-1"><Clock className="w-4 h-4 text-pink-400" />{booking.scheduled_time}</div>
                    {booking.address && <div className="flex items-center gap-1"><MapPin className="w-4 h-4 text-indigo-400" />{booking.address}</div>}
                  </div>

                  {booking.notes && (
                    <p className="text-sm text-gray-500 bg-gray-50 rounded-lg px-3 py-2 mb-4">📝 {booking.notes}</p>
                  )}

                  {/* Sathi actions — confirm/reject pending bookings */}
                  {view === 'sathi' && booking.status === 'pending' && (
                    <div className="flex gap-3 mt-2">
                      <button
                        onClick={() => handleStatusUpdate(booking.id, 'confirmed')}
                        disabled={updating === booking.id}
                        className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-2.5 rounded-xl font-semibold text-sm hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                        {updating === booking.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                        Accept
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(booking.id, 'rejected')}
                        disabled={updating === booking.id}
                        className="flex-1 bg-gradient-to-r from-red-500 to-rose-600 text-white py-2.5 rounded-xl font-semibold text-sm hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                        {updating === booking.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                        Decline
                      </button>
                    </div>
                  )}

                  {/* Sathi can mark as completed */}
                  {view === 'sathi' && booking.status === 'confirmed' && (
                    <button
                      onClick={() => handleStatusUpdate(booking.id, 'completed')}
                      disabled={updating === booking.id}
                      className="mt-2 w-full bg-blue-600 text-white py-2.5 rounded-xl font-semibold text-sm hover:shadow-lg transition-all disabled:opacity-50">
                      Mark as Completed ✅
                    </button>
                  )}

                  {/* Client can cancel pending bookings */}
                  {view === 'client' && booking.status === 'pending' && (
                    <button
                      onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                      disabled={updating === booking.id}
                      className="mt-2 w-full border-2 border-red-300 text-red-600 py-2.5 rounded-xl font-semibold text-sm hover:bg-red-50 transition-all disabled:opacity-50">
                      Cancel Booking
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default MyBookings;
