import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Send } from 'lucide-react';
import { ChatMessage, Conversation } from '../types';
import { api } from '../services/api';
import { getChatSocket } from '../services/chatSocket';
import Avatar from './Avatar';

interface ChatScreenProps {
  conversations: Conversation[];
  currentUserId: string;
  targetConversationId?: string | null;
  onClearTarget?: () => void;
  onRefresh: () => void;
}

function timeAgo(iso: string): string {
  const value = Date.parse(iso);
  if (Number.isNaN(value)) return '';

  const minutes = Math.floor((Date.now() - value) / 60000);
  if (minutes < 1) return 'now';
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return new Date(value).toLocaleDateString();
}

export default function ChatScreen({
  conversations,
  currentUserId,
  targetConversationId,
  onClearTarget,
  onRefresh,
}: ChatScreenProps) {
  const [activeId, setActiveId] = useState<string | null>(targetConversationId ?? null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const activeIdRef = useRef<string | null>(activeId);
  const typingStopRef = useRef<number | undefined>(undefined);

  activeIdRef.current = activeId;

  useEffect(() => {
    if (targetConversationId) {
      setActiveId(targetConversationId);
    }
  }, [targetConversationId]);

  useEffect(() => {
    if (!activeId) {
      setMessages([]);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    setTypingUsers([]);

    api
      .messages(activeId, { limit: 50 })
      .then((page) => {
        if (!cancelled) setMessages(page.data);
      })
      .catch((cause) => {
        if (!cancelled) {
          setError(cause instanceof Error ? cause.message : 'Could not load messages');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    const socket = getChatSocket();
    socket?.emit('conversation:join', { conversationId: activeId });
    api
      .markConversationRead(activeId)
      .then(() => onRefresh())
      .catch(() => undefined);

    const onMessage = (message: ChatMessage) => {
      if (message.conversationId !== activeIdRef.current) return;

      setMessages((prev) =>
        prev.some((item) => item.id === message.id) ? prev : [...prev, message],
      );
      api
        .markConversationRead(message.conversationId, message.id)
        .then(() => onRefresh())
        .catch(() => undefined);
    };

    const onTyping = (payload: {
      conversationId: string;
      userId: string;
      isTyping: boolean;
    }) => {
      if (payload.conversationId !== activeIdRef.current) return;
      if (payload.userId === currentUserId) return;

      setTypingUsers((prev) =>
        payload.isTyping
          ? prev.includes(payload.userId)
            ? prev
            : [...prev, payload.userId]
          : prev.filter((id) => id !== payload.userId),
      );
    };

    socket?.on('message:created', onMessage);
    socket?.on('typing', onTyping);

    return () => {
      cancelled = true;
      socket?.off('message:created', onMessage);
      socket?.off('typing', onTyping);
    };
  }, [activeId, currentUserId, onRefresh]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, typingUsers.length]);

  const activeConversation = conversations.find((c) => c.id === activeId) ?? null;
  const otherUser =
    activeConversation?.participants.find((p) => p.id !== currentUserId) ??
    activeConversation?.participants[0];
  const otherName = otherUser?.name ?? 'conversation';

  const emitTyping = (isTyping: boolean) => {
    const socket = getChatSocket();
    if (!socket?.connected || !activeId) return;

    socket.emit(isTyping ? 'typing:start' : 'typing:stop', {
      conversationId: activeId,
    });
  };

  const handleInput = (value: string) => {
    setInputText(value);
    emitTyping(true);
    window.clearTimeout(typingStopRef.current);
    typingStopRef.current = window.setTimeout(() => emitTyping(false), 1500);
  };

  const appendMessage = (message: ChatMessage) => {
    setMessages((prev) =>
      prev.some((item) => item.id === message.id) ? prev : [...prev, message],
    );
  };

  const sendOverHttp = async (conversationId: string, text: string) => {
    try {
      appendMessage(await api.sendMessage(conversationId, text));
      onRefresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not send message');
    }
  };

  const handleSend = () => {
    const text = inputText.trim();
    if (!text || !activeId) return;

    const conversationId = activeId;
    setInputText('');
    emitTyping(false);
    window.clearTimeout(typingStopRef.current);

    const socket = getChatSocket();
    if (!socket?.connected) {
      void sendOverHttp(conversationId, text);
      return;
    }

    socket.timeout(15000).emit(
      'message:send',
      { conversationId, text, clientId: `c-${Date.now()}` },
      (timeoutError: Error | null, response?: { message?: ChatMessage }) => {
        if (response?.message) {
          appendMessage(response.message);
          onRefresh();
          return;
        }

        // The server may have persisted the message even if the ack was slow;
        // the `message:created` event or the refreshed list will surface it.
        // Never resend here, or a slow ack would duplicate the message.
        onRefresh();
        if (timeoutError) {
          setError('Message is taking longer than expected — it will appear when delivered.');
        }
      },
    );
  };

  if (activeId && activeConversation) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 16, gap: 10, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => {
              setActiveId(null);
              onClearTarget?.();
            }}
            style={{ background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer', padding: 4 }}
            aria-label="Back to conversations"
          >
            <ArrowLeft size={22} />
          </button>
          <Avatar name={otherName} src={otherUser?.avatarUrl} />
          <div>
            <div style={{ fontWeight: 600, fontSize: 15 }}>{otherName}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {typingUsers.length > 0 ? 'typing…' : `@${otherUser?.username ?? 'unknown'}`}
            </div>
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
          {loading && (
            <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>loading messages…</div>
          )}
          {error && (
            <div style={{ color: 'var(--danger-soft)', fontSize: 13 }}>{error}</div>
          )}
          {!loading && messages.length === 0 && !error && (
            <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>
              no messages yet — say hello
            </div>
          )}
          {messages.map((message) => {
            const isMe = message.senderId === currentUserId;
            return (
              <div
                key={message.id}
                style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}
              >
                <div
                  style={{
                    maxWidth: '80%',
                    padding: '8px 14px',
                    borderRadius: 20,
                    background: isMe ? 'var(--text)' : 'var(--surface)',
                    color: isMe ? 'var(--bg)' : 'var(--text)',
                    fontSize: 14,
                    border: isMe ? 'none' : '0.5px solid var(--border-2)',
                    opacity: message.deleted ? 0.6 : 1,
                    fontStyle: message.deleted ? 'italic' : 'normal',
                  }}
                >
                  {message.text ?? (message.mediaUrl ? 'photo' : 'message deleted')}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={inputText}
            onChange={(event) => handleInput(event.target.value)}
            onBlur={() => emitTyping(false)}
            onKeyDown={(event) => event.key === 'Enter' && handleSend()}
            placeholder="type message..."
            style={{
              flex: 1,
              background: 'var(--bg-elevated-2)',
              border: '0.5px solid var(--border)',
              borderRadius: 30,
              padding: '10px 16px',
              color: 'var(--text)',
              fontSize: 14,
              fontFamily: 'inherit',
            }}
          />
          <button
            onClick={handleSend}
            style={{
              background: 'var(--text)',
              border: 'none',
              borderRadius: 30,
              padding: '0 16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
            aria-label="Send message"
          >
            <Send size={16} color="var(--bg)" />
          </button>
        </div>
      </div>
    );
  }

  const sorted = [...conversations].sort(
    (a, b) => Date.parse(b.lastMessageAt) - Date.parse(a.lastMessageAt),
  );

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <h2 style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>messages</h2>
      {sorted.length === 0 && (
        <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>
          No conversations yet. Message someone from their profile or a marketplace listing.
        </div>
      )}
      {sorted.map((conversation) => {
        const other =
          conversation.participants.find((p) => p.id !== currentUserId) ??
          conversation.participants[0];
        if (!other) return null;

        const lastText = conversation.lastMessage?.text ?? 'no messages';

        return (
          <div
            key={conversation.id}
            onClick={() => setActiveId(conversation.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              background: 'var(--bg-elevated)',
              padding: 12,
              borderRadius: 20,
              border: '0.5px solid var(--border-subtle)',
              cursor: 'pointer',
            }}
          >
            <Avatar name={other.name} src={other.avatarUrl} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{other.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                {lastText.length > 30 ? lastText.slice(0, 30) + '…' : lastText}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                {timeAgo(conversation.lastMessageAt)}
              </div>
              {conversation.unreadCount > 0 && (
                <span
                  style={{
                    background: 'var(--text)',
                    color: 'var(--bg)',
                    fontSize: 10,
                    fontWeight: 700,
                    minWidth: 18,
                    height: 18,
                    borderRadius: 9,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 5px',
                  }}
                >
                  {conversation.unreadCount}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
