import { useState, useRef, useEffect } from 'react';
import { useSendMessage } from '../../api/chat';
import type { ChatMessage } from '../../lib/types';

/* =========================================
   AI Chat Panel — Slide-in panel for
   per-course RAG Q&A
   ========================================= */

interface ChatPanelProps {
  courseId: number | string;
  courseName: string;
  onClose: () => void;
}

export default function ChatPanel({ courseId, courseName, onClose }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [conversationId, setConversationId] = useState<string | undefined>();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const sendMessage = useSendMessage();

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sendMessage.isPending]);

  // Focus input on mount
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 350);
  }, []);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || sendMessage.isPending) return;

    // Add user message
    const userMsg: ChatMessage = { role: 'user', content: trimmed, timestamp: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    sendMessage.mutate(
      { courseId, message: trimmed, conversationId },
      {
        onSuccess: (data) => {
          setConversationId(data.conversationId);
          const assistantMsg: ChatMessage = {
            role: 'assistant',
            content: data.message,
            timestamp: Date.now(),
          };
          setMessages((prev) => [...prev, assistantMsg]);
        },
        onError: () => {
          const errorMsg: ChatMessage = {
            role: 'assistant',
            content: "Sorry, I couldn't process that. Please try again.",
            timestamp: Date.now(),
          };
          setMessages((prev) => [...prev, errorMsg]);
        },
      },
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="animate-slide-in-right fixed bottom-0 right-0 top-0 z-40 flex w-full flex-col sm:w-[420px]"
         style={{ background: 'var(--color-surface-0)', boxShadow: '-4px 0 24px rgba(0,0,0,0.1)' }}>
      {/* Header */}
      <div className="flex items-center justify-between border-b px-5 py-4"
           style={{ borderColor: 'var(--color-surface-200)' }}>
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl"
               style={{ background: 'linear-gradient(135deg, var(--color-brand-600), var(--color-brand-400))' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"
                 strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-bold" style={{ color: 'var(--color-surface-900)' }}>
              AI Assistant
            </h3>
            <p className="text-xs" style={{ color: 'var(--color-surface-800)', opacity: 0.5 }}>
              {courseName}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border-none transition-colors hover:bg-gray-100"
          style={{ background: 'transparent', color: 'var(--color-surface-800)' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="chat-scrollbar flex-1 overflow-y-auto px-5 py-4">
        {messages.length === 0 && (
          <div className="animate-fade-in flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
                 style={{ background: 'var(--color-brand-50)' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand-400)"
                   strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <h4 className="text-sm font-semibold" style={{ color: 'var(--color-surface-900)' }}>
              Ask anything about this course
            </h4>
            <p className="mt-1 text-xs" style={{ color: 'var(--color-surface-800)', opacity: 0.5 }}>
              The AI assistant has knowledge of the course content and can help answer your questions.
            </p>
            {/* Suggested prompts */}
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {['What will I learn?', 'Key concepts?', 'Prerequisites?'].map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => { setInput(prompt); inputRef.current?.focus(); }}
                  className="cursor-pointer rounded-full border px-3 py-1.5 text-xs font-medium transition-all hover:shadow-sm"
                  style={{ borderColor: 'var(--color-surface-200)', background: 'var(--color-surface-50)', color: 'var(--color-surface-800)' }}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`chat-bubble mb-3 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className="max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed"
              style={
                msg.role === 'user'
                  ? {
                      background: 'linear-gradient(135deg, var(--color-brand-600), var(--color-brand-500))',
                      color: 'white',
                      borderBottomRightRadius: '4px',
                    }
                  : {
                      background: 'var(--color-surface-100)',
                      color: 'var(--color-surface-900)',
                      borderBottomLeftRadius: '4px',
                    }
              }
            >
              {msg.content}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {sendMessage.isPending && (
          <div className="chat-bubble mb-3 flex justify-start">
            <div className="flex items-center gap-1.5 rounded-2xl px-4 py-3"
                 style={{ background: 'var(--color-surface-100)', borderBottomLeftRadius: '4px' }}>
              <div className="typing-indicator flex gap-1">
                <span /><span /><span />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <div className="border-t px-4 py-3" style={{ borderColor: 'var(--color-surface-200)' }}>
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question…"
            className="flex-1 rounded-xl border px-4 py-2.5 text-sm outline-none transition-all focus:ring-2"
            style={{
              borderColor: 'var(--color-surface-200)',
              background: 'var(--color-surface-50)',
            }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sendMessage.isPending}
            className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border-none text-white transition-all hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, var(--color-brand-600), var(--color-brand-500))' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                 strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
        <p className="mt-1.5 text-center text-[10px]" style={{ color: 'var(--color-surface-800)', opacity: 0.3 }}>
          AI can make mistakes. Verify important information.
        </p>
      </div>
    </div>
  );
}
