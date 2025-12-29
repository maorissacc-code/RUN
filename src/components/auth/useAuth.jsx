import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export function useAuth(requireAuth = false) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const validateSession = async () => {
      const sessionToken = localStorage.getItem('waiter_session');
      const cachedUser = localStorage.getItem('waiter_user');

      if (!sessionToken) {
        setLoading(false);
        if (requireAuth) {
          navigate(createPageUrl('Auth'));
        }
        return;
      }

      try {
        const response = await base44.functions.invoke('validateSession', {
          session_token: sessionToken
        });

        if (response.data.valid) {
          setUser(response.data.user);
          localStorage.setItem('waiter_user', JSON.stringify(response.data.user));
        } else {
          localStorage.removeItem('waiter_session');
          localStorage.removeItem('waiter_user');
          if (requireAuth) {
            navigate(createPageUrl('Auth'));
          }
        }
      } catch (error) {
        localStorage.removeItem('waiter_session');
        localStorage.removeItem('waiter_user');
        if (requireAuth) {
          navigate(createPageUrl('Auth'));
        }
      } finally {
        setLoading(false);
      }
    };

    validateSession();
  }, [requireAuth, navigate]);

  const logout = () => {
    localStorage.removeItem('waiter_session');
    localStorage.removeItem('waiter_user');
    navigate(createPageUrl('Auth'));
  };

  return { user, loading, logout };
}