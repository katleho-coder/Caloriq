import React from 'react';
import { User } from '../types';
import { useTheme } from '../context/ThemeContext';

interface Props {
  currentUser: User | null;
  onLogout: () => void;
  showAuth: boolean;
  onToggleAuth: () => void;
  showAIChat: boolean;
  onToggleAIChat: () => void;
}

export const Header: React.FC<Props> = ({
  currentUser,
  onLogout,
  showAuth,
  onToggleAuth,
  showAIChat,
  onToggleAIChat
}) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="header">
      <div className="header-brand">
        <div className="brand-logo-badge" title="Caloriq Nutrition">
          🍎
        </div>
        <div>
          <h1>Caloriq</h1>
          <p>Your daily nutrition & fitness dashboard</p>
        </div>
      </div>

      <div className="header-user-actions">
        {/* Sophisticated Theme Toggle Button */}
        <button
          type="button"
          className="btn-theme-toggle"
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          aria-label="Toggle theme"
        >
          <span className="theme-toggle-icon">
            {theme === 'dark' ? '☀️' : '🌙'}
          </span>
          <span className="theme-toggle-label">
            {theme === 'dark' ? 'Light' : 'Dark'}
          </span>
        </button>

        {currentUser ? (
          <>
            <div className="user-badge">
              <span>👤</span>
              <strong>{currentUser.username}</strong>
              <span className="user-badge-target">
                ({currentUser.calorieTarget} kcal / {currentUser.proteinTarget}g)
              </span>
            </div>

            <button
              type="button"
              className="btn-ai-toggle"
              onClick={onToggleAIChat}
            >
              <span>✨</span>
              <span>{showAIChat ? 'Hide AI Coach' : 'AI Coach'}</span>
            </button>

            <button type="button" className="btn-secondary" onClick={onToggleAuth}>
              {showAuth ? 'Hide Account' : 'Switch / Add'}
            </button>

            <button type="button" className="btn-secondary" onClick={onLogout}>
              Log out
            </button>
          </>
        ) : (
          <button type="button" onClick={onToggleAuth}>
            {showAuth ? 'Close Account Form' : 'Login / Register'}
          </button>
        )}
      </div>
    </header>
  );
};
