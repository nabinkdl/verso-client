import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Send } from 'lucide-react';
import { Chat, User } from '../types';
import Avatar from './Avatar';

interface ChatScreenProps {
  chats: Chat[];
  users: User[];
  currentUserId: string;
  onSendMessage: (chatId: string, text: string) => void;
}

export default function ChatScreen({ chats, users, currentUserId, onSendMessage }: ChatScreenProps) {
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const getUserById = (uid: string) => users.find(u => u.id === uid);
  const myChats = chats.filter(c => c.participants.includes(currentUserId));
  const activeChat = myChats.find(c => c.id === activeChatId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat?.messages.length]);

  const handleSend = () => {
    if (!inputText.trim() || !activeChatId) return;
    onSendMessage(activeChatId, inputText.trim());
    setInputText('');
  };

  if (activeChatId && activeChat) {
    const otherId = activeChat.participants.find(id => id !== currentUserId)!;
    const otherUser = getUserById(otherId)!;
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 16, gap: 10, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => setActiveChatId(null)}
            style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: 4 }}
          >
            <ArrowLeft size={22} />
          </button>
          <Avatar name={otherUser.name} />
          <div>
            <div style={{ fontWeight: 600, fontSize: 15 }}>{otherUser.name}</div>
            <div style={{ fontSize: 12, color: '#777' }}>@{otherUser.username}</div>
          </div>
        </div>

        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            padding: '8px 0',
          }}
        >
          {activeChat.messages.map((msg, i) => {
            const isMe = msg.from === currentUserId;
            return (
              <div key={i} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                <div
                  style={{
                    maxWidth: '80%',
                    padding: '8px 14px',
                    borderRadius: 20,
                    background: isMe ? '#ffffff' : '#1c1c1c',
                    color: isMe ? '#000' : '#fff',
                    fontSize: 14,
                    border: isMe ? 'none' : '0.5px solid #2c2c2c',
                  }}
                >
                  {msg.text}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="type message..."
            style={{
              flex: 1,
              background: '#111',
              border: '0.5px solid #333',
              borderRadius: 30,
              padding: '10px 16px',
              color: 'white',
              fontSize: 14,
              fontFamily: 'inherit',
            }}
          />
          <button
            onClick={handleSend}
            style={{
              background: 'white',
              border: 'none',
              borderRadius: 30,
              padding: '0 16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Send size={16} color="#000" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <h2 style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>messages</h2>
      {myChats.map(chat => {
        const otherId = chat.participants.find(id => id !== currentUserId)!;
        const otherUser = getUserById(otherId);
        if (!otherUser) return null;
        const lastMsg = chat.messages[chat.messages.length - 1]?.text ?? 'no messages';
        return (
          <div
            key={chat.id}
            onClick={() => setActiveChatId(chat.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              background: '#0c0c0c',
              padding: 12,
              borderRadius: 20,
              border: '0.5px solid #2a2a2a',
              cursor: 'pointer',
            }}
          >
            <Avatar name={otherUser.name} />
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{otherUser.name}</div>
              <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>
                {lastMsg.length > 30 ? lastMsg.slice(0, 30) + '…' : lastMsg}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
