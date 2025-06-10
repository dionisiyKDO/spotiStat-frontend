import type { UserInfo } from "$lib/types";

export async function checkLoginStatus() {
    const res = await fetch("/api/auth/session");
    const data = await res.json();
    return data;
}

export async function fetchUserInfo(): Promise<UserInfo | null> {
    try {
        const response = await fetch("/api/spotify/profile");
        if (!response.ok) {
            const data = await response.json();
            const error = data.error || "Failed to fetch user info";
            console.log(error);
            return null;
        }

        const data = (await response.json()) as { user_info: UserInfo };
        return data.user_info;
    } catch (err) {
        console.log(err);
        return null;
    }
}














import { writable } from 'svelte/store';

// Create reactive stores for authentication state
export const isLoggedIn = writable(false);
export const currentUser = writable(null);
export const loading = writable(false);

// Authentication functions
export const authStore = {
  // Check if user is logged in (call on app initialization)
  async checkSession() {
    loading.set(true);
    try {
      const response = await fetch('/auth/session');
      const data = await response.json();
      
      if (data.logged_in) {
        isLoggedIn.set(true);
        currentUser.set({
          id: data.user_id,
          username: data.username
        });
      } else {
        isLoggedIn.set(false);
        currentUser.set(null);
      }
    } catch (error) {
      console.error('Session check failed:', error);
      isLoggedIn.set(false);
      currentUser.set(null);
    } finally {
      loading.set(false);
    }
  },

  // Login function
  async login(username, password) {
    loading.set(true);
    try {
      const response = await fetch('/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (response.ok) {
        isLoggedIn.set(true);
        currentUser.set({
          id: data.user_id,
          username: data.username
        });
        return { success: true, message: data.message };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      return { success: false, error: 'Network error. Please try again.' };
    } finally {
      loading.set(false);
    }
  },

  // Register function
  async register(username, password) {
    loading.set(true);
    try {
      const response = await fetch('/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, message: data.message };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      return { success: false, error: 'Network error. Please try again.' };
    } finally {
      loading.set(false);
    }
  },

  // Logout function
  async logout() {
    loading.set(true);
    try {
      const response = await fetch('/auth/logout');
      const data = await response.json();
      
      isLoggedIn.set(false);
      currentUser.set(null);
      
      return { success: true, message: data.message };
    } catch (error) {
      // Even if the request fails, clear local state
      isLoggedIn.set(false);
      currentUser.set(null);
      return { success: false, error: 'Logout failed' };
    } finally {
      loading.set(false);
    }
  }
};