import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface AdminAuthState {
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  userId: string | null;
}

export const useAdminAuth = (requiredRole: 'admin' | 'driver' = 'admin') => {
  const navigate = useNavigate();
  const [state, setState] = useState<AdminAuthState>({
    isLoading: true,
    isAuthenticated: false,
    isAdmin: false,
    userId: null,
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setState({ isLoading: false, isAuthenticated: false, isAdmin: false, userId: null });
          navigate('/');
          return;
        }

        // Check user role
        const { data: roles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        const hasRequiredRole = roles?.some(r => 
          requiredRole === 'admin' ? r.role === 'admin' : ['admin', 'driver'].includes(r.role)
        );

        if (!hasRequiredRole) {
          setState({ isLoading: false, isAuthenticated: true, isAdmin: false, userId: user.id });
          navigate('/');
          return;
        }

        setState({
          isLoading: false,
          isAuthenticated: true,
          isAdmin: roles?.some(r => r.role === 'admin') || false,
          userId: user.id,
        });
      } catch (error) {
        console.error('Auth check failed:', error);
        setState({ isLoading: false, isAuthenticated: false, isAdmin: false, userId: null });
        navigate('/');
      }
    };

    checkAuth();
  }, [navigate, requiredRole]);

  return state;
};
