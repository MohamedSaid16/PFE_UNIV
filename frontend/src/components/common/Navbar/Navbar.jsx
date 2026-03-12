/*
  Navbar — public-facing navigation bar.
  Converted from friend's TS. FaBars/FaTimes → inline SVGs, generic grays → tokens.
  Image import removed (asset may not exist yet) — fallback text always used.
*/

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

/* Inline SVG icons */
const MenuIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/>
  </svg>
);
const XIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
  </svg>
);
const GlobeIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5a17.92 17.92 0 0 1-8.716-2.247m0 0A9 9 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
  </svg>
);

const LANGUAGES = [
  { code: 'fr', label: 'Français' },
  { code: 'en', label: 'English' },
  { code: 'ar', label: 'العربية' },
];

const navLinkKeys = [
  { key: 'navbar.home', path: '/' },
  { key: 'navbar.about', path: '/about' },
  { key: 'navbar.contact', path: '/contact' },
];

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const changeLanguage = (code) => {
    i18n.changeLanguage(code);
    document.documentElement.lang = code;
    document.documentElement.dir = code === 'ar' ? 'rtl' : 'ltr';
    setLangOpen(false);
  };

  const currentLang = LANGUAGES.find((l) => l.code === i18n.language) || LANGUAGES[0];

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-surface/95 backdrop-blur-md shadow-card py-2 border-b border-edge'
          : 'bg-canvas py-4 border-b border-edge'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 rtl:space-x-reverse group">
            <div className="w-10 h-10 rounded-lg bg-brand text-white flex items-center justify-center font-bold text-sm tracking-tight select-none">
              IK
            </div>
            <div className="hidden sm:flex flex-col leading-tight">
              <span className="text-lg font-bold text-ink">{t('brand.name')}</span>
              <span className="text-xs text-ink-tertiary">{t('brand.tagline')}</span>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6 rtl:space-x-reverse">
            {navLinkKeys.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-ink-secondary hover:text-ink font-medium transition-colors duration-200 relative group"
              >
                {t(link.key)}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand group-hover:w-full transition-all duration-300" />
              </Link>
            ))}

            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-ink-secondary hover:text-ink hover:bg-surface-200 transition-colors duration-150"
              >
                <GlobeIcon className="w-4 h-4" />
                <span>{currentLang.label}</span>
                <svg className={`w-3 h-3 transition-transform duration-150 ${langOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
              </button>

              {langOpen && (
                <div className="absolute right-0 rtl:right-auto rtl:left-0 mt-1 w-36 bg-surface rounded-lg border border-edge shadow-card py-1 z-50">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => changeLanguage(lang.code)}
                      className={`w-full text-left rtl:text-right px-4 py-2 text-sm transition-colors duration-100 ${
                        i18n.language === lang.code
                          ? 'text-brand font-semibold bg-blue-50 dark:bg-blue-950/40'
                          : 'text-ink-secondary hover:bg-surface-200 hover:text-ink'
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Link
              to="/login"
              className="bg-brand text-white px-5 py-2 rounded-md font-medium hover:bg-brand-hover transition-all duration-150"
            >
              {t('common.signIn')}
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-md text-ink-secondary hover:bg-surface-200 transition"
            aria-label={t('navbar.toggleMenu')}
          >
            {isOpen ? <XIcon className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-2">
            {navLinkKeys.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className="block px-4 py-2.5 rounded-md text-ink-secondary hover:bg-surface-200 hover:text-ink transition font-medium"
              >
                {t(link.key)}
              </Link>
            ))}

            {/* Mobile Language Switcher */}
            <div className="px-4 py-2 flex items-center gap-2">
              <GlobeIcon className="w-4 h-4 text-ink-tertiary" />
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors duration-100 ${
                    i18n.language === lang.code
                      ? 'bg-brand text-white'
                      : 'bg-surface-200 text-ink-secondary hover:bg-surface-300'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>

            <Link
              to="/login"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2.5 rounded-md bg-brand text-white text-center font-medium hover:bg-brand-hover transition"
            >
              {t('common.signIn')}
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
