import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import axios from 'axios';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "https://green-iq-deployed.vercel.app"],
    methods: ["GET", "POST"],
  },
});

// Map to store active user connections
const userSocketMap = new Map(); // userId -> socketId

// Function to translate text
async function translateText(text, targetLang) {
  try {
    const response = await axios.post('https://translation.googleapis.com/language/translate/v2', {
      q: text,
      target: targetLang,
      key: process.env.GOOGLE_TRANSLATE_API_KEY
    });
    return response.data.data.translations[0].translatedText;
  } catch (error) {
    console.error('Translation error:', error);
    return text;
  }
}

io.on("connection", (socket) => {
  console.log("User Connected:", socket.id);
  
  // Get userId from query params
  const userId = socket.handshake.query.userId;
  if (userId) {
    userSocketMap.set(userId, socket.id);
    console.log(`User ${userId} connected with socket ${socket.id}`);
    
    // Join user's personal room for direct notifications
    socket.join(`user_${userId}`);
    
    // Join all group chats the user is a member of
    joinUserGroups(userId, socket);
  }
  
  // Emit online users list to all connected clients
  io.emit("getOnlineUsers", Array.from(userSocketMap.keys()));
  
  // Individual chat room
  socket.on("join_room", (data) => {
    socket.join(data);
    console.log(`User with ID: ${socket.id} joined room: ${data}`);
  });

  // Join a group chat room
  socket.on("join_group", async (groupId) => {
    if (!userId) return;
    
    // Check if user is a member of the group
    try {
      const membership = await prisma.groupChatMember.findUnique({
        where: {
          userId_groupId: {
            userId,
            groupId
          }
        }
      });
      
      if (membership) {
        socket.join(`group_${groupId}`);
        console.log(`User ${userId} joined group chat ${groupId}`);
      }
    } catch (error) {
      console.error(`Error joining group ${groupId}:`, error);
    }
  });
  
  // Leave a group chat room
  socket.on("leave_group", (groupId) => {
    socket.leave(`group_${groupId}`);
    console.log(`User ${userId} left group chat ${groupId}`);
  });

  // Individual chat message
  socket.on("send_message", async (data) => {
    // Send message to room
    socket.to(data.room).emit("receive_message", data);

    // If bot is enabled for the sender, get bot response
    if (data.botEnabled) {
      try {
        const botResponse = await axios.post(`${process.env.BASE_URL}/api/chat/bot`, {
          message: data.message,
          language: data.language || 'en'
        });

        // Send bot response back to the sender
        io.to(socket.id).emit("receive_message", {
          ...data,
          message: botResponse.data.reply,
          senderId: 'bot'
        });
      } catch (error) {
        console.error('Bot response error:', error);
      }
    }
  });

  // Group chat message
  socket.on("send_group_message", async (data) => {
    if (!userId || !data.groupId || !data.content) return;
    
    try {
      // Save message to database
      const newMessage = await prisma.groupChatMessage.create({
        data: {
          content: data.content,
          senderId: userId,
          groupId: data.groupId,
          readBy: [userId] // Sender has already read the message
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });
      
      // Update group's last activity timestamp
      await prisma.groupChat.update({
        where: { id: data.groupId },
        data: { updatedAt: new Date() }
      });
      
      // Broadcast to all members in the group
      io.to(`group_${data.groupId}`).emit("group_message", {
        message: newMessage,
        groupId: data.groupId
      });
      
    } catch (error) {
      console.error('Error sending group message:', error);
      // Notify sender of error
      socket.emit("group_message_error", {
        error: "Failed to send message",
        groupId: data.groupId
      });
    }
  });

  // Mark group messages as read
  socket.on("mark_group_messages_read", async (data) => {
    if (!userId || !data.groupId) return;
    
    try {
      await prisma.groupChatMessage.updateMany({
        where: {
          groupId: data.groupId,
          NOT: {
            readBy: {
              has: userId
            }
          }
        },
        data: {
          readBy: {
            push: userId
          }
        }
      });
      
      // Broadcast read status update to group members
      socket.to(`group_${data.groupId}`).emit("messages_read_status", {
        userId,
        groupId: data.groupId
      });
      
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  });

  socket.on("get_online_users", () => {
    socket.emit("getOnlineUsers", Array.from(userSocketMap.keys()));
  });

  socket.on("disconnect", async () => {
    console.log("User Disconnected", socket.id);
    
    // Find the userId associated with this socket
    let disconnectedUserId = null;
    for (const [key, value] of userSocketMap.entries()) {
      if (value === socket.id) {
        disconnectedUserId = key;
        userSocketMap.delete(key);
        break;
      }
    }
    
    // Update user's online status in groups they belong to
    if (disconnectedUserId) {
      try {
        const userGroups = await prisma.groupChatMember.findMany({
          where: { userId: disconnectedUserId },
          select: { groupId: true }
        });
        
        userGroups.forEach(({ groupId }) => {
          io.to(`group_${groupId}`).emit("user_status_change", {
            userId: disconnectedUserId,
            status: "offline"
          });
        });
      } catch (error) {
        console.error("Error updating group status on disconnect:", error);
      }
    }
    
    // Update online users for all clients
    io.emit("getOnlineUsers", Array.from(userSocketMap.keys()));
  });
});

// Helper function to join user to all their group chats
async function joinUserGroups(userId, socket) {
  try {
    const userGroups = await prisma.groupChatMember.findMany({
      where: { userId },
      select: { groupId: true }
    });
    
    userGroups.forEach(({ groupId }) => {
      socket.join(`group_${groupId}`);
      console.log(`Auto-joined user ${userId} to group ${groupId}`);
      
      // Notify group members that user is online
      socket.to(`group_${groupId}`).emit("user_status_change", {
        userId,
        status: "online"
      });
    });
  } catch (error) {
    console.error("Error joining user groups:", error);
  }
}

// Function to get socket ID for a specific user
const getReciverSocketId = (receiverId) => {
  return userSocketMap.get(receiverId);
};

export { app, server, io, getReciverSocketId };