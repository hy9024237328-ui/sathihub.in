import React, { useState, useEffect, useRef } from 'react';
import { useAuth, authAxios } from '../../context/AuthContext';
import { Camera, Loader2, CheckCircle, Trash2, Star, MapPin, Plus, User } from 'lucide-react';

const SERVICES = ['Elder Care','Hangingout','Clubbing','Movie Partner','Shopping Buddy','Medical Support','Domestic Help','Travel Partner'];

const ProfileTab = () => {
  const { user, refreshUser } = useAuth();
  const fileRef = useRef();
  const extraFileRef = useRef();
  const isSathi = user?.role === 'sathi' || user?.role === 'both';

  const [form, setForm] = useState({
    name: '', city: '', pincode: '', gender: '', bio: '',
    hourly_rate: 1500, services: [],
  });
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setForm({
        name: user.profile?.name || '',
        city: user.profile?.city || '',
        pincode: user.profile?.pincode || '',
        gender: user.profile?.gender || '',
        bio: user.profile?.bio || '',
        hourly_rate: user.kopartner_profile?.hourly_rate || 1500,
        services: user.kopartner_profile?.services || [],
      });
    }
    fetchPhotos();
  }, [user]);

  const fetchPhotos = async () => {
    try {
      const res = await authAxios.get('/api/v1/upload/my-photos');
      setPhotos(res.data.data || []);
    } catch {}
  };

  // Convert file to base64 and upload
  const handlePhotoUpload = async (file, isExtra = false) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError('Photo 5MB se badi nahi honi chahiye'); return; }
    setUploading(true); setError('');
    try {
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const endpoint = isExtra ? '/api/v1/upload/extra-photo' : '/api/v1/upload/profile-photo';
      await authAxios.post(endpoint, { base64, fileName: file.name, mimeType: file.type });
      await fetchPhotos();
      await refreshUser();
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally { setUploading(false); }
  };

  const handleDeletePhoto = async (photoId) => {
    try {
      await authAxios.delete(`/api/v1/upload/photo/${photoId}`);
      fetchPhotos();
    } catch { setError('Delete failed'); }
  };

  const toggleService = (svc) => {
    setForm(prev => ({
      ...prev,
      services: prev.services.includes(svc)
        ? prev.services.filter(s => s !== svc)
        : [...prev.services, svc]
    }));
  };

  const handleSave = async () => {
    setSaving(true); setError(''); setSaved(false);
    try {
      await authAxios.put('/api/v1/user/profile', {
        name: form.name, city: form.city, pincode: form.pincode,
        gender: form.gender, bio: form.bio,
      });
      if (isSathi) {
        await authAxios.put('/api/v1/user/sathi-profile', {
          hourly_rate: parseInt(form.hourly_rate),
          services: form.services,
        });
      }
      await refreshUser();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const profilePhoto = user?.profile?.profile_photo;

  return (
    <div className="max-w-2xl mx-auto py-6 px-4 space-y-6">

      {/* Free Plan Banner */}
      {user?.is_premium && (
        <div className="bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl p-4 text-white flex items-center gap-3">
          <Star className="w-6 h-6 fill-white" />
          <div>
            <p className="font-bold">🎉 Aap Free Premium Member Hain!</p>
            <p className="text-xs text-amber-100">Pehle 1000 users mein hain — sab features bilkul FREE!</p>
          </div>
        </div>
      )}

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>}
      {saved && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
          <CheckCircle className="w-4 h-4" /> Profile save ho gaya! ✅
        </div>
      )}

      {/* Profile Photo Section */}
      <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
        <h3 className="font-bold text-gray-800 mb-4 text-lg">Profile Photo</h3>
        <div className="flex items-center gap-5">
          {/* Main photo */}
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-purple-200 to-pink-200 flex items-center justify-center border-4 border-purple-100">
              {profilePhoto ? (
                <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-10 h-10 text-purple-400" />
              )}
            </div>
            <button onClick={() => fileRef.current?.click()}
              className="absolute bottom-0 right-0 bg-purple-600 text-white rounded-full p-1.5 hover:bg-purple-700 transition shadow-md">
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>
          <div>
            <p className="font-semibold text-gray-800">{form.name || 'Apna naam daalo'}</p>
            <p className="text-sm text-gray-500 flex items-center gap-1"><MapPin className="w-3 h-3" />{form.city || 'City set karo'}</p>
            <button onClick={() => fileRef.current?.click()} disabled={uploading}
              className="mt-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1.5 rounded-lg text-xs font-semibold hover:shadow-md transition disabled:opacity-50 flex items-center gap-1">
              {uploading ? <><Loader2 className="w-3 h-3 animate-spin" />Uploading...</> : <><Camera className="w-3 h-3" />Photo Change Karo</>}
            </button>
          </div>
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden"
          onChange={e => handlePhotoUpload(e.target.files[0], false)} />
      </div>

      {/* Extra Photos (Sathi Portfolio) */}
      {isSathi && (
        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800 text-lg">Meri Photos (Portfolio)</h3>
            <button onClick={() => extraFileRef.current?.click()} disabled={uploading}
              className="bg-purple-50 text-purple-600 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-purple-100 transition flex items-center gap-1 border border-purple-200">
              <Plus className="w-3 h-3" /> Photo Add Karo
            </button>
          </div>
          <p className="text-xs text-gray-400 mb-4">Clients yeh photos dekh kar book karte hain — acchi photos se zyada bookings milti hain!</p>

          {photos.length === 0 ? (
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-purple-300 transition"
              onClick={() => extraFileRef.current?.click()}>
              <Camera className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">Photos upload karo</p>
              <p className="text-gray-300 text-xs">Max 5MB per photo</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {photos.map(photo => (
                <div key={photo.id} className="relative group aspect-square rounded-xl overflow-hidden border border-gray-100">
                  <img src={photo.photo_url} alt="" className="w-full h-full object-cover" />
                  <button onClick={() => handleDeletePhoto(photo.id)}
                    className="absolute top-1.5 right-1.5 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {/* Add more */}
              <button onClick={() => extraFileRef.current?.click()} disabled={uploading}
                className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center hover:border-purple-300 transition cursor-pointer">
                {uploading ? <Loader2 className="w-6 h-6 text-purple-400 animate-spin" /> : <Plus className="w-6 h-6 text-gray-300" />}
              </button>
            </div>
          )}
          <input ref={extraFileRef} type="file" accept="image/*" className="hidden"
            onChange={e => handlePhotoUpload(e.target.files[0], true)} />
        </div>
      )}

      {/* Basic Info */}
      <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
        <h3 className="font-bold text-gray-800 mb-4 text-lg">Basic Info</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
              placeholder="Apna naam daalo" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input type="text" value={form.city} onChange={e => setForm({...form, city: e.target.value})}
                placeholder="Jaise: Delhi" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
              <input type="text" value={form.pincode} onChange={e => setForm({...form, pincode: e.target.value.replace(/\D/g,'').slice(0,6)})}
                placeholder="6 digit" maxLength={6} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
            <select value={form.gender} onChange={e => setForm({...form, gender: e.target.value})}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 text-sm bg-white">
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio / About You</label>
            <textarea value={form.bio} onChange={e => setForm({...form, bio: e.target.value})}
              placeholder="Apne baare mein kuch likho — clients yeh padhte hain!" rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 text-sm resize-none" />
          </div>
        </div>
      </div>

      {/* Sathi Settings */}
      {isSathi && (
        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4 text-lg">Sathi Settings</h3>

          {/* Hourly Rate */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate (₹)</label>
            <input type="number" value={form.hourly_rate} min={500} max={5000} step={100}
              onChange={e => setForm({...form, hourly_rate: parseInt(e.target.value)})}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 text-sm" />
            <p className="text-xs text-gray-400 mt-1">Recommended: ₹1000 - ₹2000/hr</p>
          </div>

          {/* Services */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Services Jo Tum Offer Karte Ho</label>
            <div className="grid grid-cols-2 gap-2">
              {SERVICES.map(svc => (
                <button key={svc} type="button" onClick={() => toggleService(svc)}
                  className={`py-2.5 px-3 rounded-xl text-xs font-medium border-2 transition text-left ${
                    form.services.includes(svc)
                      ? 'border-purple-600 bg-purple-50 text-purple-700'
                      : 'border-gray-200 text-gray-600 hover:border-purple-300'
                  }`}>
                  {form.services.includes(svc) ? '✅ ' : ''}{svc}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Account Info (read only) */}
      <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
        <h3 className="font-bold text-gray-800 mb-4 text-lg">Account Info</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-gray-50">
            <span className="text-gray-500 text-sm">Email</span>
            <span className="text-gray-800 text-sm font-medium">{user?.email}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-50">
            <span className="text-gray-500 text-sm">Phone</span>
            <span className="text-gray-800 text-sm font-medium">{user?.phone || 'Not added'}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-50">
            <span className="text-gray-500 text-sm">Account Type</span>
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${isSathi ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'}`}>
              {isSathi ? '💼 Sathi' : '🙋 Client'}
            </span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-gray-500 text-sm">Plan</span>
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${user?.is_premium ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>
              {user?.is_premium ? '⭐ Free Premium' : 'Basic'}
            </span>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <button onClick={handleSave} disabled={saving}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-2xl font-bold text-lg hover:shadow-xl disabled:opacity-50 flex items-center justify-center gap-2 transition-all">
        {saving ? <><Loader2 className="animate-spin w-5 h-5" />Saving...</> : saved ? <><CheckCircle className="w-5 h-5" />Saved! ✅</> : 'Save Profile →'}
      </button>
    </div>
  );
};

export default ProfileTab;
