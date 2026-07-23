import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLogout } from '../../api/auth';

export default function Navbar() {
  const { user, isAuthenticated, clearAuth } = useAuth();
  const logoutMutation = useLogout();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    setDropdownOpen(false);
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        clearAuth();
        navigate('/login');
      },
    });
  };

  // Close dropdown on outside click
  useEffect(() => {
    if (!dropdownOpen) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [dropdownOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="glass sticky top-0 z-50" style={{ boxShadow: 'var(--shadow-glass)' }}>
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 no-underline">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-black">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
            </svg>
          </div>
          <span className="text-xl font-extrabold tracking-tight" style={{ fontFamily: 'var(--font-heading)', color: '#000000' }}>
            tutorly<span className="text-gray-400">.</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden items-center gap-1 md:flex">
          <NavLink to="/" active={isActive('/')}>Home</NavLink>
          <a href="/#about" className="rounded-lg px-3 py-2 text-sm font-medium no-underline transition-colors hover:bg-gray-100" style={{ color: 'var(--color-surface-800)' }}>About Us</a>
          <NavLink to="/" active={false}>Courses</NavLink>
          <a href="#" className="rounded-lg px-3 py-2 text-sm font-medium no-underline transition-colors hover:bg-gray-100" style={{ color: 'var(--color-surface-800)' }}>Blog</a>

          {isAuthenticated && user?.role === 'STUDENT' && (
            <NavLink to="/dashboard" active={isActive('/dashboard')}>Dashboard</NavLink>
          )}
          {isAuthenticated && user?.role === 'AUTHOR' && (
            <>
              <NavLink to="/author/courses" active={isActive('/author/courses')}>My Courses</NavLink>
              <NavLink to="/author/courses/new" active={isActive('/author/courses/new')}>Create Course</NavLink>
            </>
          )}
        </div>

        {/* Right side */}
        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated ? (
            <div className="relative" ref={dropdownRef}>
              {/* User avatar button */}
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex cursor-pointer items-center gap-2 rounded-full border-none px-3 py-1.5 transition-all hover:shadow-sm"
                style={{ background: 'var(--color-brand-50)', color: 'var(--color-brand-700)' }}
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white bg-black">
                  {user!.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium">{user!.name}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                     className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}>
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {/* Dropdown menu */}
              {dropdownOpen && (
                <div className="animate-fade-in absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-xl py-1 shadow-lg"
                     style={{ background: 'var(--color-surface-0)', border: '1px solid var(--color-surface-200)' }}>
                  {/* User info */}
                  <div className="border-b px-4 py-3" style={{ borderColor: 'var(--color-surface-100)' }}>
                    <p className="text-sm font-semibold" style={{ color: 'var(--color-surface-900)' }}>
                      {user!.name}
                    </p>
                    <span className="mt-0.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold bg-black text-white">
                      {user!.role}
                    </span>
                  </div>

                  {/* Nav items */}
                  {user?.role === 'STUDENT' && (
                    <Link to="/dashboard" onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm no-underline transition-colors hover:bg-gray-50"
                          style={{ color: 'var(--color-surface-800)' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                        <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                      </svg>
                      Dashboard
                    </Link>
                  )}
                  {user?.role === 'AUTHOR' && (
                    <>
                      <Link to="/author/courses" onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2 px-4 py-2.5 text-sm no-underline transition-colors hover:bg-gray-50"
                            style={{ color: 'var(--color-surface-800)' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        </svg>
                        My Courses
                      </Link>
                      <Link to="/author/courses/new" onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2 px-4 py-2.5 text-sm no-underline transition-colors hover:bg-gray-50"
                            style={{ color: 'var(--color-surface-800)' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                        </svg>
                        Create Course
                      </Link>
                    </>
                  )}

                  <div className="my-1 h-px" style={{ background: 'var(--color-surface-100)' }} />

                  <button onClick={handleLogout}
                          className="flex w-full cursor-pointer items-center gap-2 border-none px-4 py-2.5 text-left text-sm transition-colors hover:bg-gray-50"
                          style={{ background: 'transparent', color: 'var(--color-error)' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                      <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                    </svg>
                    Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login"
              state={{from: location}}
                    className="rounded-lg px-4 py-2 text-sm font-medium no-underline transition-colors hover:bg-gray-100"
                    style={{ color: 'var(--color-surface-800)' }}>
                Log in
              </Link>
              <Link to="/signup"
                    state={{from: location}}
                    className="inline-flex items-center gap-2 rounded-full bg-black py-2 pl-5 pr-2.5 text-sm font-semibold text-white no-underline shadow-sm transition-all hover:bg-slate-900"
                    style={{ borderRadius: '9999px' }}>
                <span>SIGN UP</span>
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-black text-[10px] font-bold">
                  →
                </span>
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
            <MobileLink to="/">Courses</MobileLink>

            {isAuthenticated && user?.role === 'STUDENT' && (
              <MobileLink to="/dashboard">Dashboard</MobileLink>
            )}
            {isAuthenticated && user?.role === 'AUTHOR' && (
              <>
                <MobileLink to="/author/courses">My Courses</MobileLink>
                <MobileLink to="/author/courses/new">Create Course</MobileLink>
              </>
            )}

            <hr className="my-2 border-none" style={{ height: 1, background: 'var(--color-surface-200)' }} />

            {isAuthenticated ? (
              <button onClick={handleLogout}
                      className="cursor-pointer rounded-lg border-none px-3 py-2.5 text-left text-sm font-medium"
                      style={{ background: 'var(--color-surface-100)', color: 'var(--color-surface-800)' }}>
                Log out
              </button>
            ) : (
              <>
                <MobileLink to="/login" state={{ from: location }}>Log in</MobileLink>
                <Link to="/signup"
                      state={{ from: location }}
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

function NavLink({ to, children, active }: { to: string; children: React.ReactNode; active?: boolean }) {
  return (
    <Link to={to}
          className="rounded-lg px-3 py-2 text-sm font-medium no-underline transition-colors hover:bg-gray-100"
          style={{
            color: active ? 'var(--color-brand-600)' : 'var(--color-surface-800)',
            background: active ? 'var(--color-brand-50)' : undefined,
          }}>
      {children}
    </Link>
  );
}

function MobileLink({ to, state, children }: { to: string; state?: any; children: React.ReactNode }) {
  return (
    <Link to={to}
          state={state}
          className="rounded-lg px-3 py-2.5 text-sm font-medium no-underline transition-colors"
          style={{ color: 'var(--color-surface-800)' }}>
      {children}
    </Link>
  );
}
