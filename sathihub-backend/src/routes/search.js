const express = require('express');
const supabase = require('../config/supabase');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

router.get('/sathis', authenticate, async (req, res) => {
  try {
    const { city, service, sort='rating', page=1, page_size=20 } = req.query;
    const offset = (parseInt(page)-1) * parseInt(page_size);
    let query = supabase.from('sathi_profiles').select(`*, profile:profiles(name,city,profile_photo,bio,gender), user:users(id,email,role,is_active)`).eq('is_available', true).range(offset, offset+parseInt(page_size)-1);
    if (sort==='rating') query = query.order('rating', { ascending: false });
    else if (sort==='price_low') query = query.order('hourly_rate', { ascending: true });
    else if (sort==='price_high') query = query.order('hourly_rate', { ascending: false });
    const { data: sathis, error } = await query;
    if (error) throw error;
    let filtered = (sathis||[]).filter(s => s.user?.is_active && s.profile);
    if (city && city!=='All Cities') filtered = filtered.filter(s => s.profile?.city?.toLowerCase().includes(city.toLowerCase()));
    if (service && service!=='All Services') filtered = filtered.filter(s => s.services?.includes(service));
    return res.json({ success: true, data: { sathis: filtered, total: filtered.length } });
  } catch (err) { console.error(err); return res.status(500).json({ success: false, message: 'Something went wrong' }); }
});

module.exports = router;
