import express from "express";
import Thread from "../models/Thread.js";
import { getGroqOrOpenAIResponse } from "../utils/openai.js";

const router = express.Router();

// 1. Post Chat Message -> Path: "/chat" (Full URL: /api/chat)
router.post("/chat", async (req, res) => {
  const { threadId, message } = req.body;

  if (!threadId || !message) {
    return res.status(400).json({ error: "threadId and message are required" });
  }

  try {
    let thread = await Thread.findOne({ threadId });

    if (!thread) {
      const generatedTitle = message.length > 25 ? message.substring(0, 25) + "..." : message;
      thread = new Thread({
        threadId,
        title: generatedTitle,
        messages: []
      });
    }

    const history = thread.messages.map(m => ({
      role: m.role,
      content: m.content
    }));

    const reply = await getGroqOrOpenAIResponse(history, message);

    thread.messages.push({ role: "user", content: message });
    thread.messages.push({ role: "assistant", content: reply });
    thread.updatedAt = new Date();
    await thread.save();

    return res.status(200).json({ reply, threadId: thread.threadId, title: thread.title });
  } catch (err) {
    console.error("Chat Post Error:", err);
    return res.status(500).json({ error: "Failed to generate reply" });
  }
});

// 2. GET All Threads -> Path: "/thread" (Full URL: /api/thread)
router.get("/thread", async (req, res) => {
  try {
    const threads = await Thread.find({}, "threadId title updatedAt createdAt").sort({ updatedAt: -1 });
    return res.status(200).json(threads);
  } catch (err) {
    console.error("Fetch Threads Error:", err);
    return res.status(500).json({ error: "Failed to fetch threads" });
  }
});

// 3. GET Single Thread Messages -> Path: "/thread/:threadId"
router.get("/thread/:threadId", async (req, res) => {
  try {
    const thread = await Thread.findOne({ threadId: req.params.threadId });
    if (!thread) return res.status(404).json({ error: "Thread not found" });
    return res.status(200).json(thread.messages);
  } catch (err) {
    console.error("Get Thread Error:", err);
    return res.status(500).json({ error: "Failed to load thread messages" });
  }
});

// 4. DELETE Thread -> Path: "/thread/:threadId"
router.delete("/thread/:threadId", async (req, res) => {
  try {
    await Thread.deleteOne({ threadId: req.params.threadId });
    return res.status(200).json({ message: "Thread deleted successfully" });
  } catch (err) {
    return res.status(500).json({ error: "Failed to delete" });
  }
});

export default router;