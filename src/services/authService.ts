import { account, handleAppwriteError } from '../lib/appwrite';
import { AdminUser } from '../types';

let userCache: AdminUser | null = null;
let lastFetch: number = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Check if user is authenticated
 */
export const checkAuth = async (): Promise<AdminUser | null> => {
  try {
    // Check cache first
    const now = Date.now();
    if (userCache && now - lastFetch < CACHE_TTL) {
      return userCache;
    }

    // Get current session
    const session = await account.getSession('current');
    if (!session) {
      userCache = null;
      return null;
    }

    // Get user info
    const user = await account.get();

    userCache = user;
    lastFetch = now;
    return user;
  } catch (error) {
    // If there's an error getting session, user is not logged in
    userCache = null;
    return null;
  }
};

/**
 * Login with email and password
 */
export const login = async (email: string, password: string): Promise<AdminUser> => {
  try {
    // Clear cache
    userCache = null;
    lastFetch = 0;

    // Create email session
    await account.createEmailPasswordSession(email, password);

    // Get user info
    const user = await account.get();

    userCache = user;
    lastFetch = Date.now();
    return user;
  } catch (error) {
    const message = handleAppwriteError(error);
    
    // Provide more specific error messages
    if (message.includes('Invalid credentials') || message.includes('401')) {
      throw new Error('Invalid email or password');
    } else if (message.includes('rate limit')) {
      throw new Error('Too many login attempts. Please try again later.');
    } else {
      throw new Error('Login failed. Please try again.');
    }
  }
};

/**
 * Logout current session
 */
export const logout = async (): Promise<void> => {
  try {
    await account.deleteSession('current');
    userCache = null;
    lastFetch = 0;
  } catch (error) {
    // Even if logout fails, clear local cache
    userCache = null;
    lastFetch = 0;
    console.error('Logout error:', error);
  }
};

/**
 * Clear authentication cache
 */
export const clearAuthCache = (): void => {
  userCache = null;
  lastFetch = 0;
};

/**
 * Get current user from cache without API call
 */
export const getCachedUser = (): AdminUser | null => {
  return userCache;
};