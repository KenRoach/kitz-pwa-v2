import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/lib/store';
import { apiStream } from '@/lib/api';
import type { Locale } from '@/i18n/types';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  attachment?: { name: string; type: 'file' | 'photo'; url: string };
}

const LOCALES: { value: Locale; label: string }[] = [
  { value: 'es-PA', label: 'ES' },
  { value: 'en-US', label: 'EN' },
  { value: 'pt-BR', label: 'PT' },
];

const SPEECH_LANG: Record<Locale, string> = {
  'es-PA': 'es-ES',
  'en-US': 'en-US',
  'pt-BR': 'pt-BR',
};

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
  const [isRecording, setIsRecording] = useState(false);
  const [attachment, setAttachment] = useState<Message['attachment'] | undefined>();
  const abortRef = useRef<AbortController | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const handleLogout = () => {
    localStorage.removeItem('kitz-token');
    localStorage.removeItem('kitz-user');
    setUser(null);
    navigate('/login');
  };

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || isStreaming) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      attachment,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setAttachment(undefined);
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
  }, [input, isStreaming, messages, dict.common.error, attachment]);

  const stopGeneration = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const sendQuickAction = (text: string) => {
    setInput(text);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setAttachment({ name: file.name, type: 'file', url });
    e.target.value = '';
  };

  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setAttachment({ name: file.name, type: 'photo', url });
    e.target.value = '';
  };

  const toggleVoiceDictation = useCallback(() => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
  
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = SPEECH_LANG[locale];
    recognition.interimResults = true;
    recognition.continuous = true;
    recognition.maxAlternatives = 1;

    let finalTranscript = input;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += (finalTranscript ? ' ' : '') + transcript;
          setInput(finalTranscript);
        } else {
          interim += transcript;
        }
      }
      if (interim) {
        setInput(finalTranscript + (finalTranscript ? ' ' : '') + interim);
      }
    };

    recognition.onerror = () => {
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);

  }, [isRecording, locale, input]);

  const removeAttachment = () => {
    if (attachment?.url) URL.revokeObjectURL(attachment.url);
    setAttachment(undefined);
  };

  return (
    <div className="chat-page">
      <header className="chat-header">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" width="28" height="28" aria-label="KitZ">
          <path d="M 30 35 Q 30 10 55 10 L 170 10 Q 195 10 195 35 L 195 135 Q 195 160 170 160 L 100 160 L 60 190 L 70 160 L 55 160 Q 30 160 30 135 Z" fill="#1A1A1A"/>
          <text x="113" y="130" fontFamily="'Playfair Display', Georgia, serif" fontSize="130" fontWeight="700" fill="#F9F6EF" textAnchor="middle">K</text>
        </svg>
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
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square" aria-hidden="true">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
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
              {msg.attachment && (
                <div className="chat-attachment-preview">
                  {msg.attachment.type === 'photo' ? (
                    <img
                      src={msg.attachment.url}
                      alt={msg.attachment.name}
                      className="chat-attachment-img"
                      width="200"
                      height="150"
                    />
                  ) : (
                    <span className="chat-attachment-file-badge">
                      {msg.attachment.name}
                    </span>
                  )}
                </div>
              )}
              {msg.content || '...'}
            </div>
          ))
        )}
      </div>

      <div className="chat-input-area">
        {attachment && (
          <div className="chat-attachment-bar">
            <span className="chat-attachment-name">
              {attachment.type === 'photo' ? dict.chat.attachedPhoto : dict.chat.attachedFile}: {attachment.name}
            </span>
            <button
              className="chat-attachment-remove"
              type="button"
              onClick={removeAttachment}
              aria-label={dict.common.delete}
            >
              &times;
            </button>
          </div>
        )}
        {isRecording && (
          <div className="chat-recording-bar">
            <span className="chat-recording-dot" />
            <span className="chat-recording-label">{dict.chat.recording}</span>
            <button
              className="chat-recording-stop"
              type="button"
              onClick={toggleVoiceDictation}
            >
              {dict.chat.stop}
            </button>
          </div>
        )}
        <div className="chat-input-row">
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
              disabled={!input.trim() && !attachment}
              type="button"
            >
              {dict.chat.send}
            </button>
          )}
        </div>
        <div className="chat-action-bar">
          <button
            className="chat-action-btn"
            type="button"
            onClick={() => fileInputRef.current?.click()}
            aria-label={dict.chat.attachFile}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square">
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
            </svg>
            <span>{dict.chat.attachFile}</span>
          </button>
          <button
            className="chat-action-btn"
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            aria-label={dict.chat.attachCamera}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
            <span>{dict.chat.attachCamera}</span>
          </button>
          <button
            className={`chat-action-btn${isRecording ? ' recording' : ''}`}
            type="button"
            onClick={toggleVoiceDictation}
            aria-label={dict.chat.attachVoice}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square">
              <rect x="9" y="1" width="6" height="12" rx="2" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
            <span>{isRecording ? dict.chat.recording : dict.chat.attachVoice}</span>
          </button>
        </div>
        {/* Hidden file inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt"
          className="sr-only"
          onChange={handleFileSelect}
          aria-hidden="true"
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="sr-only"
          onChange={handleCameraCapture}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
