import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import Logo from './Logo.jsx';

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/services', label: 'Services' },
  { to: '/infrastructure', label: 'Infrastructure' },
  { to: '/packages', label: 'Packages' },
  { to: '/case-studies', label: 'Case Studies' },
  { to: '/about', label: 'About' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'border-b border-white/[0.06] bg-navy/95 backdrop-blur-xl'
          : 'bg-transparent'
      }`}
    >
      <div className="container-x flex h-16 items-center justify-between">
        <Link to="/" aria-label="A1 Creative Home">
          <Logo />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-0.5">
          {NAV_LINKS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `px-3.5 py-2 text-sm font-medium rounded transition-colors duration-200 ${
                  isActive
                    ? 'text-blue bg-blue/[0.08]'
                    : 'text-silver-dim hover:text-silver hover:bg-white/[0.04]'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <a href="https://a1creativeagency.com/quote" className="btn-ghost !py-2.5 !px-5 !text-xs">
            Get a Quote
          </a>
          <a href="https://a1creativeagency.com/quote" className="btn-primary !py-2.5 !px-5 !text-xs">
            Start Your System
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          className="lg:hidden flex flex-col gap-[5px] p-2.5 rounded transition-colors hover:bg-white/[0.05]"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        >
          <span
            className={`block h-0.5 w-5 bg-silver transition-all duration-200 ${
              menuOpen ? 'translate-y-[7px] rotate-45' : ''
            }`}
          />
          <span
            className={`block h-0.5 w-5 bg-silver transition-opacity duration-200 ${
              menuOpen ? 'opacity-0' : ''
            }`}
          />
          <span
            className={`block h-0.5 w-5 bg-silver transition-all duration-200 ${
              menuOpen ? '-translate-y-[7px] -rotate-45' : ''
            }`}
          />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden border-t border-white/[0.06] bg-navy/98 backdrop-blur-xl">
          <nav className="container-x py-4 flex flex-col gap-0.5">
            {NAV_LINKS.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `px-4 py-3 text-sm font-medium rounded transition-colors ${
                    isActive
                      ? 'text-blue bg-blue/[0.08]'
                      : 'text-silver-dim hover:text-silver hover:bg-white/[0.04]'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
            <div className="mt-3 pt-3 border-t border-white/[0.06] flex flex-col gap-2">
              <a href="https://a1creativeagency.com/quote" className="btn-ghost !text-xs !py-3 text-center">
                Get a Quote
              </a>
              <a href="https://a1creativeagency.com/quote" className="btn-primary !text-xs !py-3 text-center">
                Start Your System
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
