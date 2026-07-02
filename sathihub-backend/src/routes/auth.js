const express = require('express');
const bcrypt = require('bcryptjs');
const supabase = require('../config/supabase');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken, getRefreshTokenExpiry } = require('../utils/jwt');
const router = express.Router();

async function buildUserResponse(user) {
  const { data: profile } = await supabase.from('profiles').select('*').eq('user_id', user.id).maybeSingle();
  const { data: sathiProfile } = await supabase.from('sathi_profiles').select('*').eq('user_id', user.id).maybeSingle();
  const { data: documents } = await supabase.from('documents').select('*').eq('user_id', user.id);
  const { password_hash, ...safeUser } = user;
  return { user: safeUser, profile: profile || null, kopartner_profile: sathiProfile || null, documents: documents || [] };
}

async function issueTokens(user) {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  await supabase.from('refresh_tokens').insert({ user_id: user.id, token: refreshToken, expires_at: getRefreshTokenExpiry() });
  return { accessToken, refreshToken };
}

// REGISTER
router.post('/register', async (req, res) => {
  const { email, password, phone, name, city, pincode, gender, role_preference } = req.body;
  if (!email || !password) return res.status(422).json({ success: false, message: 'Email and password required' });
  try {
    const { data: existing } = await supabase.from('users').select('id').eq('email', email.toLowerCase().trim()).maybeSingle();
    if (existing) return res.status(409).json({ success: false, error_code: 'EMAIL_EXISTS', message: 'Email already registered' });
    if (phone) {
      const { data: existPhone } = await supabase.from('users').select('id').eq('phone', phone).maybeSingle();
      if (existPhone) return res.status(409).json({ success: false, error_code: 'PHONE_EXISTS', message: 'Phone already registered' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    let role = 'client';
    if (role_preference === 'kopartner') role = 'sathi';
    else if (role_preference === 'both') role = 'both';
    const { data: newUser, error: uErr } = await supabase.from('users')
      .insert({ email: email.toLowerCase().trim(), phone: phone || null, password_hash: passwordHash, role })
      .select().single();
    if (uErr) throw uErr;
    // First 1000 users get free premium
    const { count } = await supabase.from('users').select('*', { count: 'exact', head: true });
    if ((count || 0) <= 1000) {
      await supabase.from('users').update({ is_premium: true }).eq('id', newUser.id);
      newUser.is_premium = true;
    }
    await supabase.from('profiles').insert({ user_id: newUser.id, name: name || null, city: city || null, pincode: pincode || null, gender: gender || null });
    if (role === 'sathi' || role === 'both') await supabase.from('sathi_profiles').insert({ user_id: newUser.id });
    const { accessToken, refreshToken } = await issueTokens(newUser);
    const responseData = await buildUserResponse(newUser);
    return res.status(201).json({ success: true, data: { access_token: accessToken, refresh_token: refreshToken, ...responseData } });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ success: false, message: 'Something went wrong' });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  const { identifier, password } = req.body;
  if (!identifier || !password) return res.status(422).json({ success: false, message: 'Identifier and password required' });
  try {
    const isEmail = identifier.includes('@');
    const { data: user } = await supabase.from('users').select('*')
      .eq(isEmail ? 'email' : 'phone', isEmail ? identifier.toLowerCase().trim() : identifier.trim()).maybeSingle();
    if (!user || !user.is_active) return res.status(401).json({ success: false, error_code: 'INVALID_CREDENTIALS', message: 'Invalid credentials' });
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ success: false, error_code: 'INVALID_CREDENTIALS', message: 'Invalid credentials' });
    const { accessToken, refreshToken } = await issueTokens(user);
    const responseData = await buildUserResponse(user);
    return res.json({ success: true, data: { access_token: accessToken, refresh_token: refreshToken, ...responseData } });
  } catch (err) { return res.status(500).json({ success: false, message: 'Something went wrong' }); }
});

// REFRESH
router.post('/refresh', async (req, res) => {
  const { refresh_token } = req.body;
  if (!refresh_token) return res.status(401).json({ success: false, message: 'Refresh token required' });
  try {
    const decoded = verifyRefreshToken(refresh_token);
    const { data: stored } = await supabase.from('refresh_tokens').select('*').eq('token', refresh_token).eq('revoked', false).maybeSingle();
    if (!stored) return res.status(401).json({ success: false, message: 'Token invalid or revoked' });
    const { data: user } = await supabase.from('users').select('*').eq('id', decoded.userId).maybeSingle();
    if (!user || !user.is_active) return res.status(401).json({ success: false, message: 'User not found' });
    return res.json({ success: true, data: { access_token: generateAccessToken(user) } });
  } catch { return res.status(401).json({ success: false, message: 'Token invalid or expired' }); }
});

// LOGOUT
router.post('/logout', async (req, res) => {
  const { refresh_token } = req.body;
  if (refresh_token) await supabase.from('refresh_tokens').update({ revoked: true }).eq('token', refresh_token);
  return res.json({ success: true });
});

// FORGOT PASSWORD
router.post('/forgot-password', async (req, res) => {
  const { identifier } = req.body;
  if (!identifier) return res.status(422).json({ success: false, message: 'Identifier required' });
  try {
    const isEmail = identifier.includes('@');
    const { data: user } = await supabase.from('users').select('id').eq(isEmail ? 'email' : 'phone', isEmail ? identifier.toLowerCase().trim() : identifier.trim()).maybeSingle();
    if (user) {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      await supabase.from('password_reset_otps').insert({ user_id: user.id, otp, expires_at: new Date(Date.now() + 10 * 60 * 1000) });
      console.log(`[DEV] OTP for ${identifier}: ${otp}`);
    }
  } catch {}
  return res.json({ success: true, message: 'If account exists, OTP sent.' });
});

// RESET PASSWORD
router.post('/reset-password', async (req, res) => {
  const { identifier, otp, new_password } = req.body;
  if (!identifier || !otp || !new_password) return res.status(422).json({ success: false, message: 'All fields required' });
  try {
    const isEmail = identifier.includes('@');
    const { data: user } = await supabase.from('users').select('id').eq(isEmail ? 'email' : 'phone', isEmail ? identifier.toLowerCase().trim() : identifier.trim()).maybeSingle();
    if (!user) return res.status(400).json({ success: false, message: 'Invalid OTP' });
    const { data: otpRecord } = await supabase.from('password_reset_otps').select('*').eq('user_id', user.id).eq('otp', otp).eq('used', false).gte('expires_at', new Date().toISOString()).order('created_at', { ascending: false }).limit(1).maybeSingle();
    if (!otpRecord) return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    const passwordHash = await bcrypt.hash(new_password, 10);
    await supabase.from('users').update({ password_hash: passwordHash }).eq('id', user.id);
    await supabase.from('password_reset_otps').update({ used: true }).eq('id', otpRecord.id);
    await supabase.from('refresh_tokens').update({ revoked: true }).eq('user_id', user.id);
    return res.json({ success: true, message: 'Password reset successfully' });
  } catch (err) { return res.status(500).json({ success: false, message: 'Something went wrong' }); }
});

// CHANGE PASSWORD (logged in)
router.post('/change-password', require('../middleware/auth').authenticate, async (req, res) => {
  const { current_password, new_password } = req.body;
  if (!current_password || !new_password) return res.status(422).json({ success: false, message: 'Both fields required' });
  try {
    const { data: user } = await supabase.from('users').select('*').eq('id', req.user.userId).maybeSingle();
    const match = await bcrypt.compare(current_password, user.password_hash);
    if (!match) return res.status(401).json({ success: false, message: 'Current password is wrong' });
    const hash = await bcrypt.hash(new_password, 10);
    await supabase.from('users').update({ password_hash: hash }).eq('id', req.user.userId);
    return res.json({ success: true, message: 'Password changed' });
  } catch { return res.status(500).json({ success: false, message: 'Something went wrong' }); }
});

module.exports = router;
