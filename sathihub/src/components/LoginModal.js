import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { X, Phone, Lock, Eye, EyeOff, Mail, Loader2 } from 'lucide-react';
import axios from 'axios';

const API = '/api/v1';

const formatPhone = (raw) => {
  const digits = raw.replace(/\D/g, '');
  if (digits.startsWith('91') && digits.length === 12) return digits.slice(2);
  return digits.slice(-10);
};
const isValidPhone = (raw) => {
  const digits = raw.replace(/\D/g, '');
  return digits.length === 10 || (digits.startsWith('91') && digits.length === 12);
};
const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
const isStrongPassword = (v) => /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(v);

const getErrorMessage = (err) => {
  if (!err.response) return 'Network error. Please check your connection.';
  const { status, data } = err.response;
  if (status === 429) return 'Too many requests. Please wait and try again.';
  const errorCode = data?.error_code;
  if (errorCode === 'PHONE_EXISTS') return 'This phone number is already registered. Try logging in instead.';
  if (errorCode === 'EMAIL_EXISTS') return 'This email is already registered. Try logging in instead.';
  if (errorCode === 'INVALID_CREDENTIALS') return 'Invalid phone/email or password. Please use "Forgot Password" to reset.';
  if (errorCode === 'ACCOUNT_DISABLED') return 'Your account has been disabled. Please contact support.';
  if (status === 422 && data?.detail) {
    const details = Array.isArray(data.detail) ? data.detail : [data.detail];
    const msgs = details.map(d => d.msg || d).filter(Boolean);
    if (msgs.length > 0) return msgs[0].replace('Value error, ', '');
  }
  return data?.message || data?.detail || 'Something went wrong. Please try again.';
};

const LoginModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState('login');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');
  const [regName, setRegName] = useState('');
  const [regCity, setRegCity] = useState('');
  const [regPincode, setRegPincode] = useState('');
  const [regGender, setRegGender] = useState('');
  const [regRole, setRegRole] = useState('client');
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginMethod, setLoginMethod] = useState('password');
  const [otpSent, setOtpSent] = useState(false);
  const [loginOtp, setLoginOtp] = useState('');
  const [fpIdentifier, setFpIdentifier] = useState('');
  const [fpOtp, setFpOtp] = useState('');
  const [fpNewPassword, setFpNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [otpCooldown, setOtpCooldown] = useState(0);

  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (otpCooldown <= 0) return;
    const t = setTimeout(() => setOtpCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [otpCooldown]);

  const reset = useCallback(() => {
    setStep('login'); setRegPhone(''); setRegEmail(''); setRegPassword(''); setRegConfirm('');
    setLoginIdentifier(''); setLoginPassword(''); setFpIdentifier(''); setFpOtp(''); setFpNewPassword('');
    setShowPassword(false); setShowConfirm(false); setError(''); setSuccess(''); setOtpCooldown(0);
    setOtpSent(false); setLoginOtp('');
  }, []);

  useEffect(() => { if (!isOpen) reset(); }, [isOpen, reset]);
  const handleClose = () => { reset(); onClose(); };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!isValidPhone(regPhone)) { setError('Enter a valid 10-digit mobile number'); return; }
    if (!isValidEmail(regEmail)) { setError('Enter a valid email address'); return; }
    if (regPassword !== regConfirm) { setError('Passwords do not match'); return; }
    setLoading(true);
    try {
      const res = await axios.post(`${API}/auth/register`, {
        phone: formatPhone(regPhone), email: regEmail.trim(), password: regPassword,
        name: regName.trim() || undefined, city: regCity.trim() || undefined,
        pincode: regPincode.trim() || undefined, gender: regGender || undefined,
        role_preference: regRole || undefined,
      });
      const { access_token, refresh_token, user, profile, sathihub_profile, documents } = res.data.data;
      const merged = { ...user, profile: profile || null, sathihub_profile: sathihub_profile || null, documents: documents || [] };
      login(access_token, refresh_token, merged);
      handleClose();
      if (regRole === 'sathihub' || regRole === 'both') navigate('/membership');
      else navigate('/dashboard');
    } catch (err) { setError(getErrorMessage(err)); }
    finally { setLoading(false); }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!loginIdentifier.trim()) { setError('Enter your phone number or email'); return; }
    if (!loginPassword) { setError('Enter your password'); return; }
    const identifier = isValidPhone(loginIdentifier) ? formatPhone(loginIdentifier) : loginIdentifier.trim();
    setLoading(true);
    try {
      const res = await axios.post(`${API}/auth/login`, { identifier, password: loginPassword });
      const { access_token, refresh_token, user, profile, sathihub_profile, documents } = res.data.data;
      const merged = { ...user, profile: profile || null, sathihub_profile: sathihub_profile || null, documents: documents || [] };
      login(access_token, refresh_token, merged);
      handleClose();
      navigate('/dashboard');
    } catch (err) { setError(getErrorMessage(err)); }
    finally { setLoading(false); }
  };

  const handleSendLoginOtp = async () => {
    setError('');
    if (!loginIdentifier.trim()) { setError('Enter your phone number'); return; }
    const phone = isValidPhone(loginIdentifier) ? formatPhone(loginIdentifier) : loginIdentifier.trim();
    setLoading(true);
    try {
      await axios.post(`${API}/auth/send-otp`, { value: phone, identifier_type: 'phone' });
      setOtpSent(true); setOtpCooldown(60);
    } catch (err) { setError(getErrorMessage(err)); }
    finally { setLoading(false); }
  };

  const handleLoginOtp = async (e) => {
    e.preventDefault(); setError('');
    if (!loginOtp || loginOtp.length !== 6) { setError('Enter 6-digit OTP'); return; }
    const phone = isValidPhone(loginIdentifier) ? formatPhone(loginIdentifier) : loginIdentifier.trim();
    setLoading(true);
    try {
      const res = await axios.post(`${API}/auth/login-otp`, { phone, otp: loginOtp });
      const { access_token, refresh_token, user, profile, sathihub_profile, documents } = res.data.data;
      const merged = { ...user, profile: profile || null, sathihub_profile: sathihub_profile || null, documents: documents || [] };
      login(access_token, refresh_token, merged);
      handleClose(); navigate('/dashboard');
    } catch (err) { setError(getErrorMessage(err)); }
    finally { setLoading(false); }
  };

  const handleForgotPassword = async (e) => {
    e?.preventDefault(); setError(''); setSuccess('');
    if (!fpIdentifier.trim()) { setError('Enter your phone number or email'); return; }
    const identifier = isValidPhone(fpIdentifier) ? formatPhone(fpIdentifier) : fpIdentifier.trim();
    setLoading(true);
    try {
      await axios.post(`${API}/auth/forgot-password`, { identifier });
    } catch (_) {}
    finally {
      setSuccess('If an account exists, an OTP has been sent.');
      setStep('reset-password'); setOtpCooldown(600); setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault(); setError(''); setSuccess('');
    if (fpOtp.length !== 6) { setError('Enter the 6-digit OTP'); return; }
    if (!isStrongPassword(fpNewPassword)) { setError('Password needs 8+ chars, 1 uppercase, 1 number, 1 special character (@$!%*?&)'); return; }
    const identifier = isValidPhone(fpIdentifier) ? formatPhone(fpIdentifier) : fpIdentifier.trim();
    setLoading(true);
    try {
      await axios.post(`${API}/auth/reset-password`, { identifier, otp: fpOtp, new_password: fpNewPassword });
      setSuccess('Password reset! You can now log in.');
      setTimeout(() => { setStep('login'); setLoginIdentifier(fpIdentifier); setSuccess(''); }, 1500);
    } catch (err) { setError(getErrorMessage(err)); }
    finally { setLoading(false); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && handleClose()}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 rounded-t-2xl relative">
          <button onClick={handleClose} className="absolute top-4 right-4 text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 transition-colors">
            <X size={24} />
          </button>
          <h2 className="text-2xl font-bold text-white">Welcome to SathiHub</h2>
          <p className="text-purple-100 mt-1">Your social & lifestyle support platform</p>
        </div>

        <div className="p-6">
          {(step === 'login' || step === 'register') && (
            <div className="flex gap-2 mb-6">
              {[{ key: 'login', label: 'Login' }, { key: 'register', label: 'Register' }].map(({ key, label }) => (
                <button key={key} type="button" onClick={() => { setStep(key); setError(''); setSuccess(''); }}
                  className={`flex-1 py-3 rounded-lg font-semibold transition-all ${step === key ? 'bg-purple-600 text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {label}
                </button>
              ))}
            </div>
          )}

          {step === 'login' && (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg mb-4 text-sm">
              <p className="font-medium">🔄 System Updated</p>
              <p className="text-xs mt-1">If unable to login, use "Forgot Password" to reset your password.</p>
            </div>
          )}

          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm font-medium">{error}</div>}
          {success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm font-medium">{success}</div>}

          {/* LOGIN */}
          {step === 'login' && (
            <div className="space-y-4">
              <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
                {[{ key: 'password', label: 'Password' }, { key: 'otp', label: 'Login with OTP' }].map(({ key, label }) => (
                  <button key={key} type="button"
                    onClick={() => { setLoginMethod(key); setOtpSent(false); setLoginOtp(''); setError(''); }}
                    className={`flex-1 py-2 rounded-md text-sm font-medium transition ${loginMethod === key ? 'bg-white shadow text-purple-700' : 'text-gray-500'}`}>
                    {label}
                  </button>
                ))}
              </div>

              {loginMethod === 'password' && (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone or Email</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input type="text" value={loginIdentifier} onChange={(e) => setLoginIdentifier(e.target.value)}
                        placeholder="Mobile number or email"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" autoComplete="username" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input type={showPassword ? 'text' : 'password'} value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="Your password"
                        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" autoComplete="current-password" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    <div className="text-right mt-1">
                      <button type="button" onClick={() => { setStep('forgot-password'); setError(''); }}
                        className="text-sm text-purple-600 hover:text-purple-700 font-medium">Forgot password?</button>
                    </div>
                  </div>
                  <button type="submit" disabled={loading}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:shadow-xl disabled:opacity-50 flex items-center justify-center gap-2">
                    {loading ? <><Loader2 className="animate-spin" size={18} /> Logging in...</> : 'Login'}
                  </button>
                </form>
              )}

              {loginMethod === 'otp' && (
                <form onSubmit={handleLoginOtp} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input type="text" value={loginIdentifier} onChange={(e) => { setLoginIdentifier(e.target.value); setOtpSent(false); }}
                        placeholder="Enter your mobile number" disabled={otpSent}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
                    </div>
                  </div>
                  {!otpSent ? (
                    <button type="button" onClick={handleSendLoginOtp} disabled={loading}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
                      {loading ? <><Loader2 className="animate-spin" size={18} /> Sending...</> : 'Send OTP'}
                    </button>
                  ) : (
                    <>
                      <input type="text" inputMode="numeric" value={loginOtp}
                        onChange={(e) => setLoginOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="6-digit OTP" maxLength={6}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-xl tracking-widest font-mono focus:ring-2 focus:ring-purple-500" autoFocus />
                      <button type="submit" disabled={loading || loginOtp.length !== 6}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
                        {loading ? <><Loader2 className="animate-spin" size={18} /> Verifying...</> : 'Verify & Login'}
                      </button>
                      <div className="text-center">
                        <button type="button" onClick={handleSendLoginOtp} disabled={otpCooldown > 0 || loading}
                          className="text-sm text-purple-600 disabled:opacity-50">
                          {otpCooldown > 0 ? `Resend in ${otpCooldown}s` : 'Resend OTP'}
                        </button>
                      </div>
                    </>
                  )}
                </form>
              )}
            </div>
          )}

          {/* REGISTER */}
          {step === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input type="tel" value={regPhone} onChange={(e) => setRegPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="10-digit mobile number" maxLength={10}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input type="email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} placeholder="your@email.com"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input type={showPassword ? 'text' : 'password'} value={regPassword} onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input type={showConfirm ? 'text' : 'password'} value={regConfirm} onChange={(e) => setRegConfirm(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full px-4 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {regConfirm && regPassword !== regConfirm && <p className="text-red-500 text-xs mt-1">Passwords do not match</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
                <input type="text" value={regName} onChange={(e) => setRegName(e.target.value)} placeholder="Your full name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input type="text" value={regCity} onChange={(e) => setRegCity(e.target.value)} placeholder="Your city"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                  <input type="text" value={regPincode} onChange={(e) => setRegPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="6-digit" maxLength={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select value={regGender} onChange={(e) => setRegGender(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white">
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">I want to <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-3 gap-2">
                  {[{ value: 'client', label: 'Find a SathiHub' }, { value: 'sathihub', label: 'Become a SathiHub' }, { value: 'both', label: 'Both' }].map((opt) => (
                    <button key={opt.value} type="button" onClick={() => setRegRole(opt.value)}
                      className={`py-2.5 px-2 rounded-lg text-xs font-medium border-2 transition ${regRole === opt.value ? 'border-purple-600 bg-purple-50 text-purple-700' : 'border-gray-200 text-gray-600 hover:border-purple-300'}`}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:shadow-xl disabled:opacity-50 flex items-center justify-center gap-2">
                {loading ? <><Loader2 className="animate-spin" size={18} /> Creating account...</> : 'Create Account'}
              </button>
            </form>
          )}

          {/* FORGOT PASSWORD */}
          {step === 'forgot-password' && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="text-center mb-2">
                <h3 className="text-lg font-semibold text-gray-800">Forgot Password?</h3>
                <p className="text-sm text-gray-500 mt-1">Enter your phone or email — we'll send an OTP</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone or Email</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input type="text" value={fpIdentifier} onChange={(e) => setFpIdentifier(e.target.value)}
                    placeholder="Mobile number or email" autoFocus
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
                </div>
              </div>
              <button type="submit" disabled={loading || !fpIdentifier.trim()}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
                {loading ? <><Loader2 className="animate-spin" size={18} /> Sending OTP...</> : 'Send OTP'}
              </button>
              <div className="text-center">
                <button type="button" onClick={() => { setStep('login'); setError(''); }} className="text-sm text-gray-500 hover:text-gray-700">← Back to Login</button>
              </div>
            </form>
          )}

          {/* RESET PASSWORD */}
          {step === 'reset-password' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="text-center mb-2">
                <h3 className="text-lg font-semibold text-gray-800">Reset Password</h3>
                <p className="text-sm text-gray-500 mt-1">Enter the OTP sent to <strong>{fpIdentifier}</strong></p>
              </div>
              <input type="text" value={fpOtp} onChange={(e) => setFpOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="6-digit OTP" maxLength={6} autoFocus
                className="w-full px-4 py-4 border-2 border-gray-300 rounded-lg text-center text-2xl tracking-[0.5em] font-mono focus:ring-2 focus:ring-purple-500" />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input type={showPassword ? 'text' : 'password'} value={fpNewPassword} onChange={(e) => setFpNewPassword(e.target.value)}
                    placeholder="Min 8 chars, 1 uppercase, 1 number, 1 special"
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading || fpOtp.length !== 6 || !fpNewPassword}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
                {loading ? <><Loader2 className="animate-spin" size={18} /> Resetting...</> : 'Reset Password'}
              </button>
              <div className="flex items-center justify-between text-sm">
                <button type="button" onClick={() => { setStep('forgot-password'); setFpOtp(''); setError(''); }} className="text-gray-500 hover:text-gray-700">← Change identifier</button>
                <button type="button" onClick={() => handleForgotPassword(null)} disabled={otpCooldown > 0 || loading}
                  className="text-purple-600 hover:text-purple-700 font-medium disabled:opacity-50">
                  {otpCooldown > 0 ? `Resend in ${otpCooldown}s` : 'Resend OTP'}
                </button>
              </div>
            </form>
          )}

          <p className="text-xs text-gray-400 text-center mt-6">
            By continuing, you agree to our{' '}
            <a href="/terms" className="text-purple-600 hover:underline">Terms</a> and{' '}
            <a href="/privacy" className="text-purple-600 hover:underline">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
