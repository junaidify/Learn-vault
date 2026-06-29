import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLogout } from '../../api/auth';

export default function Navbar() {
  const { user, isAuthenticated, clearAuth } = useAuth();
  const logoutMutation = useLogout();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        clearAuth();
        navigate('/login');
      },
    });
  };

  return (
    <header className="glass sticky top-0 z-50" style={{ boxShadow: 'var(--shadow-glass)' }}>
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 no-underline">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl"
               style={{ background: 'linear-gradient(135deg, var(--color-brand-600), var(--color-brand-400))' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"
                 strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-surface-900)' }}>
            Learn<span style={{ color: 'var(--color-brand-600)' }}>Vault</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden items-center gap-1 md:flex">
          <NavLink to="/">Courses</NavLink>

          {isAuthenticated && user?.role === 'STUDENT' && (
            <NavLink to="/dashboard">Dashboard</NavLink>
          )}
          {isAuthenticated && user?.role === 'AUTHOR' && (
            <>
              <NavLink to="/author/courses">My Courses</NavLink>
              <NavLink to="/author/courses/new">Create Course</NavLink>
            </>
          )}
        </div>

        {/* Right side */}
        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated ? (
            <>
              <div className="flex items-center gap-2 rounded-full px-3 py-1.5"
                   style={{ background: 'var(--color-brand-50)', color: 'var(--color-brand-700)' }}>
                <div className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white"
                     style={{ background: 'linear-gradient(135deg, var(--color-brand-600), var(--color-brand-400))' }}>
                  {user!.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium">{user!.name}</span>
                <span className="rounded-full px-2 py-0.5 text-xs font-semibold"
                      style={{ background: 'var(--color-brand-100)', color: 'var(--color-brand-700)' }}>
                  {user!.role}
                </span>
              </div>
              <button onClick={handleLogout}
                      className="cursor-pointer rounded-lg border-none px-4 py-2 text-sm font-medium transition-colors"
                      style={{ background: 'var(--color-surface-100)', color: 'var(--color-surface-800)' }}>
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login"
                    className="rounded-lg px-4 py-2 text-sm font-medium no-underline transition-colors"
                    style={{ color: 'var(--color-surface-800)' }}>
                Log in
              </Link>
              <Link to="/signup"
                    className="rounded-lg px-5 py-2 text-sm font-semibold text-white no-underline shadow-sm transition-all hover:shadow-md"
                    style={{ background: 'linear-gradient(135deg, var(--color-brand-600), var(--color-brand-500))', borderRadius: 'var(--radius-btn)' }}>
                Sign up free
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button onClick={() => setMobileOpen(!mobileOpen)}
                className="flex cursor-pointer items-center justify-center rounded-lg border-none bg-transparent p-2 md:hidden"
                aria-label="Toggle menu">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {mobileOpen ? (
              <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
            ) : (
              <><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></>
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="animate-slide-up border-t px-4 pb-4 pt-2 md:hidden"
             style={{ borderColor: 'var(--color-surface-200)', background: 'rgba(255,255,255,0.95)' }}>
          <div className="flex flex-col gap-1">
            <MobileLink to="/" onClick={() => setMobileOpen(false)}>Courses</MobileLink>

            {isAuthenticated && user?.role === 'STUDENT' && (
              <MobileLink to="/dashboard" onClick={() => setMobileOpen(false)}>Dashboard</MobileLink>
            )}
            {isAuthenticated && user?.role === 'AUTHOR' && (
              <>
                <MobileLink to="/author/courses" onClick={() => setMobileOpen(false)}>My Courses</MobileLink>
                <MobileLink to="/author/courses/new" onClick={() => setMobileOpen(false)}>Create Course</MobileLink>
              </>
            )}

            <hr className="my-2 border-none" style={{ height: 1, background: 'var(--color-surface-200)' }} />

            {isAuthenticated ? (
              <button onClick={() => { handleLogout(); setMobileOpen(false); }}
                      className="cursor-pointer rounded-lg border-none px-3 py-2.5 text-left text-sm font-medium"
                      style={{ background: 'var(--color-surface-100)', color: 'var(--color-surface-800)' }}>
                Log out
              </button>
            ) : (
              <>
                <MobileLink to="/login" onClick={() => setMobileOpen(false)}>Log in</MobileLink>
                <Link to="/signup" onClick={() => setMobileOpen(false)}
                      className="mt-1 block rounded-lg px-3 py-2.5 text-center text-sm font-semibold text-white no-underline"
                      style={{ background: 'linear-gradient(135deg, var(--color-brand-600), var(--color-brand-500))' }}>
                  Sign up free
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

/* ---- helper link components ---- */

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link to={to}
          className="rounded-lg px-3 py-2 text-sm font-medium no-underline transition-colors hover:bg-gray-100"
          style={{ color: 'var(--color-surface-800)' }}>
      {children}
    </Link>
  );
}

function MobileLink({ to, children, onClick }: { to: string; children: React.ReactNode; onClick: () => void }) {
  return (
    <Link to={to} onClick={onClick}
          className="rounded-lg px-3 py-2.5 text-sm font-medium no-underline transition-colors"
          style={{ color: 'var(--color-surface-800)' }}>
      {children}
    </Link>
  );
}
