const Lead = require('../models/Lead');
const { sendEmail } = require('./mailer');
const { getTemplate } = require('./templates');
const nodemailer = require('nodemailer');

const ANA_EMAIL = 'anaramonavasar12@gmail.com';

// Score increments
const SCORE = { reply: 10, linkClick: 15, configurator: 20, address: 30 };

/**
 * Send a funnel email and update lead tracking fields.
 */
async function sendFunnelEmail(lead, templateType) {
  const lang = lead.language || 'de';
  const { subject, text } = getTemplate(templateType, lang, {
    name: lead.name, hotel: lead.hotel, location: lead.location,
  });
  const result = await sendEmail({ to: lead.email, hotel: lead.hotel, body: text, subject });
  lead.lastEmailSent = templateType;
  lead.lastEmailDate = new Date();
  await lead.save();
  return result;
}

/**
 * Notify Ana with context about the lead.
 */
async function notifyAna(lead, message) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_PASS },
  });
  await transporter.sendMail({
    from: `BOORGEN CRM <${process.env.GMAIL_USER}>`,
    to: ANA_EMAIL,
    subject: `[BOORGEN] ${message} — ${lead.name} / ${lead.hotel}`,
    text: `Lead: ${lead.name}\nHotel: ${lead.hotel}\nLocation: ${lead.location}\nEmail: ${lead.email}\nStatus: ${lead.status}\nScore: ${lead.score}\nNotes: ${lead.notes}\n\n${message}`,
  });
  console.log(`Ana notified: ${message} for ${lead.email}`);
}

/**
 * FLOW 1: Entry — send cold contact email on lead creation.
 */
async function flow1_entry(lead) {
  await sendFunnelEmail(lead, 'cold_contact');
  lead.flow = 1;
  lead.status = 'Cold';
  await lead.save();
  console.log(`FLOW 1: Cold contact sent to ${lead.email}`);
}

/**
 * FLOW 2: After Reminder 1 — send trust building email.
 */
async function flow2_reminder1(lead) {
  await sendFunnelEmail(lead, 'reminder_1');
  lead.flow = 2;
  await lead.save();
  console.log(`FLOW 2: Reminder 1 sent to ${lead.email}`);
}

/**
 * FLOW 3: Trust Building email.
 */
async function flow3_trustBuilding(lead) {
  await sendFunnelEmail(lead, 'trust_building');
  lead.flow = 3;
  await lead.save();
  console.log(`FLOW 3: Trust building sent to ${lead.email}`);
}

/**
 * FLOW 4: Reminder 2 — self-service.
 */
async function flow4_reminder2(lead) {
  await sendFunnelEmail(lead, 'reminder_2');
  lead.flow = 4;
  await lead.save();
  console.log(`FLOW 4: Reminder 2 sent to ${lead.email}`);
}

/**
 * FLOW 4: Behavior trigger — lead clicked link.
 */
async function flow4_behaviorTrigger(lead) {
  lead.score += SCORE.linkClick;
  lead.status = 'Engaged';
  await sendFunnelEmail(lead, 'behavior_trigger');
  await notifyAna(lead, 'Lead clicked configurator link — immediate follow-up needed');
  await lead.save();
  console.log(`FLOW 4: Behavior trigger for ${lead.email}`);
}

/**
 * FLOW 5: Qualification — guide to send address.
 */
async function flow5_requestAddress(lead) {
  await sendFunnelEmail(lead, 'qualification_address');
  lead.flow = 5;
  await lead.save();
}

/**
 * FLOW 5: Qualification — SPIN logic for questions.
 */
async function flow5_spin(lead) {
  await sendFunnelEmail(lead, 'qualification_spin');
  lead.flow = 5;
  await lead.save();
}

/**
 * FLOW 6: Call preparation — warm-up email 1 day before.
 */
async function flow6_callWarmup(lead) {
  await sendFunnelEmail(lead, 'call_warmup');
  lead.flow = 6;
  await lead.save();
  console.log(`FLOW 6: Call warm-up sent to ${lead.email}`);
}

/**
 * FLOW 8: Re-engagement after 90 days.
 */
async function flow8_reEngage(lead) {
  await sendFunnelEmail(lead, 're_engagement');
  lead.flow = 8;
  await lead.save();
  console.log(`FLOW 8: Re-engagement sent to ${lead.email}`);
}

/**
 * Send cold exit email and set status.
 */
async function sendColdExit(lead) {
  await sendFunnelEmail(lead, 'cold_exit');
  lead.status = 'No Interest';
  await lead.save();
  console.log(`Cold exit sent to ${lead.email}`);
}

/**
 * Process a reply from a lead — the core IF/ELSE state machine.
 * replyType: 'yes' | 'no' | 'address' | 'question' | 'later'
 */
async function processReply(lead, replyType, replyText = '') {
  lead.replyReceived = true;
  lead.replyType = replyType;
  lead.score += SCORE.reply;

  if (replyType === 'no') {
    await sendColdExit(lead);
    return;
  }

  if (replyType === 'later') {
    lead.status = 'Cold – Re-Engage';
    lead.reEngageAfter = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
    await lead.save();
    return;
  }

  if (replyType === 'address') {
    lead.status = 'Micro-Commitment';
    lead.addressProvided = true;
    lead.score += SCORE.address;
    await notifyAna(lead, 'Lead sent address — property analysis needed (30% rule)');
    await lead.save();
    return;
  }

  if (replyType === 'yes' || replyType === 'question') {
    lead.status = 'Engaged';

    if (replyType === 'question') {
      await flow5_spin(lead);
    } else {
      // Guide to send address
      await flow5_requestAddress(lead);
    }

    if (lead.flow >= 3) {
      await notifyAna(lead, `Lead replied (${replyType}) — follow-up needed`);
    }
    return;
  }

  await lead.save();
}

/**
 * Scheduler: check all leads and trigger time-based flows.
 * Call this periodically (e.g. every hour via cron).
 */
async function runScheduler() {
  const now = new Date();
  const leads = await Lead.find({
    status: { $nin: ['No Interest', 'Closed / Lost', 'Call Scheduled'] },
  });

  for (const lead of leads) {
    try {
      await processScheduledLead(lead, now);
    } catch (err) {
      console.error(`Scheduler error for ${lead.email}:`, err.message);
    }
  }
}

async function processScheduledLead(lead, now) {
  if (!lead.lastEmailDate) return;

  const daysSinceEmail = (now - lead.lastEmailDate) / (1000 * 60 * 60 * 24);

  // Re-engagement check (90 days)
  if (lead.status === 'Cold – Re-Engage' && lead.reEngageAfter && now >= lead.reEngageAfter) {
    await flow8_reEngage(lead);
    return;
  }

  // Call warm-up: 1 day before scheduled call
  if (lead.status === 'Call Scheduled' && lead.callDate) {
    const daysToCall = (lead.callDate - now) / (1000 * 60 * 60 * 24);
    if (daysToCall <= 1 && daysToCall > 0 && lead.lastEmailSent !== 'call_warmup') {
      await flow6_callWarmup(lead);
      return;
    }
  }

  if (lead.replyReceived) return; // Don't auto-follow-up if they replied

  // FLOW 1 → Reminder 1 after 4-5 days
  if (lead.flow === 1 && lead.lastEmailSent === 'cold_contact' && daysSinceEmail >= 4) {
    await flow2_reminder1(lead);
    return;
  }

  // FLOW 2 → Trust building after 3-5 more days
  if (lead.flow === 2 && lead.lastEmailSent === 'reminder_1' && daysSinceEmail >= 3) {
    await flow3_trustBuilding(lead);
    return;
  }

  // FLOW 3 → Reminder 2 after 5-7 days
  if (lead.flow === 3 && lead.lastEmailSent === 'trust_building' && daysSinceEmail >= 5) {
    await flow4_reminder2(lead);
    return;
  }

  // FLOW 4 → Cold exit after 10-15 days
  if (lead.flow === 4 && lead.lastEmailSent === 'reminder_2' && daysSinceEmail >= 10) {
    await sendColdExit(lead);
    lead.status = 'Cold – Re-Engage';
    lead.reEngageAfter = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
    await lead.save();
    return;
  }
}

module.exports = {
  flow1_entry,
  flow2_reminder1,
  flow3_trustBuilding,
  flow4_reminder2,
  flow4_behaviorTrigger,
  flow5_requestAddress,
  flow5_spin,
  flow6_callWarmup,
  flow8_reEngage,
  sendColdExit,
  processReply,
  runScheduler,
  notifyAna,
};
