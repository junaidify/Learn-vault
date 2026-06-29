import { Link } from 'react-router-dom';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer style={{ background: 'var(--color-surface-900)', color: 'var(--color-surface-200)' }}>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg"
                   style={{ background: 'linear-gradient(135deg, var(--color-brand-500), var(--color-brand-400))' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"
                     strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                </svg>
              </div>
              <span className="text-lg font-bold" style={{ fontFamily: 'var(--font-heading)', color: 'white' }}>
                Learn<span style={{ color: 'var(--color-brand-400)' }}>Vault</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-surface-200)', opacity: 0.7 }}>
              Premium courses from expert authors. Level up your skills in tech, communication, psychology, and languages.
            </p>
          </div>

          {/* Explore */}
          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--color-brand-300)' }}>
              Explore
            </h4>
            <ul className="list-none space-y-2 p-0">
              <li><Link to="/" className="text-sm no-underline transition-colors hover:text-white" style={{ color: 'var(--color-surface-200)', opacity: 0.7 }}>All Courses</Link></li>
              <li><Link to="/?category=TECH" className="text-sm no-underline transition-colors hover:text-white" style={{ color: 'var(--color-surface-200)', opacity: 0.7 }}>Tech</Link></li>
              <li><Link to="/?category=COMMUNICATION" className="text-sm no-underline transition-colors hover:text-white" style={{ color: 'var(--color-surface-200)', opacity: 0.7 }}>Communication</Link></li>
              <li><Link to="/?category=PSYCHOLOGY" className="text-sm no-underline transition-colors hover:text-white" style={{ color: 'var(--color-surface-200)', opacity: 0.7 }}>Psychology</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--color-brand-300)' }}>
              Company
            </h4>
            <ul className="list-none space-y-2 p-0">
              <li><span className="text-sm" style={{ color: 'var(--color-surface-200)', opacity: 0.7 }}>About</span></li>
              <li><span className="text-sm" style={{ color: 'var(--color-surface-200)', opacity: 0.7 }}>Careers</span></li>
              <li><span className="text-sm" style={{ color: 'var(--color-surface-200)', opacity: 0.7 }}>Privacy Policy</span></li>
              <li><span className="text-sm" style={{ color: 'var(--color-surface-200)', opacity: 0.7 }}>Terms of Service</span></li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--color-brand-300)' }}>
              Connect
            </h4>
            <ul className="list-none space-y-2 p-0">
              <li><span className="text-sm" style={{ color: 'var(--color-surface-200)', opacity: 0.7 }}>Twitter</span></li>
              <li><span className="text-sm" style={{ color: 'var(--color-surface-200)', opacity: 0.7 }}>LinkedIn</span></li>
              <li><span className="text-sm" style={{ color: 'var(--color-surface-200)', opacity: 0.7 }}>GitHub</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t pt-6" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
          <p className="text-center text-xs" style={{ color: 'var(--color-surface-200)', opacity: 0.5 }}>
            © {year} LearnVault. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
