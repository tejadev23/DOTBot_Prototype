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
const RESOURCE_CHATGPT = process.env.RESOURCE_CHATGPT;

// ✅ Chat with GPT and Save to DB
// ✅ Chat with GPT and Save to DB using OpenAI API
app.post('/chat', authenticate, async (req, res) => {
  const { prompt, mode = 'general' } = req.body;
  const uid = req.user.uid;

  console.log('🔥 Chat Request:', { uid, prompt, mode });

  if (!prompt) {
    return res.status(400).json({ status: 'error', message: 'Missing prompt' });
  }

  try {
    let module = 'general';
    let query = prompt.trim();

    console.log('🔍 Analyzing prompt:', prompt);

    // === Module Detection & Query Extraction ===

    // 1. Vendor Directory
    if (/\b(vendor|contractor|company|number)\b/i.test(prompt) || /\b\d{8,}\b/.test(prompt)) {
      module = 'vendors';
      const vendorMatch = prompt.match(/\b\d{8,}\b/);
      query = vendorMatch ? vendorMatch[0] : prompt.replace(/\b(vendor|contractor|company|number)\b/gi, '').trim();
    }

    // 2. Construction Standards
    else if (
      /\b(standard|chart|design|guideline)\b/i.test(prompt) ||
      /\b[\w]{1,10}-[\w]{1,10}\b/i.test(prompt)
    ) {
      module = 'standards';
      const stdMatch = prompt.match(/\b[\w]{1,10}-[\w]{1,10}\b/i);  // e.g. 2405-1, D-07, 1011A-PRECAST
      query = stdMatch ? stdMatch[0] : prompt.replace(/\b(standard|chart|design|guideline)\b/gi, '').trim();
    }

    // 3. Specifications
    else if (
      /\b(spec|details|requirements|specification|section)\b/i.test(prompt) ||
      /\b\d{1,3}\b/.test(prompt)
    ) {
      module = 'specifications';
      const specMatch = prompt.match(/\b\d{1,3}\b/); // Section number (e.g., 156)
      query = specMatch ? specMatch[0] : prompt.replace(/\b(spec|details|requirements|specification|section)\b/gi, '').trim();
    }

    console.log('✅ Inferred module:', module, 'query:', query);

    // === MongoDB Lookup Based on Module ===

    let dbData = null;

    if (module !== 'general') {
      console.log('🔍 Querying MongoDB:', { module, query });

      switch (module) {
        case 'vendors':
          dbData = await mongoose.connection.db.collection('vendor_directory').findOne({
            $or: [
              { vendor_number: query },
              { vendor: { $regex: new RegExp(query, 'i') } },
              { contractor_name: { $regex: new RegExp(query, 'i') } },
              { work_classes: { $regex: new RegExp(query, 'i') } }
            ]
          });
          break;

        case 'standards':
          dbData = await mongoose.connection.db.collection('construction_standards').findOne({
            $or: [
              { standard_id: { $regex: new RegExp(`^${query}$`, 'i') } },
              { description: { $regex: new RegExp(query, 'i') } }
            ]
          });
          break;

        case 'specifications':
          dbData = await mongoose.connection.db.collection('spec_chunks').findOne({
            $or: [
              { section_id: query },
              { title: { $regex: new RegExp(query, 'i') } },
              { text: { $regex: new RegExp(query, 'i') } }
            ]
          });
          break;
      }

      console.log('🔎 DB Data:', dbData ? 'Found' : 'Not found');
    }

    // === Handle strict GDOT-only mode fallback ===
    if (mode === 'module' && !dbData) {
      const fallback = "This query doesn't match any GDOT modules (standards, specifications, or vendors). Please rephrase using GDOT-specific terms.";
      const newChat = new Chat({
        userId: uid,
        prompt,
        response: fallback,
        timestamp: new Date(),
        module,
        db_data: null,
      });
      await newChat.save();

      return res.json({
        status: 'success',
        prompt,
        response: fallback,
        db_data: null,
        inferred_module: module,
        strict_mode: true
      });
    }

    // === Prepare GPT prompt ===
    const systemMessage = {
      role: 'system',
      content:
        `You are DOTBot, the assistant for GDOT contractors. Use the following GDOT data if available: ${dbData ? JSON.stringify(dbData) : 'none'}.\n` +
        (mode === 'module' ? "If no data is provided, do not guess. Politely say the query is outside GDOT scope." : "")
    };

    const gptRes = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          systemMessage,
          { role: 'user', content: prompt }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${RESOURCE_CHATGPT}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const gptResponse = gptRes.data.choices[0].message.content.trim();

    // === Save and return response ===
    const newChat = new Chat({
      userId: uid,
      prompt,
      response: gptResponse,
      timestamp: new Date(),
      module,
      db_data: dbData || null,
    });

    await newChat.save();

    console.log('✅ GPT Response:', gptResponse);

    res.json({
      status: 'success',
      prompt,
      response: gptResponse,
      db_data: dbData,
      inferred_module: module,
      strict_mode: mode === 'module'
    });
  } catch (error) {
    console.error('❌ GPT Error:', error.response?.data || error.message);
    res.status(500).json({ status: 'error', message: 'Failed to process GPT chat' });
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