import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import createError from "http-errors";
import morgan from "morgan";
import path from "path";
import fs from "fs";
import favicon from "serve-favicon";
import { Server } from 'socket.io';
import "./v1/config/env.config.js";

// Routes
import { authRoutes, userRoute } from "./v1/routes/index.js";
import videoRoutes from "./v1/routes/videoRoutes.js";
import chatbotRoutes from "./v1/routes/chatbot.js";
import bookRoutes from './v1/routes/books.js';
import chatRoutes from './v1/routes/chat.js';
import groupChatRoutes from './v1/routes/groupChat.js';
import geminiRoutes from './v1/routes/gemini.js';

// AI Services
import OpenAI from "openai";
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";

// Database
import { PrismaClient } from "@prisma/client";
import { app, server } from "./socket.js";

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // This is also the default, can be omitted
});

// Import Gemini AI
// Initialize Gemini API
const geminiApiKey = process.env.GEMINI_API_KEY;
const geminiAI = new GoogleGenerativeAI(geminiApiKey);

// Get the model and configure it
const geminiModel = geminiAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

// Generation configuration
const geminiConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    status: createError.TooManyRequests().status,
    message: createError.TooManyRequests().message,
  },
});
const prisma = new PrismaClient();
async function sendMessage(senderId, receiverId, message) {
  const chatMessage = await prisma.chat.create({
    data: {
      senderId,
      receiverId,
      message,
    },
  });
  return chatMessage;
}

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Created uploads directory at:', uploadsDir);
}

// Update CORS options to allow PDF content type
const corsOptions = {
  origin: ["http://localhost:3000", "https://green-iq-deployed.vercel.app"],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Disposition', 'Content-Length', 'Content-Type'],
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions));
// Global variable appRoot with base dirname
global.appRoot = path.resolve(__dirname);

// Middlewares
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://unpkg.com", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "blob:", "https://res.cloudinary.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      connectSrc: ["'self'", "https://res.cloudinary.com"],
      frameAncestors: ["'self'", "http://localhost:3000", "https://green-iq-deployed.vercel.app"],
      frameSrc: ["'self'", "data:", "http://localhost:*", "https://res.cloudinary.com"],
      objectSrc: ["'self'", "data:", "blob:", "https://res.cloudinary.com"],
      workerSrc: ["'self'", "blob:", "https://unpkg.com", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com"]
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.set("trust proxy", 1);
app.use(limiter);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan("dev"));
app.use(favicon(path.join(__dirname, "public", "favicon.ico")));

// Welcome Route
app.all("/", (req, res, next) => {
  res.send({ message: "API is Up and Running on render 😎🚀" });
});

// Routes
app.use('/api/v1/chatbot', chatbotRoutes);

const apiVersion = "v1";

// Routes
app.use(`/${apiVersion}/auth`, authRoutes);
app.use(`/${apiVersion}/user`, userRoute);
app.use(`/${apiVersion}/video`, videoRoutes);

// Initialize Gemini with proper error handling
const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

// Validate API key
if (!apiKey || apiKey === '') {
  console.warn("⚠️ WARNING: No Gemini API key provided in app.js. This will affect complexity analysis.");
}

// Basic generation config
const generationConfig = {
  temperature: 0.7,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 1024,
};

// Complexity analysis endpoint
app.post(`/find-complexity`, async (req, res) => {
  try {
    const { prompt } = req.body;
    
    // Verify API key is configured
    if (!geminiApiKey || geminiApiKey === '') {
      return res.status(500).json({
        success: false,
        error: 'Gemini API key is not configured or invalid'
      });
    }

    // Start a chat session with the model
    const chatSession = geminiModel.startChat({
      generationConfig: geminiConfig,
      history: [],
    });

    try {
      // Send the message and get the response
      const result = await chatSession.sendMessage(prompt);
      const response = result.response.text();
      
      return res.status(200).json({
        success: true,
        data: JSON.stringify(response)
      });

    } catch (error) {
      console.error("Complexity analysis generation error:", error);
      return res.status(500).json({
        success: false,
        error: 'Failed to analyze text complexity',
        details: error.message
      });
    }
  } catch (error) {
    console.error("Complexity analysis error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to process request",
      details: error.message
    });
  }
});

// Add new routes
app.use('/api/books', bookRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/group-chat', groupChatRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/gemini', geminiRoutes);

// Serve static files from the uploads directory - make sure the path is correct
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads'), {
  setHeaders: (res, path) => {
    if (path.endsWith('.pdf')) {
      res.set('Content-Type', 'application/pdf');
      res.set('Content-Disposition', 'inline');
      res.set('Access-Control-Allow-Origin', '*');
      res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
      res.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
      res.set('X-Frame-Options', 'ALLOWALL');
      
      // Remove any CSP headers that would prevent iframe embedding
      res.removeHeader('Content-Security-Policy');
      res.removeHeader('Content-Security-Policy-Report-Only');
    }
  }
}));

// Add debug test endpoint for groups
app.get('/api/test-groups', async (req, res) => {
  try {
    console.log('DEBUG: Direct test endpoint for groups called');
    
    const prisma = new PrismaClient();
    
    // Get all conversations
    const conversations = await prisma.conversation.findMany({
      include: {
        messages: true
      }
    });
    
    // Find conversations with 'group' receiverId messages
    const groupConversations = conversations.filter(conv => 
      conv.messages.some(msg => msg.receiverId === 'group')
    );
    
    console.log(`DEBUG: Found ${groupConversations.length} group conversations directly`);
    
    // Format groups for response
    const groups = groupConversations.map(group => {
      // Find first message with 'group created by' to extract name
      const creationMessage = group.messages.find(msg => 
        msg.receiverId === 'group' && msg.message.includes('group created by')
      );
      
      // Extract group name from message
      const groupName = creationMessage
        ? creationMessage.message.split('group created by')[0].trim()
        : 'Group Chat';
      
      return {
        id: group.id,
        name: groupName,
        participants: group.participantIds,
        messages: group.messages.filter(msg => msg.receiverId === 'group'),
        updatedAt: group.updatedAt
      };
    });
    
    res.json(groups);
  } catch (error) {
    console.error('Error in test-groups endpoint:', error);
    res.status(500).json({ error: 'Failed to fetch test groups' });
  }
});

// 404 Handler
app.use((req, res, next) => {
  next(createError.NotFound());
});

// Error Handler
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.send({
    status: err.status || 500,
    message: err.message,
  });
});


// Server Configs
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 @ http://localhost:${PORT}`);
  console.log(`connected to ${process.env.DATABASE_URL}`);
});
