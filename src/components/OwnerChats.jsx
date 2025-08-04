import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import Chat from './Chat';

const SOCKET_URL = import.meta.env.VITE_API_URL;

export default function OwnerChats({ listingId, user }) {
  const [chats, setChats] = useState({});
  const [selectedPair, setSelectedPair] = useState(null);
  const [showChat, setShowChat] = useState(false);
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
    socketRef.current = io(SOCKET_URL, { auth: { token } });
    socketRef.current.emit('loadAllChatsForOwner', { listingId });
    socketRef.current.on('allChatsForOwner', (allChats) => {
      setChats(allChats);
    });
    return () => { socketRef.current.disconnect(); };
  }, [listingId]);

  const chatPairs = Object.keys(chats);

  return (
    <div style={{margin:'16px 0',padding:'10px 24px',background:'#eee',borderRadius:8}}>
      <b>All chats for this listing:</b>
      <ul>
        {chatPairs.length === 0 && <li>No chats yet.</li>}
        {chatPairs.map(pair => {
          const msgs = chats[pair];
          // Find the other user in the pair
          const otherUserId = msgs[0].SenderID === user.id ? msgs[0].RecipientID : msgs[0].SenderID;
          return (
            <li key={pair} style={{margin:'8px 0'}}>
              <button onClick={()=>{setSelectedPair(pair);setShowChat(true);}} style={{padding:'6px 16px',borderRadius:6,border:'1px solid #aaa',background:'#fff',cursor:'pointer'}}>
                Chat with User {otherUserId}
              </button>
            </li>
          );
        })}
      </ul>
      {showChat && selectedPair && (
        <Chat
          listingId={listingId}
          receiverId={(() => {
            const msgs = chats[selectedPair];
            return msgs[0].SenderID === user.id ? msgs[0].RecipientID : msgs[0].SenderID;
          })()}
          user={user}
          onClose={()=>setShowChat(false)}
        />
      )}
    </div>
  );
}
