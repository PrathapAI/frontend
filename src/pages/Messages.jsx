import React, { useState, useEffect } from 'react';
import { messagesAPI } from '../services/features';
import { useNavigate } from 'react-router-dom';
import ChatWindow from '../components/ChatWindow';
import { FaEnvelope, FaEnvelopeOpen, FaComments } from 'react-icons/fa';

function Messages() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChat, setSelectedChat] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  
  let userId = null;
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      userId = payload.id;
    } catch {}
  }

  useEffect(() => {
    if (!userId) {
      navigate('/login');
      return;
    }
    fetchConversations();
    // Refresh conversations every 10 seconds
    const interval = setInterval(fetchConversations, 10000);
    return () => clearInterval(interval);
  }, [userId]);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const { data } = await messagesAPI.getUserMessages(userId, 'all');
      
      // Group messages by conversation (unique sender-recipient pairs)
      const conversationMap = new Map();
      
      data.forEach(msg => {
        const otherUserId = msg.SenderID === userId ? msg.RecipientID : msg.SenderID;
        const otherUserName = msg.SenderID === userId 
          ? (msg.Recipient?.Username || 'Unknown User')
          : (msg.Sender?.Username || 'Unknown User');
        
        const key = otherUserId;
        
        if (!conversationMap.has(key)) {
          conversationMap.set(key, {
            otherUserId,
            otherUserName,
            listingId: msg.ListingID,
            listingTitle: msg.Listing?.Title || 'Listing',
            lastMessage: msg.MessageContent,
            lastMessageTime: msg.Timestamp,
            unreadCount: 0,
            messages: []
          });
        }
        
        const conversation = conversationMap.get(key);
        conversation.messages.push(msg);
        
        // Update if this message is newer
        if (new Date(msg.Timestamp) > new Date(conversation.lastMessageTime)) {
          conversation.lastMessage = msg.MessageContent;
          conversation.lastMessageTime = msg.Timestamp;
        }
        
        // Count unread (messages sent to current user)
        if (msg.RecipientID === userId) {
          conversation.unreadCount++;
        }
      });
      
      // Convert to array and sort by last message time
      const conversationList = Array.from(conversationMap.values())
        .sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));
      
      setConversations(conversationList);
    } catch (err) {
      console.error('Error fetching conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  const openChat = (conversation) => {
    setSelectedChat(conversation);
  };

  const closeChat = () => {
    setSelectedChat(null);
    fetchConversations(); // Refresh to update unread counts
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading conversations...</div>;

  return (
    <div className="cred-page" style={{ paddingTop: '100px', minHeight: '100vh' }}>
      <div className="cred-container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* Page Header */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '48px',
          paddingBottom: '24px',
          borderBottom: '1px solid var(--cred-border)'
        }}>
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '12px',
            marginBottom: '12px'
          }}>
            <FaComments style={{ fontSize: '32px', color: 'var(--cred-purple)' }} />
            <h1 style={{ 
              fontSize: '2.5rem', 
              fontWeight: 900, 
              margin: 0,
              background: 'linear-gradient(135deg, var(--cred-purple) 0%, var(--cred-pink) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              messages.
            </h1>
          </div>
          <p style={{ color: 'var(--cred-text-secondary)', fontSize: '14px', margin: 0 }}>
            chat with buyers and sellers
          </p>
        </div>

      {conversations.length === 0 ? (
        <div className="cred-card" style={{ 
          textAlign: 'center', 
          padding: '60px 20px',
          background: 'var(--cred-card)'
        }}>
          <FaEnvelope style={{ fontSize: '48px', color: 'var(--cred-text-tertiary)', marginBottom: '16px' }} />
          <p style={{ fontSize: '18px', margin: 0, color: 'var(--cred-text-secondary)', marginBottom: '8px' }}>no messages yet</p>
          <p style={{ fontSize: '14px', marginTop: '8px', color: 'var(--cred-text-tertiary)' }}>start a conversation by messaging a listing owner</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {conversations.map((conversation) => (
            <div
              key={conversation.otherUserId}
              onClick={() => openChat(conversation)}
              className="cred-card"
              style={{
                padding: '20px',
                cursor: 'pointer',
                background: 'var(--cred-card)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--cred-card-hover)';
                e.currentTarget.style.borderColor = 'var(--cred-purple)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--cred-card)';
                e.currentTarget.style.borderColor = 'var(--cred-border)';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '18px'
                    }}>
                      {conversation.otherUserName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '16px', color: '#2c3e50' }}>
                        {conversation.otherUserName}
                      </div>
                      <div style={{ fontSize: '13px', color: '#7f8c8d' }}>
                        Re: {conversation.listingTitle}
                      </div>
                    </div>
                  </div>
                  <div style={{ 
                    fontSize: '14px', 
                    color: '#555',
                    marginTop: '8px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {conversation.lastMessage}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                  <div style={{ fontSize: '12px', color: '#999' }}>
                    {new Date(conversation.lastMessageTime).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                  {conversation.unreadCount > 0 && (
                    <div style={{
                      background: '#e74c3c',
                      color: 'white',
                      borderRadius: '12px',
                      padding: '2px 8px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      minWidth: '20px',
                      textAlign: 'center'
                    }}>
                      {conversation.unreadCount}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Chat Window */}
      {selectedChat && (
        <ChatWindow
          otherUserId={selectedChat.otherUserId}
          otherUserName={selectedChat.otherUserName}
          listingId={selectedChat.listingId}
          onClose={closeChat}
        />
      )}
      </div>
    </div>
  );
}

export default Messages;
