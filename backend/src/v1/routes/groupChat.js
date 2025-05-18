import express from 'express';
import { PrismaClient } from '@prisma/client';
import authMiddleware from '../middlewares/Auth.middleware.js';
import { io } from '../../socket.js';

const router = express.Router();
const prisma = new PrismaClient();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Create a new group chat
router.post('/', async (req, res) => {
  try {
    const { name, members } = req.body;
    const userId = req.user.id;

    if (!name) {
      return res.status(400).json({ error: 'Group name is required' });
    }

    // Ensure members is an array and includes the creator
    const allMembers = Array.isArray(members) ? [...members, userId] : [userId];
    const uniqueMembers = [...new Set(allMembers)]; // Remove duplicates

    // Create a new conversation as a group chat
    const newGroup = await prisma.conversation.create({
      data: {
        participantIds: uniqueMembers,
        messages: {
          create: {
            senderId: userId,
            receiverId: 'group', // Special marker for group messages
            message: `${name} group created by ${req.user.name}`,
          }
        }
      },
      include: {
        messages: true
      }
    });

    // Notify all members via socket
    uniqueMembers.forEach(memberId => {
      io.to(`user_${memberId}`).emit('group_update', {
        type: 'new_group',
        group: {
          id: newGroup.id,
          name,
          participants: uniqueMembers
        }
      });
    });

    res.status(201).json({
      id: newGroup.id,
      name,
      participants: uniqueMembers,
      createdAt: newGroup.createdAt
    });
  } catch (error) {
    console.error('Error creating group chat:', error);
    res.status(500).json({ error: 'Failed to create group chat' });
  }
});

// Get all groups the user is a member of
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    console.log("GET /api/group-chat/ - Fetching groups for user:", userId);

    // Simplified query to just find conversations with group messages
    const userGroups = await prisma.conversation.findMany({
      where: {
        participantIds: {
          has: userId
        },
        messages: {
          some: {
            receiverId: 'group'
          }
        }
      },
      include: {
        messages: true
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    console.log(`Found ${userGroups.length} groups for user ${userId}`);
    
    // Simplified formatting for reliability
    const formattedGroups = userGroups.map(group => {
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

    console.log(`Returning ${formattedGroups.length} formatted groups`);
    
    res.json(formattedGroups);
  } catch (error) {
    console.error('Error fetching user groups:', error);
    res.status(500).json({ error: 'Failed to fetch user groups' });
  }
});

// Get a specific group chat with messages
router.get('/:groupId', async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;

    // Check if conversation exists and user is a participant
    const group = await prisma.conversation.findFirst({
      where: {
        id: groupId,
        participantIds: {
          has: userId
        }
      },
      include: {
        messages: {
          where: {
            receiverId: 'group'  // Only get group messages
          },
          orderBy: {
            timestamp: 'desc'
          },
          take: 50 // Get the last 50 messages
        }
      }
    });

    if (!group) {
      return res.status(404).json({ error: 'Group not found or you are not a member' });
    }

    // Get the group name
    const firstMessage = await prisma.chat.findFirst({
      where: {
        conversationId: groupId,
        receiverId: 'group'
      },
      orderBy: {
        timestamp: 'asc'
      }
    });

    const groupName = firstMessage?.message.includes('group created by') 
      ? firstMessage.message.split('group created by')[0].trim()
      : 'Group Chat';

    // Get participant details
    const participants = await prisma.user.findMany({
      where: {
        id: {
          in: group.participantIds
        }
      },
      select: {
        id: true,
        name: true,
        email: true
      }
    });

    // Format the response
    const response = {
      id: group.id,
      name: groupName,
      participants,
      messages: await Promise.all(group.messages.map(async msg => {
        const sender = await prisma.user.findUnique({
          where: { id: msg.senderId },
          select: { id: true, name: true }
        });

        return {
          id: msg.id,
          content: msg.message,
          sender,
          createdAt: msg.timestamp
        };
      }))
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching group chat:', error);
    res.status(500).json({ error: 'Failed to fetch group chat' });
  }
});

// Send a message to a group
router.post('/:groupId/message', async (req, res) => {
  try {
    const { groupId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    if (!content) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    // Check if conversation exists and user is a participant
    const group = await prisma.conversation.findFirst({
      where: {
        id: groupId,
        participantIds: {
          has: userId
        }
      }
    });

    if (!group) {
      return res.status(404).json({ error: 'Group not found or you are not a member' });
    }

    // Create a new message
    const newMessage = await prisma.chat.create({
      data: {
        senderId: userId,
        receiverId: 'group', // Marker for group messages
        message: content,
        conversationId: groupId,
      }
    });

    // Update conversation's updatedAt
    await prisma.conversation.update({
      where: { id: groupId },
      data: { updatedAt: new Date() }
    });

    // Get sender details
    const sender = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true }
    });

    // Prepare the message for the response
    const messageWithSender = {
      id: newMessage.id,
      content: newMessage.message,
      sender,
      createdAt: newMessage.timestamp
    };

    // Notify all group members via socket
    group.participantIds.forEach(memberId => {
      if (memberId !== userId) { // Don't notify sender
        io.to(`user_${memberId}`).emit('group_message', {
          message: messageWithSender,
          groupId
        });
      }
    });

    res.status(201).json(messageWithSender);
  } catch (error) {
    console.error('Error sending group message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Add members to a group
router.post('/:groupId/members', async (req, res) => {
  try {
    const { groupId } = req.params;
    const { members } = req.body;
    const userId = req.user.id;

    if (!members || !Array.isArray(members) || members.length === 0) {
      return res.status(400).json({ error: 'Member list is required' });
    }

    // Check if conversation exists and user is a participant
    const group = await prisma.conversation.findFirst({
      where: {
        id: groupId,
        participantIds: {
          has: userId
        }
      }
    });

    if (!group) {
      return res.status(404).json({ error: 'Group not found or you are not a member' });
    }

    // Add new members to the group
    const updatedGroup = await prisma.conversation.update({
      where: { id: groupId },
      data: {
        participantIds: {
          set: [...new Set([...group.participantIds, ...members])] // Add new members, ensure uniqueness
        }
      }
    });

    // Create a message noting the additions
    await prisma.chat.create({
      data: {
        senderId: userId,
        receiverId: 'group',
        message: `${req.user.name} added new members to the group`,
        conversationId: groupId,
      }
    });

    // Notify all members
    updatedGroup.participantIds.forEach(memberId => {
      io.to(`user_${memberId}`).emit('group_update', {
        type: 'members_added',
        groupId,
        newMembers: members
      });
    });

    res.json({ success: true, members: updatedGroup.participantIds });
  } catch (error) {
    console.error('Error adding members to group:', error);
    res.status(500).json({ error: 'Failed to add members to group' });
  }
});

// Leave a group
router.post('/:groupId/leave', async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;

    // Check if conversation exists and user is a participant
    const group = await prisma.conversation.findFirst({
      where: {
        id: groupId,
        participantIds: {
          has: userId
        }
      }
    });

    if (!group) {
      return res.status(404).json({ error: 'Group not found or you are not a member' });
    }

    // Remove user from the group
    const updatedGroup = await prisma.conversation.update({
      where: { id: groupId },
      data: {
        participantIds: {
          set: group.participantIds.filter(id => id !== userId)
        }
      }
    });

    // Create a message noting the departure
    await prisma.chat.create({
      data: {
        senderId: userId,
        receiverId: 'group',
        message: `${req.user.name} left the group`,
        conversationId: groupId,
      }
    });

    // Notify remaining members
    updatedGroup.participantIds.forEach(memberId => {
      io.to(`user_${memberId}`).emit('group_update', {
        type: 'member_left',
        groupId,
        userId
      });
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error leaving group:', error);
    res.status(500).json({ error: 'Failed to leave group' });
  }
});

export default router; 