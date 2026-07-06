import React from 'react';

interface HeaderProps {
  currentPage: 'dashboard' | 'settings';
  onNavigate: (page: 'dashboard' | 'settings') => void;
}

const Header: React.FC<HeaderProps> = ({ currentPage, onNavigate }) => {
  return (
    <header className="header">
      <div className="header__brand">
        <img
          src="/icons/icon128.png"
          alt="AutoSync logo"
          className="header__logo-img"
        />
        <span className="header__title">AutoSync</span>
      </div>
      <nav className="header__nav">
        <button
          className={`header__nav-btn ${currentPage === 'dashboard' ? 'header__nav-btn--active' : ''}`}
          onClick={() => onNavigate('dashboard')}
        >
          Dashboard
        </button>
        <button
          className={`header__nav-btn ${currentPage === 'settings' ? 'header__nav-btn--active' : ''}`}
          onClick={() => onNavigate('settings')}
        >
          Settings
        </button>
      </nav>
    </header>
  );
};

export default Header;
