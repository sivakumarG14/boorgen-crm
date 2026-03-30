const mongoose = require('mongoose');

const STATUSES = [
  'Cold',
  'Engaged',
  'Micro-Commitment',
  'Qualified',
  'Call Scheduled',
  'No Interest',
  'Cold – Re-Engage',
  'Closed / Lost',
];

const leadSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  email:    { type: String, required: true },
  hotel:    { type: String, required: true },
  location: { type: String, required: true },
  language: { type: String, enum: ['de', 'en'], default: 'de' },

  // State machine
  status: { type: String, enum: STATUSES, default: 'Cold' },
  flow:   { type: Number, default: 1 }, // current flow 1-8

  // Funnel tracking
  score:          { type: Number, default: 0 },   // lead scoring
  lastEmailSent:  { type: String, default: '' },   // email type last sent
  lastEmailDate:  { type: Date },
  replyReceived:  { type: Boolean, default: false },
  replyType:      { type: String, default: '' },   // yes/no/address/question/later
  linkClicked:    { type: Boolean, default: false },
  addressProvided:{ type: Boolean, default: false },
  callDate:       { type: Date },
  reEngageAfter:  { type: Date },                  // date to re-engage (90 days)

  notes: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

leadSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Lead', leadSchema);
module.exports.STATUSES = STATUSES;
