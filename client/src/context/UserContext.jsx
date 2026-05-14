import React, { useState, useEffect } from 'react';
import { UserContext } from './UserContextDef';
import API_URL from '../api';

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
    setLoading(false);
  }, []);

  const loginUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logoutUser = async () => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      try {
        await fetch(`${API_URL}/api/auth/logout`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${accessToken}` },
        });
      } catch (_) {
        // Ignorar errores de red al hacer logout
      }
    }
    setUser(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  };

  return (
    <UserContext.Provider value={{ user, setUser, loginUser, logoutUser, loading }}>
      {children}
    </UserContext.Provider>
  );
}
