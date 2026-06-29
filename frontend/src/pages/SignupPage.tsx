import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { signupSchema, type SignupFormValues } from '../lib/validations';
import { useSignup } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

export default function SignupPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuth();
  const signupMutation = useSignup();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: '', username: '', email: '', password: '', role: 'STUDENT' },
  });

  const onSubmit = async (values: SignupFormValues) => {
    signupMutation.mutate(values, {
      onSuccess: () => {
        // After signup we know name + role from the form data
        setAuth(values.name, values.role);
        navigate('/');
      },
    });
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4 py-12">
      {/* Background decoration */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" style={{ zIndex: -1 }}>
        <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full opacity-20"
             style={{ background: 'radial-gradient(circle, var(--color-brand-300), transparent 70%)' }} />
        <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full opacity-15"
             style={{ background: 'radial-gradient(circle, var(--color-brand-400), transparent 70%)' }} />
      </div>

      <div className="animate-fade-in w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
               style={{ background: 'linear-gradient(135deg, var(--color-brand-600), var(--color-brand-400))' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"
                 strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="8.5" cy="7" r="4"/>
              <line x1="20" y1="8" x2="20" y2="14"/>
              <line x1="23" y1="11" x2="17" y2="11"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-surface-900)' }}>
            Create your account
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--color-surface-800)', opacity: 0.6 }}>
            Start learning or teaching in minutes
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-6 sm:p-8"
             style={{ background: 'var(--color-surface-0)', boxShadow: 'var(--shadow-card)' }}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Server error */}
            {signupMutation.isError && (
              <div className="rounded-lg p-3 text-sm font-medium"
                   style={{ background: '#FEF2F2', color: 'var(--color-error)' }}>
                {(signupMutation.error as Error)?.message?.includes('409')
                  ? 'An account with this username or email already exists.'
                  : 'Signup failed. Please try again.'}
              </div>
            )}

            {/* Name */}
            <Field label="Full Name" id="name" error={errors.name?.message}>
              <input id="name" type="text" autoComplete="name" {...register('name')}
                     className={inputClass(!!errors.name)} placeholder="John Doe" />
            </Field>

            {/* Username */}
            <Field label="Username" id="username" error={errors.username?.message}
                   hint="8-15 chars, letters, numbers, underscore">
              <input id="username" type="text" autoComplete="username" {...register('username')}
                     className={inputClass(!!errors.username)} placeholder="john_doe99" />
            </Field>

            {/* Email */}
            <Field label="Email" id="email" error={errors.email?.message}>
              <input id="email" type="email" autoComplete="email" {...register('email')}
                     className={inputClass(!!errors.email)} placeholder="you@example.com" />
            </Field>

            {/* Password */}
            <Field label="Password" id="password" error={errors.password?.message}
                   hint="8-20 chars, must include uppercase, lowercase & digit">
              <div className="relative">
                <input id="password" type={showPassword ? 'text' : 'password'}
                       autoComplete="new-password" {...register('password')}
                       className={inputClass(!!errors.password) + ' pr-12'} placeholder="••••••••" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer border-none bg-transparent p-1"
                        style={{ color: 'var(--color-surface-800)', opacity: 0.4 }} tabIndex={-1}>
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
            </Field>

            {/* Role */}
            <Field label="I want to" id="role" error={errors.role?.message}>
              <div className="flex gap-3">
                {(['STUDENT', 'AUTHOR'] as const).map((r) => (
                  <label key={r}
                         className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all"
                         style={{
                           borderColor: 'var(--color-surface-200)',
                           background: 'var(--color-surface-50)',
                         }}>
                    <input type="radio" value={r} {...register('role')} className="accent-indigo-600" />
                    <span>{r === 'STUDENT' ? '📚 Learn' : '✍️ Teach'}</span>
                  </label>
                ))}
              </div>
            </Field>

            {/* Submit */}
            <button type="submit" disabled={isSubmitting || signupMutation.isPending}
                    className="w-full cursor-pointer rounded-xl border-none py-3 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                    style={{ background: 'linear-gradient(135deg, var(--color-brand-600), var(--color-brand-500))' }}>
              {signupMutation.isPending ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          {/* Footer link */}
          <p className="mt-6 text-center text-sm" style={{ color: 'var(--color-surface-800)', opacity: 0.6 }}>
            Already have an account?{' '}
            <Link to="/login" className="font-semibold no-underline" style={{ color: 'var(--color-brand-600)' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

/* ---- shared form helpers ---- */

function inputClass(hasError: boolean): string {
  return `w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-all focus:ring-2 ${hasError ? '' : ''}`;
}

function Field({ label, id, error, hint, children }: {
  label: string; id: string; error?: string; hint?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--color-surface-800)' }}>
        {label}
      </label>
      {children}
      {hint && !error && (
        <p className="mt-1 text-xs" style={{ color: 'var(--color-surface-800)', opacity: 0.4 }}>{hint}</p>
      )}
      {error && (
        <p className="mt-1 text-xs" style={{ color: 'var(--color-error)' }}>{error}</p>
      )}
    </div>
  );
}
