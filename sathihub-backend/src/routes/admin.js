const express = require('express');
const bcrypt = require('bcryptjs');
const supabase = require('../config/supabase');
const { authenticateAdmin } = require('../middleware/adminAuth');
const router = express.Router();

// ============================================================
// POST /api/v1/admin/login
// Separate admin login — checks role === 'admin'
// ============================================================
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(422).json({ success: false, message: 'Email and password required' });

  try {
    const { data: user } = await supabase.from('users').select('*').eq('email', email.toLowerCase().trim()).maybeSingle();
    if (!user || user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
    }
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ success: false, message: 'Invalid admin credentials' });

    const jwt = require('jsonwebtoken');
    const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '12h' });

    return res.json({ success: true, data: { access_token: token, email: user.email } });
  } catch (err) {
    console.error('Admin login error:', err);
    return res.status(500).json({ success: false, message: 'Something went wrong' });
  }
});

// ============================================================
// POST /api/v1/admin/create-sathi
// Admin creates a complete Sathi profile (account + profile + photos)
// ============================================================
router.post('/create-sathi', authenticateAdmin, async (req, res) => {
  try {
    const { name, email, phone, city, gender, bio, hourly_rate, services, rating, photo_url, password } = req.body;

    if (!name || !email) return res.status(422).json({ success: false, message: 'Name and email are required' });

    // Generate a default password if not provided
    const finalPassword = password || `Sathi@${Math.floor(1000 + Math.random() * 9000)}`;
    const passwordHash = await bcrypt.hash(finalPassword, 10);

    // Create user account with role 'sathi'
    const { data: newUser, error: userError } = await supabase.from('users').insert({
      email: email.toLowerCase().trim(),
      phone: phone || null,
      password_hash: passwordHash,
      role: 'sathi',
      is_active: true,
      is_phone_verified: true,
      is_email_verified: true,
    }).select().single();

    if (userError) throw userError;

    // Create profile
    await supabase.from('profiles').insert({
      user_id: newUser.id,
      name,
      city: city || null,
      gender: gender || null,
      bio: bio || null,
      profile_photo: photo_url || null,
    });

    // Create sathi_profile
    await supabase.from('sathi_profiles').insert({
      user_id: newUser.id,
      services: services || [],
      hourly_rate: hourly_rate || 1500,
      rating: rating || 4.8,
      is_verified: true,
      is_available: true,
    });

    // If photo provided, also log it in profile_photos
    if (photo_url) {
      await supabase.from('profile_photos').insert({ user_id: newUser.id, photo_url, is_primary: true });
    }

    return res.status(201).json({
      success: true,
      data: { user_id: newUser.id, email: newUser.email, generated_password: password ? undefined : finalPassword },
    });
  } catch (err) {
    console.error('Create sathi error:', err);
    if (err.code === '23505') return res.status(409).json({ success: false, message: 'Email already exists' });
    return res.status(500).json({ success: false, message: 'Something went wrong: ' + err.message });
  }
});

// ============================================================
// GET /api/v1/admin/sathis
// List all Sathis for admin management
// ============================================================
router.get('/sathis', authenticateAdmin, async (req, res) => {
  try {
    const { data: users } = await supabase.from('users').select('id, email, phone, role, is_active, created_at').in('role', ['sathi', 'both']);

    const sathisWithProfiles = await Promise.all((users || []).map(async (u) => {
      const { data: profile } = await supabase.from('profiles').select('*').eq('user_id', u.id).maybeSingle();
      const { data: sathiProfile } = await supabase.from('sathi_profiles').select('*').eq('user_id', u.id).maybeSingle();
      return { ...u, profile, sathi_profile: sathiProfile };
    }));

    return res.json({ success: true, data: sathisWithProfiles });
  } catch (err) {
    console.error('List sathis error:', err);
    return res.status(500).json({ success: false, message: 'Something went wrong' });
  }
});

// ============================================================
// DELETE /api/v1/admin/sathis/:id
// ============================================================
router.delete('/sathis/:id', authenticateAdmin, async (req, res) => {
  try {
    await supabase.from('users').delete().eq('id', req.params.id);
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Something went wrong' });
  }
});

// ============================================================
// PATCH /api/v1/admin/sathis/:id
// Update a sathi's details
// ============================================================
router.patch('/sathis/:id', authenticateAdmin, async (req, res) => {
  try {
    const { name, city, bio, hourly_rate, services, rating, is_active, photo_url } = req.body;
    const userId = req.params.id;

    if (is_active !== undefined) {
      await supabase.from('users').update({ is_active }).eq('id', userId);
    }

    const profileUpdates = {};
    if (name !== undefined) profileUpdates.name = name;
    if (city !== undefined) profileUpdates.city = city;
    if (bio !== undefined) profileUpdates.bio = bio;
    if (photo_url !== undefined) profileUpdates.profile_photo = photo_url;
    if (Object.keys(profileUpdates).length > 0) {
      await supabase.from('profiles').update(profileUpdates).eq('user_id', userId);
    }

    const sathiUpdates = {};
    if (hourly_rate !== undefined) sathiUpdates.hourly_rate = hourly_rate;
    if (services !== undefined) sathiUpdates.services = services;
    if (rating !== undefined) sathiUpdates.rating = rating;
    if (Object.keys(sathiUpdates).length > 0) {
      await supabase.from('sathi_profiles').update(sathiUpdates).eq('user_id', userId);
    }

    return res.json({ success: true });
  } catch (err) {
    console.error('Update sathi error:', err);
    return res.status(500).json({ success: false, message: 'Something went wrong' });
  }
});

// ============================================================
// GET /api/v1/admin/stats
// Dashboard stats for admin
// ============================================================
router.get('/stats', authenticateAdmin, async (req, res) => {
  try {
    const { count: totalUsers } = await supabase.from('users').select('*', { count: 'exact', head: true });
    const { count: totalSathis } = await supabase.from('users').select('*', { count: 'exact', head: true }).in('role', ['sathi', 'both']);
    const { count: totalClients } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'client');
    const { count: totalBookings } = await supabase.from('bookings').select('*', { count: 'exact', head: true });
    const { count: pendingBookings } = await supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'pending');

    return res.json({
      success: true,
      data: { totalUsers, totalSathis, totalClients, totalBookings, pendingBookings },
    });
  } catch (err) {
    console.error('Admin stats error:', err);
    return res.status(500).json({ success: false, message: 'Something went wrong' });
  }
});

// ============================================================
// POST /api/v1/admin/upload-photo
// Admin uploads a photo for a sathi (base64)
// ============================================================
router.post('/upload-photo', authenticateAdmin, async (req, res) => {
  try {
    const { base64, fileName, mimeType } = req.body;
    if (!base64 || !fileName) return res.status(422).json({ success: false, message: 'base64 and fileName required' });

    const buffer = Buffer.from(base64, 'base64');
    const filePath = `admin/${Date.now()}_${fileName}`;

    const { error: uploadError } = await supabase.storage.from('profiles').upload(filePath, buffer, {
      contentType: mimeType || 'image/jpeg', upsert: true,
    });
    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage.from('profiles').getPublicUrl(filePath);
    return res.json({ success: true, data: { url: publicUrl } });
  } catch (err) {
    console.error('Admin upload error:', err);
    return res.status(500).json({ success: false, message: 'Upload failed: ' + err.message });
  }
});

module.exports = router;
