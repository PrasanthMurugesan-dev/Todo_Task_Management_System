import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User, AuthState, LoginCredentials, SignupCredentials, AuthContextType } from '@/types/auth';
import { useToast } from '@/hooks/use-toast';

type AuthAction = 
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGIN_FAILURE' }
  | { type: 'LOGOUT' }
  | { type: 'SIGNUP_START' }
  | { type: 'SIGNUP_SUCCESS'; payload: User }
  | { type: 'SIGNUP_FAILURE' }
  | { type: 'INITIALIZE'; payload: User | null };

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
    case 'SIGNUP_START':
      return {
        ...state,
        isLoading: true,
      };
    case 'LOGIN_SUCCESS':
    case 'SIGNUP_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'LOGIN_FAILURE':
    case 'SIGNUP_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case 'INITIALIZE':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        isLoading: false,
      };
    default:
      return state;
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demonstration (in production, this would be handled by your backend)
const mockUsers: User[] = [
  {
    id: '1',
    email: 'john@example.com',
    name: 'John Doe',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
    createdAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    email: 'jane@example.com',
    name: 'Jane Smith',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b772b631?w=32&h=32&fit=crop&crop=face',
    createdAt: new Date('2024-01-02'),
  },
];

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const { toast } = useToast();

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedUser = localStorage.getItem('auth_user');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          dispatch({ type: 'INITIALIZE', payload: user });
        } else {
          dispatch({ type: 'INITIALIZE', payload: null });
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        dispatch({ type: 'INITIALIZE', payload: null });
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock authentication logic
      const user = mockUsers.find(u => u.email === credentials.email);
      
      if (!user) {
        throw new Error('User not found');
      }
      
      // In production, you would verify the password hash
      if (credentials.password !== 'password') {
        throw new Error('Invalid password');
      }
      
      // Store user in localStorage
      localStorage.setItem('auth_user', JSON.stringify(user));
      
      dispatch({ type: 'LOGIN_SUCCESS', payload: user });
      
      toast({
        title: "Welcome back!",
        description: `Successfully logged in as ${user.name}`,
      });
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE' });
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Invalid credentials",
        variant: "destructive",
      });
      throw error;
    }
  };

  const signup = async (credentials: SignupCredentials): Promise<void> => {
    dispatch({ type: 'SIGNUP_START' });
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if user already exists
      const existingUser = mockUsers.find(u => u.email === credentials.email);
      if (existingUser) {
        throw new Error('User already exists');
      }
      
      // Validate password confirmation
      if (credentials.password !== credentials.confirmPassword) {
        throw new Error('Passwords do not match');
      }
      
      // Create new user
      const newUser: User = {
        id: Date.now().toString(),
        email: credentials.email,
        name: credentials.name,
        createdAt: new Date(),
      };
      
      // Add to mock users (in production, this would be handled by your backend)
      mockUsers.push(newUser);
      
      // Store user in localStorage
      localStorage.setItem('auth_user', JSON.stringify(newUser));
      
      dispatch({ type: 'SIGNUP_SUCCESS', payload: newUser });
      
      toast({
        title: "Account created!",
        description: `Welcome to TaskFlow, ${newUser.name}!`,
      });
    } catch (error) {
      dispatch({ type: 'SIGNUP_FAILURE' });
      toast({
        title: "Signup failed",
        description: error instanceof Error ? error.message : "Failed to create account",
        variant: "destructive",
      });
      throw error;
    }
  };

  const logout = (): void => {
    localStorage.removeItem('auth_user');
    dispatch({ type: 'LOGOUT' });
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
  };

  const loginWithProvider = async (provider: 'google' | 'github'): Promise<void> => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      // Simulate OAuth flow
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock successful OAuth login
      const mockUser: User = {
        id: Date.now().toString(),
        email: `user@${provider}.com`,
        name: `${provider.charAt(0).toUpperCase() + provider.slice(1)} User`,
        avatar: provider === 'google' 
          ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face'
          : 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=32&h=32&fit=crop&crop=face',
        createdAt: new Date(),
      };
      
      localStorage.setItem('auth_user', JSON.stringify(mockUser));
      dispatch({ type: 'LOGIN_SUCCESS', payload: mockUser });
      
      toast({
        title: "Welcome!",
        description: `Successfully logged in with ${provider.charAt(0).toUpperCase() + provider.slice(1)}`,
      });
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE' });
      toast({
        title: "Login failed",
        description: `Failed to login with ${provider}`,
        variant: "destructive",
      });
      throw error;
    }
  };

  const value: AuthContextType = {
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    login,
    signup,
    logout,
    loginWithProvider,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};