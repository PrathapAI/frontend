import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL;

export default function Chat({ listingId, receiverId, user, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const socketRef = useRef();


  useEffect(() => {
    let token = '';
    try {
      if (typeof localStorage !== 'undefined' && localStorage !== null) {
        token = localStorage.getItem('token');
      }
    } catch (e) {
      token = '';
    }
    socketRef.current = io(SOCKET_URL, {
      auth: { token }
    });
    // Join room and request chat history
    socketRef.current.emit('joinRoom', { listingId, withUserId: receiverId });
    socketRef.current.on('chatHistory', (msgs) => {
      setMessages(msgs);
    });
    socketRef.current.on('receiveMessage', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });
    return () => {
      socketRef.current.disconnect();
    };
  }, [listingId, receiverId]);

  const sendMessage = () => {
    if (input.trim()) {
      socketRef.current.emit('sendMessage', {
        listingId,
        receiverId,
        message: input
      });
      setInput('');
    }
  };

  return (
    <div className="chat-modal" style={{
      position: 'fixed',
      top: '10%',
      left: '50%',
      transform: 'translateX(-50%)',
      width: 500,
      height: 600,
      background: '#fff',
      borderRadius: 16,
      boxShadow: '0 4px 32px rgba(0,0,0,0.18)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      <div className="chat-header" style={{
        background: '#111',
        color: '#fff',
        padding: '16px',
        fontWeight: 700,
        fontSize: 20,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span>Chat</span>
        <button onClick={onClose} style={{background:'#111',border:'none',color:'#111',fontSize:22,cursor:'pointer',borderRadius:8,padding:'2px 12px'}}>×</button>
      </div>
      <div className="chat-messages" style={{
        flex: 1,
        padding: 24,
        overflowY: 'auto',
        background: '#f7f7f7'
      }}>
        {messages.map((msg, idx) => {
          // Support both new and history messages
          const senderId = msg.sender?.id ?? msg.SenderID;
          const senderName = msg.sender?.name ?? (msg.SenderID === user.id ? 'You' : 'User');
          return (
            <div
              key={idx}
              className={senderId === user.id ? 'my-message' : 'their-message'}
              style={{
                margin: '8px 0',
                textAlign: senderId === user.id ? 'right' : 'left',
                color: senderId === user.id ? '#1976d2' : '#232526',
                fontWeight: 500
              }}
            >
              <b>{senderName}:</b> {msg.MessageContent || msg.message}
            </div>
          );
        })}
      </div>
      <div className="chat-input" style={{
        display: 'flex',
        borderTop: '1px solid #eee',
        padding: 16,
        background: '#fafafa'
      }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} style={{
          flex: 1,
          padding: 12,
          borderRadius: 8,
          border: '1px solid #ccc',
          fontSize: 16,
          marginRight: 12
        }} />
        <button onClick={sendMessage} style={{
          background: '#111',
          color: '#111',
          border: 'none',
          borderRadius: 8,
          padding: '10px 24px',
          fontWeight: 700,
          fontSize: 16,
          cursor: 'pointer'
        }}>Send</button>
      </div>
    </div>
  );
}
