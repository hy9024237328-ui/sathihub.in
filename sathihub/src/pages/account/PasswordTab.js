import React, { useState } from 'react';
import { authAxios } from '../../context/AuthContext';
import { Lock, Loader2, CheckCircle, Eye, EyeOff } from 'lucide-react';

const PasswordTab = () => {
  const [form, setForm] = useState({ current: '', newPass: '', confirm: '' });
  const [show, setShow] = useState({ current: false, newPass: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(false);
    if (form.newPass !== form.confirm) return setError('Passwords match nahi kar rahe');
    if (form.newPass.length < 6) return setError('Password kam se kam 6 characters ka hona chahiye');
    setLoading(true);
    try {
      await authAxios.post('/api/v1/auth/change-password', { current_password: form.current, new_password: form.newPass });
      setSuccess(true); setForm({ current: '', newPass: '', confirm: '' });
    } catch (err) { setError(err.response?.data?.message || 'Password change failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-md mx-auto py-6 px-4">
      <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
        <h3 className="font-bold text-gray-800 mb-4 text-lg flex items-center gap-2"><Lock className="w-5 h-5 text-purple-600" />Password Change Karo</h3>
        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-4">{error}</div>}
        {success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm mb-4 flex items-center gap-2"><CheckCircle className="w-4 h-4"/>Password change ho gaya!</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          {[['current','Current Password',show.current],['newPass','New Password',show.newPass],['confirm','Confirm Password',false]].map(([key, label, isShown]) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <div className="relative">
                <input type={isShown ? 'text' : 'password'} value={form[key]}
                  onChange={e => setForm({...form, [key]: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 text-sm pr-10" required />
                {key !== 'confirm' && (
                  <button type="button" onClick={() => setShow(s => ({...s, [key]: !s[key]}))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {isShown ? <EyeOff size={16}/> : <Eye size={16}/>}
                  </button>
                )}
              </div>
            </div>
          ))}
          <button type="submit" disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold hover:shadow-xl disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <><Loader2 className="animate-spin w-4 h-4"/>Changing...</> : 'Change Password →'}
          </button>
        </form>
      </div>
    </div>
  );
};
export default PasswordTab;
