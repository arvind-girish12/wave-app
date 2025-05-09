import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { supabase } from '../utils/supabaseClient';
import { setUser, setSession, setLoading, clearAuth } from '../store/slices/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { user, session, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        dispatch(setSession(session));
        dispatch(setUser(session.user));
      }
      dispatch(setLoading(false));
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        dispatch(setSession(session));
        dispatch(setUser(session.user));
      } else {
        dispatch(clearAuth());
        router.push('/login');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [dispatch, router]);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      dispatch(clearAuth());
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return {
    user,
    session,
    loading,
    signOut,
    userId: user?.id,
  };
}; 