const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const Lead = require('../models/Lead');
const { triggerWebhook } = require('../services/webhook');
const { generateEmail } = require('../services/groq');
const { sendEmail } = require('../services/mailer');

// POST /api/add-lead
router.post('/add-lead', auth, async (req, res) => {
  try {
    const { name, email, hotel, location, notes, language } = req.body;
    if (!name || !email || !hotel || !location) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const lead = await Lead.create({ name, email, hotel, location, notes, language: language || 'de' });

    // FLOW 1: Send cold contact email immediately
    const { flow1_entry } = require('../services/funnel');
    flow1_entry(lead).catch((err) => console.error('Flow 1 error:', err.message));

    // Also trigger n8n webhook (optional, non-blocking)
    triggerWebhook({
      name, email, hotel, location,
      leadId: lead._id.toString(),
      type: 'initial',
    }).catch((err) => console.error('Webhook trigger failed:', err.message));

    res.status(201).json({ message: 'Lead added', lead });
  } catch (err) {
    console.error('add-lead error:', err.message);
    res.status(500).json({ error: 'Failed to add lead' });
  }
});

// GET /api/leads
router.get('/leads', auth, async (req, res) => {
  try {
    const { search, status } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { hotel: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }
    const leads = await Lead.find(filter).sort({ createdAt: -1 });
    res.json(leads);
  } catch (err) {
    console.error('get-leads error:', err.message);
    res.status(500).json({ error: 'Failed to fetch leads' });
  }
});

// POST /api/update-lead
router.post('/update-lead', auth, async (req, res) => {
  try {
    const { leadId, status, notes } = req.body;
    if (!leadId) return res.status(400).json({ error: 'leadId required' });
    const update = {};
    if (status) update.status = status;
    if (notes !== undefined) update.notes = notes;
    const lead = await Lead.findByIdAndUpdate(leadId, update, { new: true });
    if (!lead) return res.status(404).json({ error: 'Lead not found' });
    res.json({ message: 'Lead updated', lead });
  } catch (err) {
    console.error('update-lead error:', err.message);
    res.status(500).json({ error: 'Failed to update lead' });
  }
});

// GET /api/stats
router.get('/stats', auth, async (req, res) => {
  try {
    const total = await Lead.countDocuments();
    const cold = await Lead.countDocuments({ status: 'Cold' });
    const engaged = await Lead.countDocuments({ status: 'Engaged' });
    const microCommitment = await Lead.countDocuments({ status: 'Micro-Commitment' });
    const callScheduled = await Lead.countDocuments({ status: 'Call Scheduled' });
    const noInterest = await Lead.countDocuments({ status: 'No Interest' });
    const highPriority = await Lead.countDocuments({ score: { $gte: 40 } });
    res.json({ total, cold, engaged, microCommitment, callScheduled, noInterest, highPriority });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// POST /api/send-outreach
// Called by n8n (x-n8n-secret) or dashboard (JWT)
router.post('/send-outreach', async (req, res) => {
  const secret = req.headers['x-n8n-secret'];
  const authHeader = req.headers.authorization;

  let authorized = false;
  if (secret && secret === process.env.N8N_SECRET) {
    authorized = true;
  } else if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
      authorized = true;
    } catch {}
  }
  if (!authorized) return res.status(401).json({ error: 'Unauthorized' });

  const { leadId, type = 'initial' } = req.body;
  if (!leadId) return res.status(400).json({ error: 'leadId required' });

  let lead;
  try {
    lead = await Lead.findById(leadId);
    if (!lead) return res.status(404).json({ error: 'Lead not found' });

    const emailBody = await generateEmail({
      name: lead.name, hotel: lead.hotel,
      location: lead.location, type,
    });

    const result = await sendEmail({ to: lead.email, hotel: lead.hotel, body: emailBody });

    if (result.success) {
      lead.status = 'Engaged';
      lead.notes = `Email sent on ${new Date().toISOString()}`;
      await lead.save();
      return res.json({ message: 'Email sent and lead updated', lead });
    } else {
      lead.status = 'Failed';
      lead.notes = `Email failed: ${result.error}`;
      await lead.save();
      return res.status(500).json({ error: 'Email sending failed', detail: result.error });
    }
  } catch (err) {
    console.error('send-outreach error:', err.message);
    if (lead) await Lead.findByIdAndUpdate(leadId, { status: 'Failed', notes: `Error: ${err.message}` });
    return res.status(500).json({ error: 'Outreach process failed', detail: err.message });
  }
});

// POST /api/n8n-update-lead — called by n8n with shared secret
router.post('/n8n-update-lead', async (req, res) => {
  const secret = req.headers['x-n8n-secret'];
  if (!process.env.N8N_SECRET || secret !== process.env.N8N_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const { leadId, status, notes } = req.body;
  if (!leadId) return res.status(400).json({ error: 'leadId required' });
  try {
    const update = {};
    if (status) update.status = status;
    if (notes !== undefined) update.notes = notes;
    const lead = await Lead.findByIdAndUpdate(leadId, update, { new: true });
    if (!lead) return res.status(404).json({ error: 'Lead not found' });
    res.json({ message: 'Lead updated', lead });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update lead' });
  }
});

// DELETE /api/delete-lead/:id
router.delete('/delete-lead/:id', auth, async (req, res) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);
    if (!lead) return res.status(404).json({ error: 'Lead not found' });
    res.json({ message: 'Lead deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete lead' });
  }
});

module.exports = router;
