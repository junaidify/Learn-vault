import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import ChatPanel from '../ui/ChatPanel';

export default function Layout() {
  const [chatOpen, setChatOpen] = useState(false);
  const location = useLocation();

  // Listen for custom events from child components to open the global chat panel
  useEffect(() => {
    const handleOpenChat = () => setChatOpen(true);
    window.addEventListener('open-global-chat', handleOpenChat);
    return () => window.removeEventListener('open-global-chat', handleOpenChat);
  }, []);

  // Show floating chatbot on Home (CatalogPage) and Course Detail Page (CourseDetailPage)
  const isHome = location.pathname === '/';
  const isCourseDetail = location.pathname.startsWith('/courses/');
  const shouldShowFloatingChat = isHome || isCourseDetail;

  // Extract courseId from path if on course detail page
  const courseMatch = location.pathname.match(/^\/courses\/(\d+)/);
  const courseId = courseMatch ? Number(courseMatch[1]) : undefined;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 relative">
        <Outlet />
      </main>
      <Footer />

      {/* Floating Chat Button */}
      {shouldShowFloatingChat && (
        <button
          onClick={() => setChatOpen((prev) => !prev)}
          className="fixed bottom-6 right-6 z-40 flex h-14 w-14 cursor-pointer items-center justify-center rounded-full border-none text-white shadow-lg transition-all hover:scale-105"
          style={{
            background: 'linear-gradient(135deg, var(--color-brand-600), var(--color-brand-500))',
            boxShadow: '0 4px 16px rgba(79, 70, 229, 0.4)',
          }}
          title="Ask AI Assistant"
        >
          {chatOpen ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
                 strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          )}
        </button>
      )}

      {/* Chat Panel */}
      {chatOpen && (
        <ChatPanel
          courseId={courseId}
          onClose={() => setChatOpen(false)}
        />
      )}
    </div>
  );
}
