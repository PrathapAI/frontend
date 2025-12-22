import React, { useState, useEffect, useRef } from 'react';
import { messagesAPI } from '../services/features';
import { FaPaperPlane, FaTimes } from 'react-icons/fa';

function ChatWindow({ otherUserId, otherUserName, listingId, onClose }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  
  const token = localStorage.getItem('token');
  let userId = null;
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      userId = payload.id;
    } catch {}
  }

  useEffect(() => {
    if (userId && otherUserId) {
      fetchConversation();
      // Poll for new messages every 5 seconds
      const interval = setInterval(fetchConversation, 5000);
      return () => clearInterval(interval);
    }
  }, [userId, otherUserId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversation = async () => {
    try {
      const { data } = await messagesAPI.getConversation(userId, otherUserId);
      setMessages(data);
    } catch (err) {
      console.error('Error fetching conversation:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);
      await messagesAPI.sendMessage({
        SenderID: userId,
        RecipientID: otherUserId,
        ListingID: listingId,
        MessageContent: newMessage.trim()
      });
      setNewMessage('');
      await fetchConversation();
    } catch (err) {
      console.error('Error sending message:', err);
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h3 style={{ margin: 0 }}>Chat with {otherUserName}</h3>
          <button onClick={onClose} style={styles.closeBtn}>
            <FaTimes />
          </button>
        </div>
        <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={{ margin: 0, fontSize: '18px' }}>Chat with {otherUserName}</h3>
        <button onClick={onClose} style={styles.closeBtn}>
          <FaTimes />
        </button>
      </div>

      <div style={styles.messagesContainer}>
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#888', padding: '40px 20px' }}>
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((msg) => {
            const isSent = msg.SenderID === userId;
            return (
              <div
                key={msg.MessageID}
                style={{
                  ...styles.messageWrapper,
                  justifyContent: isSent ? 'flex-end' : 'flex-start'
                }}
              >
                <div
                  style={{
                    ...styles.messageBubble,
                    background: isSent ? '#3498db' : '#ecf0f1',
                    color: isSent ? 'white' : '#2c3e50',
                    borderRadius: isSent ? '18px 18px 4px 18px' : '18px 18px 18px 4px'
                  }}
                >
                  <div style={styles.messageText}>{msg.MessageContent}</div>
                  <div
                    style={{
                      ...styles.messageTime,
                      color: isSent ? 'rgba(255,255,255,0.7)' : '#7f8c8d'
                    }}
                  >
                    {new Date(msg.Timestamp).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} style={styles.inputContainer}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          style={styles.input}
          disabled={sending}
        />
        <button
          type="submit"
          disabled={sending || !newMessage.trim()}
          style={{
            ...styles.sendBtn,
            opacity: sending || !newMessage.trim() ? 0.5 : 1,
            cursor: sending || !newMessage.trim() ? 'not-allowed' : 'pointer'
          }}
        >
          <FaPaperPlane />
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: {
    position: 'fixed',
    bottom: '90px',
    left: '20px',
    width: '300px',
    maxWidth: '90vw',
    height: '400px',
    maxHeight: '60vh',
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 1000,
    overflow: 'hidden'
  },
  header: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '16px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  closeBtn: {
    background: 'transparent',
    border: 'none',
    color: '#000',
    fontSize: '20px',
    cursor: 'pointer',
    padding: '4px 8px'
  },
  messagesContainer: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    background: '#f8f9fa'
  },
  messageWrapper: {
    display: 'flex',
    width: '100%'
  },
  messageBubble: {
    maxWidth: '70%',
    padding: '10px 16px',
    wordWrap: 'break-word',
    boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
  },
  messageText: {
    fontSize: '14px',
    lineHeight: '1.4',
    marginBottom: '4px'
  },
  messageTime: {
    fontSize: '11px',
    marginTop: '4px'
  },
  inputContainer: {
    padding: '16px',
    borderTop: '1px solid #e0e0e0',
    display: 'flex',
    gap: '10px',
    background: 'white'
  },
  input: {
    flex: 1,
    padding: '12px 16px',
    border: '1px solid #e0e0e0',
    borderRadius: '24px',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s'
  },
  sendBtn: {
    background: '#3498db',
    color: '#000',
    border: 'none',
    borderRadius: '50%',
    width: '44px',
    height: '44px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    fontWeight: '600',
    transition: 'background 0.2s'
  }
};

export default ChatWindow;
