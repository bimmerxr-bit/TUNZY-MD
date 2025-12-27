// commands/bc.js
const authorizedNumbers = ['+2349067345425', '+2347040439564'];

// Array to store users who have interacted with the bot
let connectedUsers = [];

// Function to add user when they interact
export function addConnectedUser(userId) {
    if (!connectedUsers.includes(userId)) {
        connectedUsers.push(userId);
        console.log(`✅ Added user to broadcast list: ${userId}`);
    }
}

// Get connected users
export function getConnectedUsers() {
    return [...connectedUsers];
}

export default {
    name: 'bc',
    alias: ['broadcast'],
    description: 'Send broadcast message to all connected users (DM only)',
    category: 'Owner',
    
    async execute(sock, m, args) {
        try {
            const senderNumber = m.sender.split('@')[0];
            
            // Authorization check
            if (!authorizedNumbers.includes(senderNumber)) {
                return await sock.sendMessage(m.chat, {
                    text: '❌ You are not authorized to use this command.'
                }, { quoted: m });
            }
            
            // Check if message is provided
            if (args.length === 0) {
                return await sock.sendMessage(m.chat, {
                    text: '⚠️ Please provide a message to broadcast.\nExample: .bc Hello everyone!'
                }, { quoted: m });
            }
            
            const broadcastMessage = args.join(' ');
            
            // Send processing message
            await sock.sendMessage(m.chat, {
                text: '📢 Broadcasting message to all connected users via DM...\nThis may take a few minutes.'
            }, { quoted: m });
            
            let successCount = 0;
            let failCount = 0;
            
            // Get all individual users who have interacted
            // You need to populate connectedUsers array when users interact
            if (connectedUsers.length === 0) {
                return await sock.sendMessage(m.chat, {
                    text: '❌ No connected users found to broadcast to.'
                }, { quoted: m });
            }
            
            console.log(`Broadcasting to ${connectedUsers.length} users...`);
            
            for (const userId of connectedUsers) {
                try {
                    // Skip if it's a group
                    if (userId.includes('@g.us')) {
                        continue;
                    }
                    
                    // Send broadcast message (comes from bot, not forwarded)
                    await sock.sendMessage(userId, {
                        text: `📢 *BROADCAST MESSAGE*\n\n${broadcastMessage}\n\n─\n_This is an automated message from the bot._`
                    });
                    
                    successCount++;
                    
                    // Delay to prevent rate limiting (1 second per message)
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    
                } catch (error) {
                    console.error(`Failed to send to ${userId}:`, error.message);
                    failCount++;
                }
            }
            
            // Send completion report
            await sock.sendMessage(m.chat, {
                text: `✅ *Broadcast Report*\n\n📤 Success: ${successCount} users\n❌ Failed: ${failCount} users\n📝 Total attempted: ${connectedUsers.length} users\n\nMessage delivered successfully!`
            }, { quoted: m });
            
        } catch (error) {
            console.error('Broadcast command error:', error);
            await sock.sendMessage(m.chat, {
                text: '❌ An error occurred while broadcasting. Please check console for details.'
            }, { quoted: m });
        }
    }
};