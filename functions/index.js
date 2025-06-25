const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");
const { Chat, User } = require("./db");
require("dotenv").config({ path: "./.env" }); // relative to functions folder

admin.initializeApp();

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// Middleware: Firebase Auth
const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ status: "error", message: "Unauthorized" });
  }

  const idToken = authHeader.split("Bearer ")[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (err) {
    res.status(401).json({ status: "error", message: "Invalid token" });
  }
};

// ✅ Chat Save Route → uses MongoDB
app.post("/save-chat", authenticate, async (req, res) => {
  const { prompt, response } = req.body;
  const uid = req.user.uid;

  if (!prompt || !response) {
    return res.status(400).json({ status: "error", message: "Missing prompt or response" });
  }

  try {
    const newChat = new Chat({
      userId: uid,
      prompt,
      response,
      timestamp: new Date(),
    });
    await newChat.save();

    res.json({ status: "success", message: "Chat saved", id: newChat._id });
  } catch (error) {
    console.error("MongoDB error:", error);
    res.status(500).json({ status: "error", message: "Failed to save chat" });
  }
});
// ✅ AUTH: Email/Password Signup API
app.post("/auth/signup", async (req, res) => {
  const { email, password, username } = req.body;

  if (!email || !password || !username) {
    return res.status(400).json({ status: "error", message: "Missing fields" });
  }

  try {
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: username,
    });

    const newUser = new User({
      uid: userRecord.uid,
      email,
      username,
      loginProvider: "password",
    });
    await newUser.save();

    res.json({ status: "success", uid: userRecord.uid });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ status: "error", message: err.message });
  }
});

// ✅ AUTH: Password Reset API
app.post("/auth/reset-password", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ status: "error", message: "Email is required" });
  }

  try {
    const link = await admin.auth().generatePasswordResetLink(email);
    res.json({
      status: "success",
      message: "Password reset link generated",
      resetLink: link
    });
  } catch (error) {
    console.error("Password reset error:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
});

// ✅ AUTH: Social Login API (Google / Facebook / etc.)
app.post("/auth/social-login", async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) {
    return res.status(400).json({ status: "error", message: "Missing idToken" });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { uid, email, name, firebase } = decodedToken;

    const loginProvider = firebase?.sign_in_provider || "unknown";
    const username = name || email?.split("@")[0] || "user";

    // Save user to MongoDB if not exists
    let user = await User.findOne({ uid });
    if (!user) {
      user = new User({
        uid,
        email,
        username,
        loginProvider,
      });
      await user.save();
    }

    res.json({
      status: "success",
      message: "Social login successful",
      uid: user.uid,
      email: user.email,
      username: user.username,
      provider: loginProvider,
    });
  } catch (err) {
    console.error("❌ Social login error:", err);
    res.status(401).json({ status: "error", message: "Invalid or expired token" });
  }
});

const axios = require("axios"); // Make sure this is at the top if not already
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// ✅ Chat with GPT and Save to DB
// ✅ Chat with GPT and Save to DB using OpenAI API
app.post("/chat", authenticate, async (req, res) => {
  const { prompt } = req.body;
  const uid = req.user.uid;

  console.log("🔥 Chat Request:", { uid, prompt });

  if (!prompt) {
    return res.status(400).json({ status: "error", message: "Missing prompt" });
  }

  try {
    const gptRes = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are DOTBot, the assistant for GDOT contractors." },
          { role: "user", content: prompt },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const gptResponse = gptRes.data.choices[0].message.content.trim();

    // Save to MongoDB
    const newChat = new Chat({
      userId: uid,
      prompt,
      response: gptResponse,
      timestamp: new Date(),
    });
    await newChat.save();

    console.log("✅ GPT Response:", gptResponse);

    res.json({ status: "success", prompt, response: gptResponse });
  } catch (error) {
    console.error("❌ GPT Error:", error.response?.data || error.message);
    res.status(500).json({ status: "error", message: "Failed to process GPT chat" });
  }
});


// ✅ GET /get-chat-history
app.get("/get-chat-history", authenticate, async (req, res) => {
  const uid = req.user.uid;

  try {
    const chats = await Chat.find({ userId: uid }).sort({ timestamp: -1 });

    res.json({
      status: "success",
      count: chats.length,
      chats,
    });
  } catch (error) {
    console.error("❌ Failed to fetch chat history:", error);
    res.status(500).json({ status: "error", message: "Failed to retrieve chat history" });
  }
});

// ✅ Query Specs using RAG Pipeline
// POST /query-specs


exports.api = functions.https.onRequest(app);
