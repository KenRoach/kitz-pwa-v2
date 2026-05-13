import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/lib/store';
import { apiStream } from '@/lib/api';
import type { Locale } from '@/i18n/types';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const LOCALES: { value: Locale; label: string }[] = [
  { value: 'es-PA', label: 'ES' },
  { value: 'en-US', label: 'EN' },
  { value: 'pt-BR', label: 'PT' },
];

export function ChatPage() {
  const navigate = useNavigate();
  const dict = useAppStore((s) => s.dict);
  const credits = useAppStore((s) => s.credits);
  const locale = useAppStore((s) => s.locale);
  const setLocale = useAppStore((s) => s.setLocale);
  const setUser = useAppStore((s) => s.setUser);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const handleLogout = () => {
    localStorage.removeItem('kitz-token');
    localStorage.removeItem('kitz-user');
    setUser(null);
    navigate('/login');
  };

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || isStreaming) return;

    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsStreaming(true);

    const assistantId = crypto.randomUUID();
    setMessages((prev) => [...prev, { id: assistantId, role: 'assistant', content: '' }]);

    abortRef.current = new AbortController();

    try {
      const history = messages
        .filter((m) => m.content)
        .map((m) => ({ role: m.role, content: m.content }));

      await apiStream(
        '/api/chat',
        { message: text, history },
        (chunk) => {
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantId ? { ...m, content: m.content + chunk } : m)),
          );
        },
        abortRef.current.signal,
      );
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: `\u26A0\uFE0F ${dict.common.error}` } : m,
          ),
        );
      }
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  }, [input, isStreaming, messages, dict.common.error]);

  const stopGeneration = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const sendQuickAction = (text: string) => {
    setInput(text);
  };

  return (
    <div className="chat-page">
      <header className="chat-header">
        <h1>KitZ</h1>
        <span className="chat-credits">
          {credits} {dict.chat.credits}
        </span>
        <div className="profile-menu-wrapper">
          <button
            className="profile-btn"
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Profile menu"
          >
            <span className="profile-avatar">K</span>
          </button>
          {menuOpen && (
            <div className="profile-dropdown">
              <div className="locale-switcher-inline">
                {LOCALES.map((l) => (
                  <button
                    key={l.value}
                    className={`locale-chip${locale === l.value ? ' active' : ''}`}
                    onClick={() => {
                      setLocale(l.value);
                      setMenuOpen(false);
                    }}
                    type="button"
                  >
                    {l.label}
                  </button>
                ))}
              </div>
              <button
                className="dropdown-logout-btn"
                type="button"
                onClick={handleLogout}
              >
                {dict.auth.logout}
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="chat-welcome">
            <p className="chat-welcome-text">{dict.chat.welcome}</p>
            <div className="quick-actions">
              <button
                className="quick-chip"
                type="button"
                onClick={() => sendQuickAction(dict.chat.quickQuote)}
              >
                {dict.chat.quickQuote}
              </button>
              <button
                className="quick-chip"
                type="button"
                onClick={() => sendQuickAction(dict.chat.quickContact)}
              >
                {dict.chat.quickContact}
              </button>
              <button
                className="quick-chip"
                type="button"
                onClick={() => sendQuickAction(dict.chat.quickVoice)}
              >
                {dict.chat.quickVoice}
              </button>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`chat-bubble ${msg.role}`}>
              {msg.content || '...'}
            </div>
          ))
        )}
      </div>

      <div className="chat-input-area">
        <div className="chat-quota-bar" />
        <div className="chat-input-row">
          <button className="chat-attach-btn" aria-label="Attach" type="button">
            +
          </button>
          <input
            type="text"
            className="chat-input"
            placeholder={dict.chat.placeholder}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            disabled={isStreaming}
          />
          {isStreaming ? (
            <button className="chat-stop-btn" onClick={stopGeneration} type="button">
              {dict.chat.stop}
            </button>
          ) : (
            <button
              className="chat-send-btn"
              onClick={sendMessage}
              disabled={!input.trim()}
              type="button"
            >
              {dict.chat.send}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
