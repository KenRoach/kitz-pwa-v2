import { useState, useRef, useCallback } from 'react';
import { useAppStore } from '@/lib/store';
import { apiStream } from '@/lib/api';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export function ChatPage() {
  const dict = useAppStore((s) => s.dict);
  const credits = useAppStore((s) => s.credits);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

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
      await apiStream(
        '/api/chat',
        { message: text },
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
            m.id === assistantId ? { ...m, content: `⚠️ ${dict.common.error}` } : m,
          ),
        );
      }
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  }, [input, isStreaming, dict.common.error]);

  const stopGeneration = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  return (
    <div className="chat-page">
      <header className="chat-header">
        <h1>KitZ</h1>
        <span className="chat-credits">
          {credits} {dict.chat.credits}
        </span>
      </header>

      <div className="chat-messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`chat-bubble ${msg.role}`}>
            {msg.content || '...'}
          </div>
        ))}
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
