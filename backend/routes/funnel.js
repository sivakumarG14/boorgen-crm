const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Lead = require('../models/Lead');
const {
  flow1_entry, flow6_callWarmup, flow8_reEngage,
  processReply, flow4_behaviorTrigger, notifyAna,
} = require('../services/funnel');

// POST /api/funnel/flow1 — called by n8n to trigger Flow 1 cold contact
router.post('/flow1', async (req, res) => {
  const secret = req.headers['x-n8n-secret'];
  if (!process.env.N8N_SECRET || secret !== process.env.N8N_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const { leadId } = req.body;
  if (!leadId) return res.status(400).json({ error: 'leadId required' });
  try {
    const lead = await Lead.findById(leadId);
    if (!lead) return res.status(404).json({ error: 'Lead not found' });
    // Only trigger if not already started
    if (lead.lastEmailSent) {
      return res.json({ message: 'Flow already started', lead });
    }
    const { flow1_entry } = require('../services/funnel');
    await flow1_entry(lead);
    res.json({ message: 'Flow 1 triggered', lead });
  } catch (err) {
    console.error('funnel/flow1 error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/funnel/reply — admin marks a lead's reply type
router.post('/reply', auth, async (req, res) => {
  try {
    const { leadId, replyType, replyText } = req.body;
    if (!leadId || !replyType) return res.status(400).json({ error: 'leadId and replyType required' });

    const lead = await Lead.findById(leadId);
    if (!lead) return res.status(404).json({ error: 'Lead not found' });

    await processReply(lead, replyType, replyText || '');
    res.json({ message: 'Reply processed', lead });
  } catch (err) {
    console.error('funnel/reply error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/funnel/link-click — track configurator link click
router.post('/link-click', auth, async (req, res) => {
  try {
    const { leadId } = req.body;
    const lead = await Lead.findById(leadId);
    if (!lead) return res.status(404).json({ error: 'Lead not found' });

    lead.linkClicked = true;
    await flow4_behaviorTrigger(lead);
    res.json({ message: 'Link click processed', lead });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/funnel/schedule-call — mark call scheduled
router.post('/schedule-call', auth, async (req, res) => {
  try {
    const { leadId, callDate } = req.body;
    const lead = await Lead.findById(leadId);
    if (!lead) return res.status(404).json({ error: 'Lead not found' });

    lead.status = 'Call Scheduled';
    lead.callDate = new Date(callDate);
    await lead.save();
    res.json({ message: 'Call scheduled', lead });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/funnel/close — mark lead as Closed/Lost or Qualified
router.post('/close', auth, async (req, res) => {
  try {
    const { leadId, status, notes } = req.body;
    const lead = await Lead.findById(leadId);
    if (!lead) return res.status(404).json({ error: 'Lead not found' });

    lead.status = status || 'Closed / Lost';
    if (notes) lead.notes = notes;
    await lead.save();
    res.json({ message: 'Lead closed', lead });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/funnel/notify-ana — manually notify Ana
router.post('/notify-ana', auth, async (req, res) => {
  try {
    const { leadId, message } = req.body;
    const lead = await Lead.findById(leadId);
    if (!lead) return res.status(404).json({ error: 'Lead not found' });

    await notifyAna(lead, message || 'Manual notification from CRM');
    res.json({ message: 'Ana notified' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/funnel/stats — funnel stats per status
router.get('/stats', auth, async (req, res) => {
  try {
    const statuses = [
      'Cold', 'Engaged', 'Micro-Commitment', 'Qualified',
      'Call Scheduled', 'No Interest', 'Cold – Re-Engage', 'Closed / Lost',
    ];
    const counts = {};
    for (const s of statuses) {
      counts[s] = await Lead.countDocuments({ status: s });
    }
    const highPriority = await Lead.countDocuments({ score: { $gte: 40 } });
    res.json({ ...counts, highPriority });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
