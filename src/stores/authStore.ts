import { create } from 'zustand';
import { User, UserRole } from '../types';
import { supabase } from '../lib/supabase';

// Helper to determine if we're in production (using a variable instead of a function)
const isProduction = window.location.hostname === 'personify.mobi' || 
                     window.location.hostname === 'www.personify.mobi';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => void;
  signup: (email: string, password: string, name: string, role: UserRole) => Promise<void>;
  checkAuth: () => void;
  updateProfile: (data: { name?: string, avatar?: string }) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    
    try {
      // Use Supabase Auth for authentication
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        throw error;
      }
      
      if (data.user) {
        try {
          // Fetch user details from the users table
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.user.id)
            .single();
          
          if (userError) {
            // If error is "no rows returned", create the user profile
            if (userError.message.includes('no rows') || userError.code === 'PGRST116') {
              // Get user metadata for defaults
              const metadata = data.user.user_metadata || {};
              
              // Create entry in the users table
              const { data: newUserData, error: insertError } = await supabase
                .from('users')
                .insert({
                  id: data.user.id,
                  email: data.user.email as string,
                  name: metadata.name || data.user.email,
                  role: (metadata.role as UserRole) || 'doctor' // Default to doctor role
                })
                .select('*')
                .single();
              
              if (insertError) {
                throw insertError;
              }
              
              const user: User = {
                id: newUserData.id,
                email: newUserData.email,
                name: newUserData.name,
                role: newUserData.role as UserRole,
                avatar: newUserData.avatar_url || undefined,
              };
              
              set({ user, isAuthenticated: true, isLoading: false });
              return;
            } else {
              throw userError;
            }
          }
          
          const user: User = {
            id: userData.id,
            email: userData.email,
            name: userData.name,
            role: userData.role as UserRole,
            avatar: userData.avatar_url || undefined,
          };
          
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (userFetchError: any) {
          set({ 
            error: userFetchError.message || 'Failed to retrieve user profile. Please try again.', 
            isLoading: false,
            isAuthenticated: false,
            user: null
          });
        }
      }
    } catch (error: any) {
      set({ 
        error: error.message || 'Authentication failed. Please try again.', 
        isLoading: false,
        isAuthenticated: false,
        user: null
      });
    }
  },
  
  signInWithGoogle: async () => {
    set({ isLoading: true, error: null });
    
    try {
      // Set the correct redirect URL based on environment
      const redirectTo = isProduction
        ? 'https://www.personify.mobi/auth/callback'
        : `${window.location.origin}/auth/callback`;

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      });
      
      if (error) {
        throw error;
      }
      
      // Note: We don't need to set user state here because the redirect will happen
      // and the checkAuth function will handle setting the user state when the page reloads
      
      set({ isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.message || 'Google sign-in failed. Please try again.', 
        isLoading: false 
      });
    }
  },
  
  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, isAuthenticated: false });
  },
  
  signup: async (email, password, name, role) => {
    set({ isLoading: true, error: null });
    
    try {
      // 1. Create the user in Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role
          }
        }
      });
      
      if (error) {
        // Check if user already exists
        if (error.message === 'User already registered') {
          // Try to sign in instead
          return await useAuthStore.getState().login(email, password);
        }
        throw error;
      }
      
      if (!data.user) {
        throw new Error('Failed to create user account');
      }
      
      // 2. Create entry in the users table
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          email: data.user.email as string,
          name: name,
          role: role
        });
      
      if (insertError) {
        throw insertError;
      }
      
      // 3. Create user object and set state
      const user: User = {
        id: data.user.id,
        email: data.user.email as string,
        name: name,
        role: role,
      };
      
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to create account. Please try again.', 
        isLoading: false,
        isAuthenticated: false,
        user: null
      });
    }
  },
  
  checkAuth: async () => {
    try {
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        try {
          // Fetch user details from the users table
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (userError) {
            // If error is "no rows returned", create the user profile
            if (userError.message.includes('no rows') || userError.code === 'PGRST116') {
              // Get user metadata for defaults
              const metadata = session.user.user_metadata || {};
              
              // Default name from Google if available, else use email
              const name = metadata.full_name || metadata.name || session.user.email;
              
              // Create entry in the users table
              const { data: newUserData, error: insertError } = await supabase
                .from('users')
                .insert({
                  id: session.user.id,
                  email: session.user.email as string,
                  name: name,
                  role: (metadata.role as UserRole) || 'doctor', // Default to doctor role
                  avatar_url: metadata.avatar_url || null
                })
                .select('*')
                .single();
              
              if (insertError) {
                throw insertError;
              }
              
              const user: User = {
                id: newUserData.id,
                email: newUserData.email,
                name: newUserData.name,
                role: newUserData.role as UserRole,
                avatar: newUserData.avatar_url || undefined,
              };
              
              set({ user, isAuthenticated: true });
              return;
            } else {
              throw userError;
            }
          }
          
          const user: User = {
            id: userData.id,
            email: userData.email,
            name: userData.name,
            role: userData.role as UserRole,
            avatar: userData.avatar_url || undefined,
          };
          
          set({ user, isAuthenticated: true });
        } catch (userFetchError) {
          set({ user: null, isAuthenticated: false });
        }
      }
    } catch (error) {
      set({ user: null, isAuthenticated: false });
    }
  },
  
  updateProfile: async (data) => {
    set({ isLoading: true, error: null });
    
    try {
      const user = get().user;
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      // Prepare update data
      const updateData: any = {};
      if (data.name) updateData.name = data.name;
      if (data.avatar) updateData.avatar_url = data.avatar;
      
      // Update user in database
      const { error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', user.id);
      
      if (error) {
        throw error;
      }
      
      // Update user in state
      set({ 
        user: { 
          ...user, 
          name: data.name || user.name,
          avatar: data.avatar || user.avatar
        },
        isLoading: false 
      });
    } catch (error: any) {
      set({ error: error.message || 'Failed to update profile', isLoading: false });
    }
  }
}));