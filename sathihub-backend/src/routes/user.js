const express = require('express');
const supabase = require('../config/supabase');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

router.get('/me', authenticate, async (req, res) => {
  try {
    const { data: user } = await supabase.from('users').select('*').eq('id', req.user.userId).maybeSingle();
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const { data: profile } = await supabase.from('profiles').select('*').eq('user_id', user.id).maybeSingle();
    const { data: sathiProfile } = await supabase.from('sathi_profiles').select('*').eq('user_id', user.id).maybeSingle();
    const { data: documents } = await supabase.from('documents').select('*').eq('user_id', user.id);
    const { password_hash, ...safeUser } = user;
    return res.json({ success: true, data: { user: safeUser, profile: profile || null, kopartner_profile: sathiProfile || null, documents: documents || [] } });
  } catch (err) { return res.status(500).json({ success: false, message: 'Something went wrong' }); }
});

router.put('/profile', authenticate, async (req, res) => {
  try {
    const { name, city, pincode, gender, bio, profile_photo } = req.body;
    const updates = { updated_at: new Date().toISOString() };
    if (name !== undefined) updates.name = name;
    if (city !== undefined) updates.city = city;
    if (pincode !== undefined) updates.pincode = pincode;
    if (gender !== undefined) updates.gender = gender;
    if (bio !== undefined) updates.bio = bio;
    if (profile_photo !== undefined) updates.profile_photo = profile_photo;
    const { data, error } = await supabase.from('profiles').update(updates).eq('user_id', req.user.userId).select().single();
    if (error) throw error;
    return res.json({ success: true, data });
  } catch (err) { return res.status(500).json({ success: false, message: 'Something went wrong' }); }
});

router.put('/sathi-profile', authenticate, async (req, res) => {
  try {
    const { hourly_rate, services, is_available } = req.body;
    const updates = { updated_at: new Date().toISOString() };
    if (hourly_rate !== undefined) updates.hourly_rate = hourly_rate;
    if (services !== undefined) updates.services = services;
    if (is_available !== undefined) updates.is_available = is_available;
    const { data, error } = await supabase.from('sathi_profiles')
      .upsert({ user_id: req.user.userId, ...updates }, { onConflict: 'user_id' }).select().single();
    if (error) throw error;
    return res.json({ success: true, data });
  } catch (err) { return res.status(500).json({ success: false, message: 'Something went wrong' }); }
});

module.exports = router;
