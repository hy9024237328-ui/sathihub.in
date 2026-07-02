import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Plus, Trash2, Edit2, Loader2, Users, Calendar, Star, LogOut, X, Camera, Shield } from 'lucide-react';

const SERVICES = ['Elder Care','Hangingout','Clubbing','Movie Partner','Shopping Buddy','Medical Support','Domestic Help','Travel Partner'];

const adminAxios = axios.create();
adminAxios.interceptors.request.use(config => {
  const token = localStorage.getItem('admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const AdminPanel = () => {
  const navigate = useNavigate();
  const fileRef = useRef();
  const [stats, setStats] = useState(null);
  const [sathis, setSathis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [successInfo, setSuccessInfo] = useState(null);

  const [form, setForm] = useState({
    name: '', email: '', phone: '', city: '', gender: 'female', bio: '',
    hourly_rate: 1500, services: [], rating: 4.8, photo_url: '',
  });

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) { navigate('/admin-login'); return; }
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, sathisRes] = await Promise.all([
        adminAxios.get('/api/v1/admin/stats'),
        adminAxios.get('/api/v1/admin/sathis'),
      ]);
      setStats(statsRes.data.data);
      setSathis(sathisRes.data.data || []);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem('admin_token');
        navigate('/admin-login');
      }
    } finally { setLoading(false); }
  };

  const handleLogout = () => { localStorage.removeItem('admin_token'); navigate('/admin-login'); };

  const handlePhotoUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const res = await adminAxios.post('/api/v1/admin/upload-photo', { base64, fileName: file.name, mimeType: file.type });
      setForm(f => ({ ...f, photo_url: res.data.data.url }));
    } catch (err) {
      setError('Photo upload failed');
    } finally { setUploading(false); }
  };

  const toggleService = (svc) => {
    setForm(f => ({ ...f, services: f.services.includes(svc) ? f.services.filter(s => s !== svc) : [...f.services, svc] }));
  };

  const handleCreateSathi = async (e) => {
    e.preventDefault();
    setError(''); setSaving(true);
    try {
      const res = await adminAxios.post('/api/v1/admin/create-sathi', form);
      setSuccessInfo({ email: form.email, password: res.data.data.generated_password });
      setForm({ name: '', email: '', phone: '', city: '', gender: 'female', bio: '', hourly_rate: 1500, services: [], rating: 4.8, photo_url: '' });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create Sathi');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete ${name}? Yeh permanent hai.`)) return;
    try {
      await adminAxios.delete(`/api/v1/admin/sathis/${id}`);
      fetchData();
    } catch { alert('Delete failed'); }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Loader2 className="w-10 h-10 animate-spin text-purple-600" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-gradient-to-r from-gray-900 via-purple-900 to-gray-900 text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6" />
          <h1 className="font-bold text-lg">SathiHub Admin Panel</h1>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 text-sm bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition">
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            {[
              ['Total Users', stats.totalUsers, 'bg-purple-50 text-purple-600'],
              ['Sathis', stats.totalSathis, 'bg-pink-50 text-pink-600'],
              ['Clients', stats.totalClients, 'bg-indigo-50 text-indigo-600'],
              ['Bookings', stats.totalBookings, 'bg-green-50 text-green-600'],
              ['Pending', stats.pendingBookings, 'bg-amber-50 text-amber-600'],
            ].map(([label, value, cls]) => (
              <div key={label} className={`${cls} rounded-2xl p-4 text-center`}>
                <p className="text-2xl font-bold">{value ?? 0}</p>
                <p className="text-xs font-medium">{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Header + Add button */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">Sathi Profiles ({sathis.length})</h2>
          <button onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:shadow-lg transition flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Sathi
          </button>
        </div>

        {/* Sathi list */}
        {sathis.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Koi Sathi nahi hai abhi. "Add Sathi" se naya banao!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sathis.map(s => (
              <div key={s.id} className="bg-white rounded-2xl shadow-md p-4 border border-gray-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-200 to-pink-200 overflow-hidden flex items-center justify-center flex-shrink-0">
                    {s.profile?.profile_photo ? (
                      <img src={s.profile.profile_photo} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-bold text-purple-600">{s.profile?.name?.charAt(0) || '?'}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 truncate">{s.profile?.name || 'No name'}</p>
                    <p className="text-xs text-gray-500">{s.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                  <span>{s.profile?.city || 'No city'}</span>•
                  <span className="flex items-center gap-0.5"><Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />{s.sathi_profile?.rating || 4.8}</span>•
                  <span className="text-purple-600 font-semibold">₹{s.sathi_profile?.hourly_rate || 1500}/hr</span>
                </div>
                {s.sathi_profile?.services?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {s.sathi_profile.services.slice(0, 3).map(sv => (
                      <span key={sv} className="bg-purple-50 text-purple-600 text-[10px] px-2 py-0.5 rounded-full">{sv}</span>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <span className={`flex-1 text-center text-xs py-1.5 rounded-lg font-medium ${s.is_active ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                    {s.is_active ? '✅ Active' : '⛔ Inactive'}
                  </span>
                  <button onClick={() => handleDelete(s.id, s.profile?.name)}
                    className="bg-red-50 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-100 transition">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Sathi Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={e => e.target === e.currentTarget && !successInfo && setShowAddModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-5 rounded-t-2xl flex items-center justify-between sticky top-0 z-10">
              <h3 className="text-white font-bold text-lg">{successInfo ? 'Sathi Created! 🎉' : 'Add New Sathi'}</h3>
              <button onClick={() => { setShowAddModal(false); setSuccessInfo(null); setError(''); }} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {successInfo ? (
              <div className="p-6 text-center">
                <div className="text-5xl mb-3">✅</div>
                <p className="text-gray-700 mb-4">Sathi profile create ho gayi!</p>
                <div className="bg-purple-50 rounded-xl p-4 text-left mb-4">
                  <p className="text-sm text-gray-600"><strong>Email:</strong> {successInfo.email}</p>
                  {successInfo.password && <p className="text-sm text-gray-600"><strong>Password:</strong> {successInfo.password}</p>}
                  <p className="text-xs text-gray-400 mt-2">Yeh credentials Sathi ko bhej do login karne ke liye.</p>
                </div>
                <button onClick={() => { setSuccessInfo(null); }}
                  className="w-full bg-purple-600 text-white py-2.5 rounded-xl font-semibold">
                  Aur Add Karo
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateSathi} className="p-6 space-y-4">
                {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>}

                {/* Photo upload */}
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center flex-shrink-0">
                    {form.photo_url ? <img src={form.photo_url} alt="" className="w-full h-full object-cover" /> : <Camera className="w-6 h-6 text-gray-400" />}
                  </div>
                  <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                    className="bg-purple-50 text-purple-600 px-4 py-2 rounded-lg text-xs font-semibold hover:bg-purple-100 transition flex items-center gap-1">
                    {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Camera className="w-3 h-3" />} Photo Upload
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => handlePhotoUpload(e.target.files[0])} />
                </div>

                <input type="text" placeholder="Full Name *" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500" required />
                <input type="email" placeholder="Email *" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500" required />
                <input type="text" placeholder="Phone (10 digit)" value={form.phone} onChange={e => setForm({...form, phone: e.target.value.replace(/\D/g,'').slice(0,10)})}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500" />

                <div className="grid grid-cols-2 gap-3">
                  <input type="text" placeholder="City" value={form.city} onChange={e => setForm({...form, city: e.target.value})}
                    className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500" />
                  <select value={form.gender} onChange={e => setForm({...form, gender: e.target.value})}
                    className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 bg-white">
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <textarea placeholder="Bio / Description" value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} rows={2}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 resize-none" />

                <div className="grid grid-cols-2 gap-3">
                  <input type="number" placeholder="Hourly Rate" value={form.hourly_rate} onChange={e => setForm({...form, hourly_rate: parseInt(e.target.value)})}
                    className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500" />
                  <input type="number" step="0.1" min="1" max="5" placeholder="Rating" value={form.rating} onChange={e => setForm({...form, rating: parseFloat(e.target.value)})}
                    className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500" />
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-600 mb-2">Services</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {SERVICES.map(svc => (
                      <button key={svc} type="button" onClick={() => toggleService(svc)}
                        className={`py-1.5 px-2 rounded-lg text-[11px] font-medium border transition text-left ${form.services.includes(svc) ? 'border-purple-600 bg-purple-50 text-purple-700' : 'border-gray-200 text-gray-500'}`}>
                        {form.services.includes(svc) ? '✓ ' : ''}{svc}
                      </button>
                    ))}
                  </div>
                </div>

                <button type="submit" disabled={saving}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold hover:shadow-xl disabled:opacity-50 flex items-center justify-center gap-2">
                  {saving ? <><Loader2 className="animate-spin w-4 h-4" />Creating...</> : 'Create Sathi Profile →'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
