const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI, {
  dbName: 'dotbot',
})
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

const chatSchema = new mongoose.Schema({
  userId: String,
  prompt: String,
  response: String,
  timestamp: Date,
  module: { type: String, default: 'general' },
  db_data: mongoose.Schema.Types.Mixed, // Flexible field for MongoDB data
});

const userSchema = new mongoose.Schema({
  uid: String,
  email: String,
  username: String,
  loginProvider: String,
});

const standardSchema = new mongoose.Schema({
  standard_id: String,
  metadata: String, // Adjust based on actual structure (e.g., object if needed)
});

const specificationSchema = new mongoose.Schema({
  spec_id: String,
  details: String, // Adjust based on actual structure (e.g., object if needed)
});

const Chat = mongoose.model('Chat', chatSchema);
const User = mongoose.model('User', userSchema);
const Standard = mongoose.model('Standard', standardSchema);
const Specification = mongoose.model('Specification', specificationSchema);

module.exports = { Chat, User, Standard, Specification };