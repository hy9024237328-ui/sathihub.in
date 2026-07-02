import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAxios } from '../context/AuthContext';
import { Calendar, Clock, MapPin, FileText, Loader2, CheckCircle } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const SERVICE_PRICES = {
  'Elder Care': 1000, 'Hangingout': 1500, 'Clubbing': 2000,
  'Movie Partner': 2000, 'Shopping Buddy': 2000, 'Medical Support': 2000,
  'Domestic Help': 2000, 'Travel Partner': 2000,
};

const BookingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { sathiId, sathiName, serviceType: preService } = location.state || {};

  const [form, setForm] = useState({
    service_type: preService || 'Hangingout',
    scheduled_date: '',
    scheduled_time: '',
    duration_hours: 1,
    address: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const totalAmount = SERVICE_PRICES[form.service_type] * form.duration_hours;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.scheduled_date || !form.scheduled_time)
      return setError('Please select date and time');

    // Demo sathi — show success without hitting backend
    if (!sathiId || sathiId === '1' || sathiId === '2' || sathiId === '3' || sathiId === '4' || sathiId === '5' || sathiId === '6') {
      setSuccess(true);
      return;
    }

    setLoading(true);
    try {
      await authAxios.post('/api/v1/bookings', {
        sathi_id: sathiId,
        ...form,
      });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Get tomorrow's date as minimum
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  if (success) return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <Header />
      <div className="pt-28 pb-12 px-4 max-w-lg mx-auto text-center">
        <div className="bg-white rounded-3xl shadow-xl p-10">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Booking Request Sent! 🎉</h2>
          <p className="text-gray-600 mb-2">Your request for <strong>{form.service_type}</strong> has been sent to <strong>{sathiName || 'the Sathi'}</strong>.</p>
          <p className="text-gray-500 text-sm mb-6">They will confirm or decline your request shortly. You'll be notified.</p>
          <div className="bg-purple-50 rounded-xl p-4 mb-6 text-left">
            <p className="text-sm text-gray-600"><strong>Service:</strong> {form.service_type}</p>
            <p className="text-sm text-gray-600"><strong>Date:</strong> {form.scheduled_date}</p>
            <p className="text-sm text-gray-600"><strong>Time:</strong> {form.scheduled_time}</p>
            <p className="text-sm text-gray-600"><strong>Duration:</strong> {form.duration_hours} hour(s)</p>
            <p className="text-sm font-bold text-purple-600 mt-2"><strong>Total:</strong> ₹{totalAmount}</p>
          </div>
          <button onClick={() => navigate('/bookings')}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold hover:shadow-xl transition-all">
            View My Bookings →
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <Header />
      <div className="pt-28 pb-12 px-4 max-w-lg mx-auto">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
            <h1 className="text-2xl font-bold">Book a Sathi</h1>
            {sathiName && <p className="text-purple-100 mt-1">with {sathiName}</p>}
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>}

            {/* Service Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
              <select value={form.service_type} onChange={e => setForm({...form, service_type: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white">
                {Object.keys(SERVICE_PRICES).map(s => (
                  <option key={s} value={s}>{s} — ₹{SERVICE_PRICES[s]}/hr</option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar className="inline w-4 h-4 mr-1" />Date
              </label>
              <input type="date" min={minDate} value={form.scheduled_date}
                onChange={e => setForm({...form, scheduled_date: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500" required />
            </div>

            {/* Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Clock className="inline w-4 h-4 mr-1" />Time
              </label>
              <input type="time" value={form.scheduled_time}
                onChange={e => setForm({...form, scheduled_time: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500" required />
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
              <select value={form.duration_hours} onChange={e => setForm({...form, duration_hours: parseFloat(e.target.value)})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white">
                {[1, 1.5, 2, 3, 4, 5, 6].map(h => (
                  <option key={h} value={h}>{h} hour{h > 1 ? 's' : ''}</option>
                ))}
              </select>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <MapPin className="inline w-4 h-4 mr-1" />Address / Location
              </label>
              <input type="text" placeholder="Your address or meeting location" value={form.address}
                onChange={e => setForm({...form, address: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500" />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FileText className="inline w-4 h-4 mr-1" />Special Instructions (optional)
              </label>
              <textarea placeholder="Any special requirements or notes..." value={form.notes}
                onChange={e => setForm({...form, notes: e.target.value})} rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 resize-none" />
            </div>

            {/* Price Summary */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
              <div className="flex justify-between items-center mb-1">
                <span className="text-gray-600 text-sm">₹{SERVICE_PRICES[form.service_type]}/hr × {form.duration_hours} hr</span>
                <span className="font-bold text-purple-600 text-lg">₹{totalAmount}</span>
              </div>
              <p className="text-xs text-gray-500">Payment will be collected after service confirmation</p>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-semibold hover:shadow-xl disabled:opacity-50 flex items-center justify-center gap-2 text-lg">
              {loading ? <><Loader2 className="animate-spin" size={20} />Sending Request...</> : 'Send Booking Request →'}
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BookingPage;
