const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('======= Testing Database Content =======');

    // Check all conversations
    const conversations = await prisma.conversation.findMany({
      include: {
        messages: true
      }
    });
    
    console.log(`Found ${conversations.length} conversations`);
    
    // Check for group conversations
    const groupConversations = conversations.filter(conv => 
      conv.messages.some(msg => msg.receiverId === 'group')
    );
    
    console.log(`Found ${groupConversations.length} group conversations`);
    
    // Print group conversations
    if (groupConversations.length > 0) {
      console.log('Group conversations:');
      groupConversations.forEach((group, i) => {
        console.log(`Group ${i + 1}:`);
        console.log(`- ID: ${group.id}`);
        console.log(`- Participants: ${group.participantIds.join(', ')}`);
        console.log(`- Messages: ${group.messages.length}`);
        
        // Get the name from the first message
        const firstMessage = group.messages.find(msg => msg.receiverId === 'group');
        if (firstMessage) {
          const groupName = firstMessage.message.includes('group created by') 
            ? firstMessage.message.split('group created by')[0].trim()
            : 'Unknown Group';
          console.log(`- Name: ${groupName}`);
        }
        
        console.log('---');
      });
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect()); 