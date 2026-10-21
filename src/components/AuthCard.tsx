import React, { useState } from 'react';
import { User } from '../types';
import { getStoredUsers, saveUsers, setCurrentUserId } from '../storage';

interface Props {
  onUserSelected: (user: User) => void;
  currentUser: User | null;
}

export const AuthCard: React.FC<Props> = ({ onUserSelected, currentUser }) => {
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regStatus, setRegStatus] = useState<{ text: string; success: boolean } | null>(null);

  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginStatus, setLoginStatus] = useState<{ text: string; success: boolean } | null>(null);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const usernameTrimmed = regUsername.trim();
    if (!usernameTrimmed || !regPassword.trim()) {
      setRegStatus({ text: '⚠️ Please enter both username and password.', success: false });
      return;
    }

    const users = getStoredUsers();
    if (users.some(u => u.username.toLowerCase() === usernameTrimmed.toLowerCase())) {
      setRegStatus({ text: '❌ Username already exists. Please pick another.', success: false });
      return;
    }

    const newUser: User = {
      id: Date.now(),
      username: usernameTrimmed,
      calorieTarget: 2000,
      proteinTarget: 120,
      startingWeight: 75.0
    };

    users.push(newUser);
    saveUsers(users);
    setCurrentUserId(newUser.id);
    setRegStatus({ text: '✅ Account created successfully! Logged in.', success: true });
    setRegUsername('');
    setRegPassword('');
    onUserSelected(newUser);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const usernameTrimmed = loginUsername.trim();
    if (!usernameTrimmed || !loginPassword.trim()) {
      setLoginStatus({ text: '⚠️ Please provide your username and password.', success: false });
      return;
    }

    const users = getStoredUsers();
    const found = users.find(u => u.username.toLowerCase() === usernameTrimmed.toLowerCase());

    if (!found) {
      // In development/demo, allow any account or report not found
      setLoginStatus({ text: '❌ Invalid credentials. Username not found.', success: false });
      return;
    }

    setCurrentUserId(found.id);
    setLoginStatus({ text: `✅ Login successful! Welcome ${found.username}!`, success: true });
    setLoginUsername('');
    setLoginPassword('');
    onUserSelected(found);
  };

  return (
    <div className="auth-section">
      <div className="dashboard-card">
        <h2>Create Account</h2>
        <form id="register-form" onSubmit={handleRegister}>
          <input
            type="text"
            id="reg-username"
            placeholder="Username"
            value={regUsername}
            onChange={e => setRegUsername(e.target.value)}
            required
          />
          <input
            type="password"
            id="reg-password"
            placeholder="Password"
            value={regPassword}
            onChange={e => setRegPassword(e.target.value)}
            required
          />
          <button type="submit">Register</button>
        </form>
        {regStatus && (
          <p
            id="register-status"
            className="status-msg"
            style={{ color: regStatus.success ? '#10b981' : '#f43f5e' }}
          >
            {regStatus.text}
          </p>
        )}
      </div>

      <div className="dashboard-card">
        <h2>Login</h2>
        <form id="login-form" onSubmit={handleLogin}>
          <input
            type="text"
            id="username"
            placeholder="Username"
            value={loginUsername}
            onChange={e => setLoginUsername(e.target.value)}
            required
          />
          <input
            type="password"
            id="password"
            placeholder="Password"
            value={loginPassword}
            onChange={e => setLoginPassword(e.target.value)}
            required
          />
          <button type="submit">Login</button>
        </form>
        {loginStatus && (
          <p
            id="login-status"
            className="status-msg"
            style={{ color: loginStatus.success ? '#10b981' : '#f43f5e' }}
          >
            {loginStatus.text}
          </p>
        )}

        {currentUser && (
          <div style={{ marginTop: '12px', fontSize: '13px', color: 'var(--text-muted)' }}>
            Currently active: <strong style={{ color: 'var(--text-main)' }}>{currentUser.username}</strong>
          </div>
        )}
      </div>
    </div>
  );
};
