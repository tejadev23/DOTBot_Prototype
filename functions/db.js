const mongoose = require("mongoose");

mongoose.connect(process.env.MONGODB_URI, {
  // No longer need useNewUrlParser / useUnifiedTopology
});

const chatSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  prompt: { type: String, required: true },
  response: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const userSchema = new mongoose.Schema({
  uid: { type: String, required: true },
  email: { type: String, required: true },
  username: { type: String },
  loginProvider: { type: String },
  lastSeen: { type: Date, default: Date.now },
});

const Chat = mongoose.model("Chat", chatSchema);
const User = mongoose.model("User", userSchema);

module.exports = { Chat, User };
