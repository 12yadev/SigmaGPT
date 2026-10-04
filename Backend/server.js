import express from "express";
import "dotenv/config";
import cors from "cors";
import mongoose from "mongoose";
import chatRoutes from "./routes/chat.js";

const app = express();
const PORT = process.env.PORT || 8080;

// 1. Production-Safe CORS Middleware
app.use(
  cors({
    origin: "*", // Testing ke baad yahan apna Vercel frontend URL daal sakte hain
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// 2. Body Parser Middleware
app.use(express.json());

// 3. Robust MongoDB Connection
const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined in environment variables.");
    }
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("Connected to MongoDB successfully!");
  } catch (err) {
    console.error("MongoDB Connection Error:", err.message);
    // Render build fail na ho agar network temporary issue ho
  }
};

connectDB();

// 4. API Routes
app.use("/api", chatRoutes);

// Root Health Check Route (Render uptime monitoring ke liye zaroori hai)
app.get("/", (req, res) => {
  res.status(200).send("SigmaGPT Backend Server is running perfectly!");
});

// 5. Start Server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});