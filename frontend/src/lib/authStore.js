import { create } from 'zustand';

const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('crowdfix_token') || null,

  setAuth: (user, token) => {
    localStorage.setItem('crowdfix_token', token);
    set({ user, token });
  },

  logout: () => {
    localStorage.removeItem('crowdfix_token');
    set({ user: null, token: null });
  },
}));

export default useAuthStore;