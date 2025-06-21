const mongoose = require("mongoose");

const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI, {
  dbName: "dotbot",
})
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

const chatSchema = new mongoose.Schema({
  userId: String,
  prompt: String,
  response: String,
  timestamp: Date,
});

const userSchema = new mongoose.Schema({
  uid: String,
  email: String,
  username: String,
  loginProvider: String,
});

const Chat = mongoose.model("Chat", chatSchema);
const User = mongoose.model("User", userSchema);

module.exports = { Chat, User };
