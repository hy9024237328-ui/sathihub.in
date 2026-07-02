const express = require('express');
const supabase = require('../config/supabase');
const { authenticate } = require('../middleware/auth');
const router = express.Router();
const PRICES = { 'Elder Care':1000,'Hangingout':1500,'Clubbing':2000,'Movie Partner':2000,'Shopping Buddy':2000,'Medical Support':2000,'Domestic Help':2000,'Travel Partner':2000 };

router.post('/', authenticate, async (req, res) => {
  const { sathi_id, service_type, scheduled_date, scheduled_time, duration_hours, address, notes } = req.body;
  if (!sathi_id || !service_type || !scheduled_date || !scheduled_time)
    return res.status(422).json({ success: false, message: 'sathi_id, service_type, scheduled_date, scheduled_time required' });
  try {
    const hours = parseFloat(duration_hours) || 1;
    const total = (PRICES[service_type] || 1500) * hours;
    const { data: booking, error } = await supabase.from('bookings').insert({ client_id: req.user.userId, sathi_id, service_type, scheduled_date, scheduled_time, duration_hours: hours, total_amount: total, address: address||null, notes: notes||null, status:'pending' }).select().single();
    if (error) throw error;
    const { data: cp } = await supabase.from('profiles').select('name').eq('user_id', req.user.userId).maybeSingle();
    await supabase.from('notifications').insert({ user_id: sathi_id, title:'New Booking Request! 🎉', message:`${cp?.name||'A client'} wants ${service_type} on ${scheduled_date}. Total: ₹${total}`, type:'booking', related_id: booking.id });
    return res.status(201).json({ success: true, data: booking });
  } catch (err) { console.error(err); return res.status(500).json({ success: false, message: 'Something went wrong' }); }
});

router.get('/notifications', authenticate, async (req, res) => {
  try {
    const { data } = await supabase.from('notifications').select('*').eq('user_id', req.user.userId).order('created_at', { ascending: false }).limit(20);
    return res.json({ success: true, data: data||[], unread_count: (data||[]).filter(n=>!n.is_read).length });
  } catch { return res.status(500).json({ success: false, message: 'Something went wrong' }); }
});

router.patch('/notifications/read', authenticate, async (req, res) => {
  try {
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', req.user.userId).eq('is_read', false);
    return res.json({ success: true });
  } catch { return res.status(500).json({ success: false, message: 'Something went wrong' }); }
});

router.get('/', authenticate, async (req, res) => {
  try {
    const { role } = req.query;
    const { data } = await supabase.from('bookings').select('*').eq(role==='sathi'?'sathi_id':'client_id', req.user.userId).order('created_at', { ascending: false });
    return res.json({ success: true, data: data||[] });
  } catch { return res.status(500).json({ success: false, message: 'Something went wrong' }); }
});

router.patch('/:id/status', authenticate, async (req, res) => {
  const { status } = req.body;
  if (!['confirmed','rejected','completed','cancelled'].includes(status))
    return res.status(422).json({ success: false, message: 'Invalid status' });
  try {
    const { data: b } = await supabase.from('bookings').select('*').eq('id', req.params.id).maybeSingle();
    if (!b) return res.status(404).json({ success: false, message: 'Not found' });
    const isSathi = b.sathi_id === req.user.userId;
    const isClient = b.client_id === req.user.userId;
    if (!isSathi && !isClient) return res.status(403).json({ success: false, message: 'Not authorized' });
    const { data: updated, error } = await supabase.from('bookings').update({ status }).eq('id', req.params.id).select().single();
    if (error) throw error;
    const notifyId = isSathi ? b.client_id : b.sathi_id;
    const msgs = { confirmed:`Your ${b.service_type} booking on ${b.scheduled_date} is CONFIRMED! ✅`, rejected:`Your ${b.service_type} booking was not accepted.`, completed:`${b.service_type} booking completed.`, cancelled:`${b.service_type} booking cancelled.` };
    await supabase.from('notifications').insert({ user_id: notifyId, title: status==='confirmed'?'Booking Confirmed! 🎉':`Booking ${status}`, message: msgs[status], type:'booking', related_id: b.id });
    return res.json({ success: true, data: updated });
  } catch (err) { return res.status(500).json({ success: false, message: 'Something went wrong' }); }
});

module.exports = router;
