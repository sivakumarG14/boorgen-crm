const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  hotel: { type: String, required: true },
  location: { type: String, required: true },
  status: {
    type: String,
    enum: ['New', 'Contacted', 'Failed'],
    default: 'New',
  },
  notes: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Lead', leadSchema);
