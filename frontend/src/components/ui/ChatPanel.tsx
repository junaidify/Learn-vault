import { useState, useRef, useEffect } from 'react';
import { useSendMessage } from '../../api/chat';
import { useCourses } from '../../api/courses';
import type { ChatMessage } from '../../lib/types';

/* =========================================
   AI Chat Panel — Slide-in panel for
   per-course RAG Q&A or global course Q&A
   ========================================= */

interface ChatPanelProps {
  courseId?: number | string;
  courseName?: string;
  onClose: () => void;
}

export default function ChatPanel({ courseId, courseName, onClose }: ChatPanelProps) {
  const [selectedCourseId, setSelectedCourseId] = useState<number | string | undefined>(courseId);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [conversationId, setConversationId] = useState<string | undefined>();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const sendMessage = useSendMessage();

  // Load all courses for the catalog selector (only needed if courseId is not locked)
  const { data: coursesData, isLoading: isLoadingCourses } = useCourses({ size: 100 });

  // Update selected course if the prop courseId changes
  useEffect(() => {
    if (courseId !== undefined) {
      setSelectedCourseId(courseId);
      // Clear conversation when switching to a prop-defined course
      setMessages([]);
      setConversationId(undefined);
    }
  }, [courseId]);

  // Find the selected course details
  const selectedCourse = coursesData?.content.find(
    (c) => c.id === Number(selectedCourseId)
  );
  
  const activeCourseName = selectedCourse 
    ? selectedCourse.name 
    : (courseName || 'Selected Course');

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sendMessage.isPending]);

  // Focus input when course is selected
  useEffect(() => {
    if (selectedCourseId) {
      setTimeout(() => inputRef.current?.focus(), 350);
    }
  }, [selectedCourseId]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || sendMessage.isPending || !selectedCourseId) return;

    // Add user message
    const userMsg: ChatMessage = { role: 'user', content: trimmed, timestamp: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    sendMessage.mutate(
      { courseId: selectedCourseId, message: trimmed, conversationId },
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

  const handleSelectCourse = (id: number) => {
    setSelectedCourseId(id);
    setMessages([]);
    setConversationId(undefined);
  };

  return (
    <div className="animate-slide-in-right fixed bottom-0 right-0 top-0 z-50 flex w-full flex-col sm:w-[420px]"
         style={{ background: 'var(--color-surface-0)', boxShadow: '-4px 0 24px rgba(0,0,0,0.15)' }}>
      
      {/* Header */}
      <div className="flex items-center justify-between border-b px-5 py-4"
           style={{ borderColor: 'var(--color-surface-200)' }}>
        <div className="flex items-center gap-3 min-w-0">
          {/* Back button — only if opened globally (no courseId prop) and a course is currently selected */}
          {courseId === undefined && selectedCourseId !== undefined && (
            <button
              onClick={() => setSelectedCourseId(undefined)}
              className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border-none hover:bg-gray-100"
              style={{ background: 'transparent', color: 'var(--color-surface-800)' }}
              title="Back to course list"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
            </button>
          )}

          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
               style={{ background: 'linear-gradient(135deg, var(--color-brand-600), var(--color-brand-400))' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"
                 strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-ellipsis overflow-hidden whitespace-nowrap" style={{ color: 'var(--color-surface-900)' }}>
              {selectedCourseId ? 'AI Course Assistant' : 'Select a Course'}
            </h3>
            {selectedCourseId && (
              <p className="text-xs text-ellipsis overflow-hidden whitespace-nowrap" style={{ color: 'var(--color-surface-800)', opacity: 0.6 }}>
                {activeCourseName}
              </p>
            )}
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

      {/* Body content */}
      {!selectedCourseId ? (
        // Course selector screen
        <div className="chat-scrollbar flex-1 overflow-y-auto px-5 py-6">
          <div className="mb-5 text-center">
            <p className="text-xs" style={{ color: 'var(--color-surface-800)', opacity: 0.6 }}>
              Select a course to ask questions and learn key concepts using AI.
            </p>
          </div>

          {isLoadingCourses ? (
            <div className="space-y-3">
              <div className="h-16 rounded-xl animate-pulse bg-gray-100" />
              <div className="h-16 rounded-xl animate-pulse bg-gray-100" />
              <div className="h-16 rounded-xl animate-pulse bg-gray-100" />
            </div>
          ) : !coursesData?.content || coursesData.content.length === 0 ? (
            <p className="text-center text-xs text-gray-500 py-10">No courses available for chat.</p>
          ) : (
            <div className="space-y-3">
              {coursesData.content.map((c) => (
                <button
                  key={c.id}
                  onClick={() => handleSelectCourse(c.id)}
                  className="w-full text-left cursor-pointer rounded-xl border p-4 transition-all hover:bg-gray-50 hover:shadow-sm flex items-center justify-between"
                  style={{
                    borderColor: 'var(--color-surface-200)',
                    background: 'var(--color-surface-0)',
                  }}
                >
                  <div className="min-w-0 pr-3">
                    <h4 className="text-sm font-bold text-ellipsis overflow-hidden whitespace-nowrap" style={{ color: 'var(--color-surface-900)' }}>
                      {c.name}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">By {c.authorName}</p>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand-500)" strokeWidth="2.5">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        // Active Chat screen
        <>
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
                <p className="mt-1 text-xs px-4" style={{ color: 'var(--color-surface-800)', opacity: 0.5 }}>
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
        </>
      )}
    </div>
  );
}
