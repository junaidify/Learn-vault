import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useCourse } from '../api/courses';
import { useCreateOrder, useVerifyPayment } from '../api/payment';
import { useAuth } from '../context/AuthContext';
import { openRazorpayCheckout, type RazorpayResponse } from '../lib/razorpay';
import CategoryBadge from '../components/ui/CategoryBadge';
import VideoPlayer from '../components/ui/VideoPlayer';
import { useState } from 'react';

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuth();
  const { data: course, isLoading, isError } = useCourse(id!);
  const createOrder = useCreateOrder();
  const verifyPayment = useVerifyPayment();
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const location = useLocation();

  const handleOpenGlobalChat = () => {
    window.dispatchEvent(new CustomEvent('open-global-chat'));
  };

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location } });
      return;
    }

    setPaymentStatus('processing');
    createOrder.mutate(Number(id), {
      onSuccess: (orderData) => {
        openRazorpayCheckout(
          orderData,
          (response: RazorpayResponse) => {
            // Verify payment
            verifyPayment.mutate(
              {
                razorpayPaymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
                signature: response.razorpay_signature,
                courseId: Number(id),
              },
              {
                onSuccess: () => {
                  setPaymentStatus('success');
                  // Invalidate queries so that the course details page immediately gets access
                  queryClient.invalidateQueries({ queryKey: ['course'] });
                  queryClient.invalidateQueries({ queryKey: ['courses'] });
                },
                onError: () => setPaymentStatus('error'),
              },
            );
          },
          () => setPaymentStatus('idle'), // dismissed
          user?.name,
        );
      },
      onError: () => setPaymentStatus('error'),
    });
  };

  const hasAccess = paymentStatus === 'success' || !!course?.videoUrl;

  // Loading
  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <div className="skeleton h-10 w-3/4" />
          <div className="skeleton h-6 w-1/3" />
          <div className="skeleton h-40 w-full" />
        </div>
      </div>
    );
  }

  // Error
  if (isError || !course) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-xl font-bold" style={{ color: 'var(--color-surface-900)' }}>Course not found</h2>
          <p className="mt-2 text-sm" style={{ color: 'var(--color-surface-800)', opacity: 0.6 }}>
            The course you're looking for doesn't exist or has been removed.
          </p>
          <button onClick={() => navigate('/')}
                  className="mt-4 cursor-pointer rounded-xl border-none px-6 py-2.5 text-sm font-semibold text-white"
                  style={{ background: 'var(--color-brand-600)' }}>
            Back to courses
          </button>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(course.createdAt).toLocaleDateString('en-IN', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div className="animate-fade-in">
      {/* Header section */}
      <section className="relative overflow-hidden py-14"
               style={{ background: 'linear-gradient(135deg, var(--color-surface-900) 0%, var(--color-brand-900) 100%)' }}>
        <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full opacity-10"
             style={{ background: 'radial-gradient(circle, var(--color-brand-400), transparent 70%)' }} />

        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <CategoryBadge category={course.category} className="mb-4" />
          <h1 className="text-3xl font-extrabold text-white sm:text-4xl"
              style={{ fontFamily: 'var(--font-heading)' }}>
            {course.name}
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
            <span className="flex items-center gap-1.5">
              <div className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white"
                   style={{ background: 'var(--color-brand-500)' }}>
                {course.authorName.charAt(0).toUpperCase()}
              </div>
              {course.authorName}
            </span>
            <span>•</span>
            <span>{formattedDate}</span>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player — only visible when user has access */}
            {hasAccess && course.videoUrl && (
              <div className="animate-fade-in">
                <VideoPlayer src={course.videoUrl} title={course.name} />
              </div>
            )}

            <div>
              <h2 className="mb-3 text-lg font-bold" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-surface-900)' }}>
                About this course
              </h2>
              <p className="whitespace-pre-line text-sm leading-relaxed"
                 style={{ color: 'var(--color-surface-800)', lineHeight: '1.8' }}>
                {course.description}
              </p>
            </div>

            {/* Course info cards */}
            <div className="grid gap-3 sm:grid-cols-2">
              <InfoCard icon="📂" label="Category" value={course.category} />
              <InfoCard icon="👨‍🏫" label="Author" value={course.authorName} />
              <InfoCard icon="📅" label="Published" value={formattedDate} />
              <InfoCard icon="✅" label="Status" value={course.published ? 'Published' : 'Draft'} />
            </div>

            {/* AI Chat button — always visible to allow interaction */}
            <button
              onClick={handleOpenGlobalChat}
              className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-4 text-sm font-semibold transition-all hover:shadow-md"
              style={{
                borderColor: 'var(--color-brand-200)',
                background: 'var(--color-brand-50)',
                color: 'var(--color-brand-700)',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                   strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              💬 Ask the AI Assistant about this course
            </button>
          </div>

          {/* Sidebar — enrollment card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-2xl p-6"
                 style={{ background: 'var(--color-surface-0)', boxShadow: 'var(--shadow-card)' }}>
              <div className="mb-4 text-center">
                <span className="text-3xl font-extrabold"
                      style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-brand-700)' }}>
                  ₹{course.amount.toLocaleString('en-IN')}
                </span>
              </div>

              {paymentStatus === 'success' || hasAccess ? (
                <div className="space-y-3">
                  <div className="rounded-xl p-4 text-center"
                       style={{ background: '#ECFDF5' }}>
                    <p className="text-sm font-semibold" style={{ color: 'var(--color-success)' }}>
                      🎉 Enrolled successfully!
                    </p>
                    <p className="mt-1 text-xs" style={{ color: 'var(--color-surface-800)', opacity: 0.6 }}>
                      You now have access to this course.
                    </p>
                  </div>
                  {/* Quick action — open chat */}
                  <button
                    onClick={handleOpenGlobalChat}
                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border-none py-2.5 text-sm font-medium transition-all hover:shadow-sm"
                    style={{ background: 'var(--color-brand-50)', color: 'var(--color-brand-700)' }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    Ask AI Assistant
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={handleEnroll}
                    disabled={paymentStatus === 'processing'}
                    className="w-full cursor-pointer rounded-xl border-none py-3 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                    style={{ background: 'linear-gradient(135deg, var(--color-brand-600), var(--color-brand-500))' }}
                  >
                    {paymentStatus === 'processing' ? 'Processing…' : `Enroll & Pay ₹${course.amount.toLocaleString('en-IN')}`}
                  </button>

                  <button
                    onClick={handleOpenGlobalChat}
                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed py-2.5 text-sm font-medium transition-all hover:bg-gray-50"
                    style={{ borderColor: 'var(--color-brand-200)', color: 'var(--color-brand-700)', background: 'transparent' }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    Ask AI Assistant (Free Demo)
                  </button>

                  {paymentStatus === 'error' && (
                    <p className="mt-3 text-center text-xs font-medium" style={{ color: 'var(--color-error)' }}>
                      Payment failed. Please try again.
                    </p>
                  )}
                </div>
              )}

              <ul className="mt-5 list-none space-y-2 p-0">
                <li className="flex items-center gap-2 text-xs" style={{ color: 'var(--color-surface-800)', opacity: 0.6 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                  Full lifetime access
                </li>
                <li className="flex items-center gap-2 text-xs" style={{ color: 'var(--color-surface-800)', opacity: 0.6 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                  Access on mobile and desktop
                </li>
                <li className="flex items-center gap-2 text-xs" style={{ color: 'var(--color-surface-800)', opacity: 0.6 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                  AI-powered Q&A assistant
                </li>
                <li className="flex items-center gap-2 text-xs" style={{ color: 'var(--color-surface-800)', opacity: 0.6 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                  Certificate of completion
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

function InfoCard({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl p-3" style={{ background: 'var(--color-surface-50)' }}>
      <span className="text-lg">{icon}</span>
      <div>
        <p className="text-xs font-medium" style={{ color: 'var(--color-surface-800)', opacity: 0.5 }}>{label}</p>
        <p className="text-sm font-semibold" style={{ color: 'var(--color-surface-900)' }}>{value}</p>
      </div>
    </div>
  );
}
