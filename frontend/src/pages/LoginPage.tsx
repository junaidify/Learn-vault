import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { loginSchema, type LoginFormValues, isEmail } from '../lib/validations';
import { useLogin } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

export default function LoginPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuth();
  const loginMutation = useLogin();
  const [showPassword, setShowPassword] = useState(false);
  const location = useLocation();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: '', password: '' },
  });

  const from = location.state?.from?.pathname || "/";

  const onSubmit = async (values: LoginFormValues) => {
    const payload = isEmail(values.identifier)
      ? { email: values.identifier, password: values.password }
      : { username: values.identifier, password: values.password };

    loginMutation.mutate(payload, {
      onSuccess: () => {
        /*
         * ⚠️ FLAGGED GAP: The login endpoint returns only "Login successful" (plain text).
         * It does NOT return name or role. We cannot populate AuthContext properly.
         * Setting a placeholder — the user will have limited navigation until
         * a GET /api/v1/auth/me endpoint is added.
         */
        setAuth(values.identifier, 'STUDENT');
        navigate(from, {replace:true});
      },
    });
  };

  const handleGoogleLogin = () => {
    // Dynamically resolve base URL to support both local proxy and Vercel production rewrites
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';
    const baseUrl = apiBaseUrl.startsWith('http') ? apiBaseUrl : '';
    window.location.href = `${baseUrl}/oauth2/authorization/google?redirect_uri=${window.location.origin}${from}`;
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4 py-12">
      {/* Background decoration */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" style={{ zIndex: -1 }}>
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full opacity-20"
             style={{ background: 'radial-gradient(circle, var(--color-brand-300), transparent 70%)' }} />
        <div className="absolute -bottom-20 -right-20 h-80 w-80 rounded-full opacity-15"
             style={{ background: 'radial-gradient(circle, var(--color-brand-400), transparent 70%)' }} />
      </div>

      <div className="animate-fade-in w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
               style={{ background: 'linear-gradient(135deg, var(--color-brand-600), var(--color-brand-400))' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"
                 strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-surface-900)' }}>
            Welcome back
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--color-surface-800)', opacity: 0.6 }}>
            Sign in to continue your learning journey
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-6 sm:p-8"
             style={{ background: 'var(--color-surface-0)', boxShadow: 'var(--shadow-card)' }}>

          {/* Google OAuth */}
          <button
            onClick={handleGoogleLogin}
            className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all hover:shadow-sm"
            style={{ borderColor: 'var(--color-surface-200)', background: 'var(--color-surface-0)', color: 'var(--color-surface-800)' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Sign in with Google
          </button>

          {/* Divider */}
          <div className="auth-divider my-5">or continue with email</div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Server error */}
            {loginMutation.isError && (
              <div className="rounded-lg p-3 text-sm font-medium"
                   style={{ background: '#FEF2F2', color: 'var(--color-error)' }}>
                {(loginMutation.error as Error)?.message?.includes('401')
                  ? 'Invalid email/username or password.'
                  : 'Login failed. Please try again.'}
              </div>
            )}

            {/* Identifier */}
            <div>
              <label htmlFor="identifier" className="mb-1.5 block text-sm font-medium"
                     style={{ color: 'var(--color-surface-800)' }}>
                Email or Username
              </label>
              <input
                id="identifier"
                type="text"
                autoComplete="username"
                {...register('identifier')}
                className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-all focus:ring-2"
                style={{
                  borderColor: errors.identifier ? 'var(--color-error)' : 'var(--color-surface-200)',
                  background: 'var(--color-surface-50)',
                }}
                placeholder="you@example.com or your_username"
              />
              {errors.identifier && (
                <p className="mt-1 text-xs" style={{ color: 'var(--color-error)' }}>{errors.identifier.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium"
                     style={{ color: 'var(--color-surface-800)' }}>
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  {...register('password')}
                  className="w-full rounded-xl border px-4 py-2.5 pr-12 text-sm outline-none transition-all focus:ring-2"
                  style={{
                    borderColor: errors.password ? 'var(--color-error)' : 'var(--color-surface-200)',
                    background: 'var(--color-surface-50)',
                  }}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer border-none bg-transparent p-1"
                  style={{ color: 'var(--color-surface-800)', opacity: 0.4 }}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs" style={{ color: 'var(--color-error)' }}>{errors.password.message}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting || loginMutation.isPending}
              className="w-full cursor-pointer rounded-xl border-none py-3 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, var(--color-brand-600), var(--color-brand-500))' }}
            >
              {loginMutation.isPending ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          {/* Footer link */}
          <p className="mt-6 text-center text-sm" style={{ color: 'var(--color-surface-800)', opacity: 0.6 }}>
            Don't have an account?{' '}
            <Link to="/signup" className="font-semibold no-underline" style={{ color: 'var(--color-brand-600)' }}>
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
