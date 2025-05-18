import express from 'express';
import axios from 'axios';
import { OpenAI } from 'openai';
import { PrismaClient } from '@prisma/client';
import { GoogleGenerativeAI } from '@google/generative-ai';
import authMiddleware from '../middlewares/Auth.middleware.js';
import { io } from '../../socket.js';

const router = express.Router();
const prisma = new PrismaClient();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Apply auth middleware to all routes
router.use(authMiddleware);

// Function to translate text using Google Translate API
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

// =========================
// GROUP CHAT ROUTES
// =========================

// Create a new group chat
router.post('/group', async (req, res) => {
  try {
    const { name, description, members } = req.body;
    const userId = req.user.id;

    if (!name) {
      return res.status(400).json({ error: 'Group name is required' });
    }

    // Create a new group chat
    const newGroup = await prisma.groupChat.create({
      data: {
        name,
        description,
        createdById: userId,
        // Add creator as first member with admin role
        members: {
          create: {
            userId: userId,
            role: 'admin'
          }
        }
      },
      include: {
        members: true
      }
    });

    // Add other members if provided
    if (members && members.length > 0) {
      const memberPromises = members.map(memberId =>
        prisma.groupChatMember.create({
          data: {
            userId: memberId,
            groupId: newGroup.id,
            role: 'member'
          }
        })
      );

      await Promise.all(memberPromises);
    }

    // Fetch the complete group with all members
    const groupWithMembers = await prisma.groupChat.findUnique({
      where: { id: newGroup.id },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            }
          }
        }
      }
    });

    // Notify all members via socket
    groupWithMembers.members.forEach(member => {
      io.to(`user_${member.userId}`).emit('group_update', {
        type: 'new_group',
        group: groupWithMembers
      });
    });

    res.status(201).json(groupWithMembers);
  } catch (error) {
    console.error('Error creating group chat:', error);
    res.status(500).json({ error: 'Failed to create group chat' });
  }
});

// Get all groups the user is a member of
router.get('/groups', async (req, res) => {
  try {
    const userId = req.user.id;

    const userGroups = await prisma.groupChat.findMany({
      where: {
        members: {
          some: {
            userId: userId
          }
        }
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            }
          }
        },
        _count: {
          select: { messages: true }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    res.json(userGroups);
  } catch (error) {
    console.error('Error fetching user groups:', error);
    res.status(500).json({ error: 'Failed to fetch user groups' });
  }
});

// Get a specific group chat with messages
router.get('/group/:groupId', async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;

    // Check if user is a member of the group
    const membership = await prisma.groupChatMember.findUnique({
      where: {
        userId_groupId: {
          userId: userId,
          groupId: groupId
        }
      }
    });

    if (!membership) {
      return res.status(403).json({ error: 'You are not a member of this group' });
    }

    // Get group details with members and recent messages
    const group = await prisma.groupChat.findUnique({
      where: { id: groupId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            }
          }
        },
        messages: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 50,
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            }
          }
        }
      }
    });

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Update read status for messages
    await prisma.groupChatMessage.updateMany({
      where: {
        groupId: groupId,
        NOT: {
          senderId: userId,
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

    res.json(group);
  } catch (error) {
    console.error('Error fetching group chat:', error);
    res.status(500).json({ error: 'Failed to fetch group chat' });
  }
});

// Send a message to a group
router.post('/group/:groupId/message', async (req, res) => {
  try {
    const { groupId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    if (!content) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    // Check if user is a member of the group
    const membership = await prisma.groupChatMember.findUnique({
      where: {
        userId_groupId: {
          userId: userId,
          groupId: groupId
        }
      }
    });

    if (!membership) {
      return res.status(403).json({ error: 'You are not a member of this group' });
    }

    // Create a new message
    const newMessage = await prisma.groupChatMessage.create({
      data: {
        content,
        senderId: userId,
        groupId,
        readBy: [userId] // Sender has read the message
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    });

    // Update group's updatedAt timestamp
    await prisma.groupChat.update({
      where: { id: groupId },
      data: { updatedAt: new Date() }
    });

    // Get all group members to send notifications
    const groupMembers = await prisma.groupChatMember.findMany({
      where: { groupId }
    });

    // Notify all group members via socket
    groupMembers.forEach(member => {
      if (member.userId !== userId) { // Don't notify the sender
        io.to(`user_${member.userId}`).emit('group_message', {
          message: newMessage,
          groupId
        });
      }
    });

    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Error sending group message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Add members to a group
router.post('/group/:groupId/members', async (req, res) => {
  try {
    const { groupId } = req.params;
    const { members } = req.body;
    const userId = req.user.id;

    if (!members || !Array.isArray(members) || members.length === 0) {
      return res.status(400).json({ error: 'Member list is required' });
    }

    // Check if user is an admin of the group
    const membership = await prisma.groupChatMember.findUnique({
      where: {
        userId_groupId: {
          userId: userId,
          groupId: groupId
        }
      }
    });

    if (!membership || membership.role !== 'admin') {
      return res.status(403).json({ error: 'Only group admins can add members' });
    }

    // Add new members
    const memberPromises = members.map(async (memberId) => {
      // Check if already a member
      const existingMember = await prisma.groupChatMember.findUnique({
        where: {
          userId_groupId: {
            userId: memberId,
            groupId: groupId
          }
        }
      });

      if (!existingMember) {
        return prisma.groupChatMember.create({
          data: {
            userId: memberId,
            groupId,
            role: 'member'
          }
        });
      }
      return existingMember;
    });

    await Promise.all(memberPromises);

    // Get updated group
    const updatedGroup = await prisma.groupChat.findUnique({
      where: { id: groupId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            }
          }
        }
      }
    });

    // Notify all members
    updatedGroup.members.forEach(member => {
      io.to(`user_${member.userId}`).emit('group_update', {
        type: 'members_added',
        group: updatedGroup
      });
    });

    res.json(updatedGroup);
  } catch (error) {
    console.error('Error adding members to group:', error);
    res.status(500).json({ error: 'Failed to add members to group' });
  }
});

// Remove a member from a group
router.delete('/group/:groupId/member/:memberId', async (req, res) => {
  try {
    const { groupId, memberId } = req.params;
    const userId = req.user.id;

    // Check permissions (admin can remove anyone, user can remove self)
    const requesterMembership = await prisma.groupChatMember.findUnique({
      where: {
        userId_groupId: {
          userId: userId,
          groupId: groupId
        }
      }
    });

    if (!requesterMembership) {
      return res.status(403).json({ error: 'You are not a member of this group' });
    }

    // Only allow if user is removing self OR user is admin
    if (userId !== memberId && requesterMembership.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can remove other members' });
    }

    // Don't allow removing the last admin
    if (memberId === userId && requesterMembership.role === 'admin') {
      const adminCount = await prisma.groupChatMember.count({
        where: {
          groupId,
          role: 'admin'
        }
      });

      if (adminCount <= 1) {
        return res.status(400).json({ error: 'Cannot remove the last admin. Transfer admin role first.' });
      }
    }

    // Remove the member
    await prisma.groupChatMember.delete({
      where: {
        userId_groupId: {
          userId: memberId,
          groupId: groupId
        }
      }
    });

    // Notify all remaining members
    const remainingMembers = await prisma.groupChatMember.findMany({
      where: { groupId }
    });

    remainingMembers.forEach(member => {
      io.to(`user_${member.userId}`).emit('group_update', {
        type: 'member_removed',
        groupId,
        removedMemberId: memberId
      });
    });

    // Also notify the removed member
    io.to(`user_${memberId}`).emit('group_update', {
      type: 'you_were_removed',
      groupId
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error removing member from group:', error);
    res.status(500).json({ error: 'Failed to remove member from group' });
  }
});

// Leave a group
router.post('/group/:groupId/leave', async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;

    // Check if user is a member of the group
    const membership = await prisma.groupChatMember.findUnique({
      where: {
        userId_groupId: {
          userId: userId,
          groupId: groupId
        }
      }
    });

    if (!membership) {
      return res.status(403).json({ error: 'You are not a member of this group' });
    }

    // Don't allow the last admin to leave
    if (membership.role === 'admin') {
      const adminCount = await prisma.groupChatMember.count({
        where: {
          groupId,
          role: 'admin'
        }
      });

      if (adminCount <= 1) {
        return res.status(400).json({ error: 'Cannot leave as the last admin. Transfer admin role first.' });
      }
    }

    // Remove the user from the group
    await prisma.groupChatMember.delete({
      where: {
        userId_groupId: {
          userId: userId,
          groupId: groupId
        }
      }
    });

    // Notify all remaining members
    const remainingMembers = await prisma.groupChatMember.findMany({
      where: { groupId }
    });

    remainingMembers.forEach(member => {
      io.to(`user_${member.userId}`).emit('group_update', {
        type: 'member_left',
        groupId,
        leftMemberId: userId
      });
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error leaving group:', error);
    res.status(500).json({ error: 'Failed to leave group' });
  }
});

// Chat with a book
router.post('/book', async (req, res) => {
  try {
    const { bookId, message } = req.body;

    const book = await prisma.book.findUnique({
      where: { id: bookId }
    });

    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    const context = await getRelevantContext(book, message);

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const result = await model.generateContent([
      `You are a helpful AI assistant that helps users understand the book "${book.title}".`,
      `Use the following context from the book to answer the user's question: ${context}`,
      message
    ]);

    const reply = result.response.text();

    await prisma.chatMessage.create({
      data: {
        bookId,
        userId: req.user.id,
        message,
        response: reply
      }
    });

    res.json({ reply });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Error processing chat request' });
  }
});

// Bot chat endpoint
router.post('/bot', async (req, res) => {
  try {
    const { message, language = 'en' } = req.body;

    // Translate user message to English for processing if not already in English
    let processMessage = message;
    if (language !== 'en') {
      processMessage = await translateText(message, 'en');
    }

    // Get response from OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful educational assistant. Keep your responses concise, informative, and engaging. Focus on providing accurate information and encouraging learning."
        },
        {
          role: "user",
          content: processMessage
        }
      ],
      max_tokens: 150
    });

    let botResponse = completion.choices[0].message.content;

    // Translate bot response to user's preferred language if not English
    if (language !== 'en') {
      botResponse = await translateText(botResponse, language);
    }

    res.json({ reply: botResponse });
  } catch (error) {
    console.error('Bot chat error:', error);
    res.status(500).json({ error: 'Failed to process chat message' });
  }
});

async function getRelevantContext(book, question) {
  return "Context from the book would be retrieved here based on the question";
}

export default router;
