const express = require('express');
const supabase = require('../config/supabase');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

router.post('/profile-photo', authenticate, async (req, res) => {
  try {
    const { base64, fileName, mimeType } = req.body;
    if (!base64||!fileName) return res.status(422).json({ success: false, message: 'base64 and fileName required' });
    const buffer = Buffer.from(base64, 'base64');
    const filePath = `${req.user.userId}/${Date.now()}_${fileName}`;
    const { error: uploadError } = await supabase.storage.from('profiles').upload(filePath, buffer, { contentType: mimeType||'image/jpeg', upsert: true });
    if (uploadError) throw uploadError;
    const { data: { publicUrl } } = supabase.storage.from('profiles').getPublicUrl(filePath);
    await supabase.from('profile_photos').insert({ user_id: req.user.userId, photo_url: publicUrl, is_primary: true });
    await supabase.from('profiles').update({ profile_photo: publicUrl, updated_at: new Date().toISOString() }).eq('user_id', req.user.userId);
    return res.json({ success: true, data: { url: publicUrl } });
  } catch (err) { return res.status(500).json({ success: false, message: 'Upload failed: '+err.message }); }
});

router.post('/extra-photo', authenticate, async (req, res) => {
  try {
    const { base64, fileName, mimeType } = req.body;
    if (!base64||!fileName) return res.status(422).json({ success: false, message: 'base64 and fileName required' });
    const buffer = Buffer.from(base64, 'base64');
    const filePath = `${req.user.userId}/extra_${Date.now()}_${fileName}`;
    const { error } = await supabase.storage.from('photos').upload(filePath, buffer, { contentType: mimeType||'image/jpeg', upsert: true });
    if (error) throw error;
    const { data: { publicUrl } } = supabase.storage.from('photos').getPublicUrl(filePath);
    await supabase.from('profile_photos').insert({ user_id: req.user.userId, photo_url: publicUrl, is_primary: false });
    return res.json({ success: true, data: { url: publicUrl } });
  } catch (err) { return res.status(500).json({ success: false, message: 'Upload failed: '+err.message }); }
});

router.get('/my-photos', authenticate, async (req, res) => {
  try {
    const { data } = await supabase.from('profile_photos').select('*').eq('user_id', req.user.userId).order('created_at', { ascending: false });
    return res.json({ success: true, data: data||[] });
  } catch { return res.status(500).json({ success: false, message: 'Something went wrong' }); }
});

router.delete('/photo/:id', authenticate, async (req, res) => {
  try {
    await supabase.from('profile_photos').delete().eq('id', req.params.id).eq('user_id', req.user.userId);
    return res.json({ success: true });
  } catch { return res.status(500).json({ success: false, message: 'Something went wrong' }); }
});

module.exports = router;
